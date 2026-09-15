import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { CoursePlayerClient } from './CoursePlayerClient';
import { SIDEBAR_STORAGE_KEY } from './usePlayerSidebar';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

const player: PlayerContent = {
  currentLessonOrder: 3,
  downloads: [
    { id: 4, title: 'Motorcycle Preparation', url: '/api/lessons/4/pdf?locale=en' },
    { id: 9, title: 'Flick Technique', url: '/api/lessons/9/pdf?locale=en' }
  ],
  feel: 'Calm',
  lessonCount: 4,
  lessonNumber: 3,
  moduleOutcome: ['Know your lean reserve'],
  notes: ['Look through the turn'],
  overviewCopy: 'Mental foundation first.',
  overviewTitle: 'Module 1 — Understanding Lean Angle',
  sidebarTitle: 'Stop Being Afraid to Lean',
  subtitle: 'Physics removes fear.',
  title: 'L3',
  videoEmbedUrl: null,
  videoMeta: 'MotoPhD Online'
};

const curriculum: CurriculumModule[] = [
  { lessons: [{ duration: '', name: 'L1', order: 1 }], number: '01', title: 'Theory' },
  {
    lessons: [2, 3, 4].map((order) => ({ duration: '', name: `L${order}`, order })),
    number: '02',
    title: 'Prep'
  }
];

// Node 22+ подставляет собственный `localStorage` (undefined без
// `--localstorage-file`) поверх jsdom-овского — подменяем in-memory реализацией.
const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, String(value));
    }
  };
};

const renderPlayer = (overrides: Partial<PlayerContent> = {}) =>
  render(
    <CoursePlayerClient courseSlug="lean" curriculum={curriculum} player={{ ...player, ...overrides }} />
  );
const heading = () => screen.getByRole('heading', { level: 1 });
const lessonLink = (order: number) => screen.getByRole('link', { name: `L${order}` });
// Узкий экран: matchMedia отвечает «да» на запрос drawer-режима.
const stubNarrow = () =>
  vi.stubGlobal('matchMedia', (media: string) => ({
    addEventListener: vi.fn(),
    matches: true,
    media,
    removeEventListener: vi.fn()
  }));

describe('CoursePlayerClient', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the current lesson and links every sidebar lesson to ?lesson=<order>', () => {
    renderPlayer();

    expect(heading()).toHaveTextContent('L3');
    expect(screen.getByText('Physics removes fear.')).toBeInTheDocument();
    expect(screen.getByText('lessonMeta {"current":3,"total":4}')).toBeInTheDocument();
    expect(screen.getByText('videoUnavailable')).toBeInTheDocument();
    expect(lessonLink(3)).toHaveAttribute('href', '/learn/lean?lesson=3');
    expect(lessonLink(3)).toHaveAttribute('aria-current', 'page');
    expect(lessonLink(4)).toHaveAttribute('href', '/learn/lean?lesson=4');
    expect(lessonLink(4)).not.toHaveAttribute('aria-current');
    // Прогресса нет (ADR-9): ни шкалы, ни отметок «пройдено».
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.backToDashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('switches between notes, downloads and overview', () => {
    renderPlayer();

    expect(screen.getByText('Look through the turn')).toBeInTheDocument();
    expect(screen.getByText('Calm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'downloads' }));

    expect(screen.getByRole('link', { name: /motorcycle preparation/i })).toHaveAttribute(
      'href',
      '/api/lessons/4/pdf?locale=en'
    );
    expect(screen.getByRole('link', { name: /flick technique/i })).toHaveAttribute(
      'href',
      '/api/lessons/9/pdf?locale=en'
    );

    fireEvent.click(screen.getByRole('tab', { name: 'overview' }));

    expect(screen.getByText('Module 1 — Understanding Lean Angle')).toBeInTheDocument();
    expect(screen.getByText('Mental foundation first.')).toBeInTheDocument();
    expect(screen.getByText('Know your lean reserve')).toBeInTheDocument();
  });

  it('puts the contents on the left of the lesson', () => {
    renderPlayer();

    const aside = screen.getByRole('complementary');
    const main = screen.getByRole('main');

    expect(aside.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(aside).toContainElement(screen.getByRole('navigation', { name: 'player.contents' }));
  });

  it('lists every module open and lets a module be collapsed and reopened', () => {
    renderPlayer();

    const theory = screen.getByRole('button', { name: /Theory/ });

    expect(theory).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Prep/ })).toHaveAttribute('aria-expanded', 'true');
    expect(lessonLink(1)).toHaveAttribute('href', '/learn/lean?lesson=1');

    fireEvent.click(theory);

    expect(theory).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'L1' })).not.toBeInTheDocument();

    fireEvent.click(theory);

    expect(lessonLink(1)).toBeInTheDocument();
  });

  it('collapses to a rail, persists the state and restores it on the next mount', () => {
    const { unmount } = renderPlayer();

    fireEvent.click(screen.getByRole('button', { name: 'player.collapseSidebar' }));

    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('collapsed');
    expect(screen.queryByRole('link', { name: 'L3' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prep' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Theory' })).toHaveAttribute('href', '/learn/lean?lesson=1');

    fireEvent.click(screen.getByRole('button', { name: 'expandSidebar' }));

    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('open');
    expect(lessonLink(3)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'player.collapseSidebar' }));
    unmount();
    renderPlayer();

    expect(screen.getByRole('button', { name: 'expandSidebar' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'L3' })).not.toBeInTheDocument();
  });

  it('on a narrow screen opens the contents as a drawer and closes it on Escape', () => {
    stubNarrow();
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');

    renderPlayer();

    // Свёрнутость на узком экране не действует — вместо рейла drawer.
    expect(screen.queryByRole('button', { name: 'expandSidebar' })).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'contents' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'player.closeContents' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'closeContents' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes the drawer on a click outside and when the lesson changes', () => {
    stubNarrow();
    const { rerender } = renderPlayer();
    const toggle = screen.getByRole('button', { name: 'contents' });

    fireEvent.click(toggle);
    // Backdrop — «Закрыть оглавление» без префикса; кнопка в шапке drawer — player.closeContents.
    fireEvent.click(screen.getByRole('button', { name: 'closeContents' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <CoursePlayerClient
        courseSlug="lean"
        curriculum={curriculum}
        player={{ ...player, currentLessonOrder: 4, lessonNumber: 4, title: 'L4' }}
      />
    );

    expect(heading()).toHaveTextContent('L4');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
