import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CurriculumModule, PlayerContent, PlayerLesson } from '@/lib/data';
import { progressStorageKey } from '@/lib/progress';
import { createMemoryStorage } from '@/lib/progress/storage.mock';
import { CoursePlayerClient } from './CoursePlayerClient';
import { SIDEBAR_STORAGE_KEY } from './usePlayerSidebar';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/learn/lean/3',
  useRouter: () => ({ push: mocks.push })
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

vi.mock('@payloadcms/richtext-lexical/react', () => ({
  RichText: ({ className }: { className?: string }) => (
    <div className={className} data-testid="rich-text" />
  )
}));

const makeLesson = (order: number, overrides: Partial<PlayerLesson> = {}): PlayerLesson => ({
  body: null,
  download: null,
  id: order,
  module: order === 1 ? 1 : 2,
  order,
  title: `L${order}`,
  type: 'video',
  videoEmbedUrl: null,
  ...overrides
});

const body: NonNullable<PlayerLesson['body']> = {
  root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 }
};

const player: PlayerContent = {
  courseSlug: 'lean',
  courseTitle: 'Lean',
  feel: 'Calm',
  keyTakeaways: ['Look through the turn'],
  lessons: [
    makeLesson(1),
    makeLesson(2),
    makeLesson(3, { body }),
    makeLesson(4, {
      download: { fileName: 'lesson-4.pdf', id: 4, title: 'Видеоролик', url: '/api/lessons/4/pdf' },
      type: 'pdf'
    })
  ]
};

const curriculum: CurriculumModule[] = [
  { lessons: [{ duration: '', name: 'L1' }], number: '01', title: 'Theory' },
  {
    lessons: [2, 3, 4].map((order) => ({ duration: '', name: `L${order}` })),
    number: '02',
    title: 'Prep'
  }
];

const key = progressStorageKey('lean');
const storedDone = () => JSON.parse(window.localStorage.getItem(key) ?? '{}').done;
const heading = () => screen.getByRole('heading', { level: 1 });
const contents = () => screen.getByRole('navigation', { name: 'player.contents' });
const lessonLink = (order: number) => screen.getByRole('link', { name: new RegExp(`L${order}(pdf)?$`) });
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
    mocks.push.mockReset();
  });

  it('opens the lesson from the URL, marks it done and continues to the next one', () => {
    render(<CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />);

    expect(heading()).toHaveTextContent('L3');
    expect(screen.getByText('lessonMeta {"lesson":3,"module":2,"total":4}')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /prevLesson/ })).toHaveAttribute('href', '/learn/lean/2');
    expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    expect(screen.getByText('Look through the turn')).toBeInTheDocument();
    expect(lessonLink(3)).toHaveAttribute('aria-current', 'page');
    expect(lessonLink(4)).toHaveAttribute('href', '/learn/lean/4');
    expect(lessonLink(4)).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'L4pdf' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /lessonDone/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /completeAndContinue/ }));

    expect(storedDone()).toEqual([3]);
    expect(screen.getByRole('link', { name: 'lessonDoneL3' })).toBeInTheDocument();
    expect(mocks.push).toHaveBeenCalledWith('/learn/lean/4');
  });

  it('puts the contents on the left of the lesson and counts progress from storage', () => {
    window.localStorage.setItem(key, JSON.stringify({ done: [1, 2], updatedAt: '2026-01-01' }));

    render(<CoursePlayerClient curriculum={curriculum} player={player} />);

    const aside = screen.getByRole('complementary');
    const main = screen.getByRole('main');

    expect(aside.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(aside).toContainElement(contents());
    expect(heading()).toHaveTextContent('L3');
    expect(screen.getByRole('progressbar', { name: 'player.courseProgress' })).toHaveAttribute(
      'value',
      '2'
    );
    expect(screen.getByText('player.lessonsComplete {"done":2,"total":4}')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'dashboard.myCourse' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: 'actions.backToWebsite' })).toHaveAttribute('href', '/');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('opens the module of the active lesson and lets the others be toggled', () => {
    render(<CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />);

    const theory = screen.getByRole('button', { name: /Theory/ });

    expect(theory).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /Prep/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('link', { name: /L1$/ })).not.toBeInTheDocument();

    fireEvent.click(theory);

    expect(theory).toHaveAttribute('aria-expanded', 'true');
    expect(lessonLink(1)).toHaveAttribute('href', '/learn/lean/1');
  });

  it('collapses to a rail, persists the state and restores it on the next mount', () => {
    const { unmount } = render(
      <CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'player.collapseSidebar' }));

    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('collapsed');
    expect(screen.queryByRole('navigation', { name: 'contents' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /L3$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prep' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Theory' })).toHaveAttribute('href', '/learn/lean/1');

    fireEvent.click(screen.getByRole('button', { name: 'expandSidebar' }));

    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('open');
    expect(lessonLink(3)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'player.collapseSidebar' }));
    unmount();
    render(<CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />);

    expect(screen.getByRole('button', { name: 'expandSidebar' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /L3$/ })).not.toBeInTheDocument();
  });

  it('on a narrow screen opens the contents as a drawer and closes it on Escape', () => {
    stubNarrow();
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');

    render(<CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />);

    // Свёрнутость на узком экране не действует — вместо рейла drawer.
    expect(screen.queryByRole('button', { name: 'expandSidebar' })).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'contents' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'closeContents' })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'player.closeContents' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'closeContents' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes the drawer on a click outside and on a lesson change', () => {
    stubNarrow();
    const { rerender } = render(
      <CoursePlayerClient activeOrder={3} curriculum={curriculum} player={player} />
    );
    const toggle = screen.getByRole('button', { name: 'contents' });

    fireEvent.click(toggle);
    // Backdrop — «Закрыть оглавление» без префикса; кнопка в шапке drawer — player.closeContents.
    fireEvent.click(screen.getByRole('button', { name: 'closeContents' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    act(() => {
      rerender(<CoursePlayerClient activeOrder={4} curriculum={curriculum} player={player} />);
    });

    expect(heading()).toHaveTextContent('L4');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('starts from the first lesson without progress and disables "previous"', () => {
    render(<CoursePlayerClient curriculum={curriculum} player={player} />);

    expect(heading()).toHaveTextContent('L1');
    expect(screen.queryByRole('link', { name: /prevLesson/ })).not.toBeInTheDocument();
    expect(screen.getByText('prevLesson').closest('[aria-disabled="true"]')).not.toBeNull();
  });

  it('on the last lesson leads to the dashboard and lists only that lesson PDF by file name', () => {
    render(<CoursePlayerClient activeOrder={4} curriculum={curriculum} player={player} />);

    expect(screen.getByText('pdfForLesson')).toBeInTheDocument();
    expect(screen.getByText('lesson-4.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Видеоролик')).not.toBeInTheDocument();
    expect(screen.queryByText('videoUnavailable')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'finishCourse' }));

    expect(storedDone()).toEqual([4]);
    expect(mocks.push).toHaveBeenCalledWith('/dashboard');
  });
});
