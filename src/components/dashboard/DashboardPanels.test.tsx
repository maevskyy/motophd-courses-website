import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseCardCourse } from '@/lib/data';
import { progressStorageKey } from '@/lib/progress';
import { createMemoryStorage } from '@/lib/progress/storage.mock';
import { AvailableCoursesSection, MyCoursesPanel } from './DashboardPanels';
import type { MyCourseData } from './MyCourse';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));

vi.mock('@/lib/auth/account', () => ({
  updateProfileAction: vi.fn()
}));

vi.mock('@/lib/payments/checkout', () => ({
  checkoutAction: vi.fn()
}));

const lean: MyCourseData = {
  currency: 'EUR',
  icon: 'motorcycle',
  modules: [
    {
      lessons: [{ durationSec: 600, hasPdf: false, order: 1, title: 'Video Lesson' }],
      number: '01',
      title: 'Level 01 — Theory'
    },
    {
      lessons: [
        { durationSec: 300, hasPdf: false, order: 2, title: 'Video Tutorial' },
        { durationSec: null, hasPdf: true, order: 3, title: 'Motorcycle Preparation' }
      ],
      number: '02',
      title: 'Level 02 — Preparation'
    }
  ],
  slug: 'lean',
  title: 'Lean with confidence',
  upgradePrice: 100
};

const braking: MyCourseData = {
  ...lean,
  modules: [
    {
      lessons: [{ durationSec: 120, hasPdf: false, order: 1, title: 'Brake Intro' }],
      number: '1',
      title: 'The Art of Braking'
    }
  ],
  slug: 'braking',
  title: 'The Art of Braking'
};

const available: CourseCardCourse = {
  currency: 'EUR',
  description: '',
  icon: 'flag',
  imageTone: 'green',
  includes: [],
  pain: '',
  priceFeedback: 129,
  priceStandard: 29,
  slug: 'counter-steering',
  title: 'Counter steering'
};

const storeProgress = (slug: string, done: number[]) =>
  window.localStorage.setItem(
    progressStorageKey(slug),
    JSON.stringify({ done, updatedAt: '2026-01-01' })
  );

describe('MyCoursesPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts the course from the first lesson when there is no progress', () => {
    render(<MyCoursesPanel courses={[lean]} name="Student" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('dashboard.welcomeTitle');
    expect(screen.getByRole('link', { name: 'startCourse' })).toHaveAttribute('href', '/learn/lean/1');
    expect(screen.getByRole('link', { name: /lean with confidence/i })).toHaveAttribute(
      'href',
      '/learn/lean/1'
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
  });

  it('resumes from the next unfinished lesson and marks done lessons', async () => {
    storeProgress('lean', [1]);
    render(<MyCoursesPanel courses={[lean]} name="Student" />);

    expect(await screen.findByRole('link', { name: 'resumeLesson' })).toHaveAttribute(
      'href',
      '/learn/lean/2'
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
    // Пройденный урок — в свёрнутом модуле, поэтому ищем и среди скрытых.
    expect(
      screen.getByRole('link', { hidden: true, name: /lessonDone\s*video lesson/i })
    ).toHaveAttribute('href', '/learn/lean/1');
    expect(screen.getByRole('link', { name: /motorcycle preparation\s*lessonPdf/i })).toHaveAttribute(
      'href',
      '/learn/lean/3'
    );
  });

  it('opens only the module with the next lesson', async () => {
    storeProgress('lean', [1]);
    render(<MyCoursesPanel courses={[lean]} name="Student" />);

    expect(await screen.findByRole('button', { expanded: true })).toHaveTextContent(
      'Level 02 — Preparation'
    );
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Level 01 — Theory');
  });

  it('renders one block per purchased course', () => {
    render(<MyCoursesPanel courses={[lean, braking]} name="Student" />);

    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /the art of braking/i })).toHaveAttribute(
      'href',
      '/learn/braking/1'
    );
  });

  it('offers the feedback upgrade only for courses in feedbackUpgradeSlugs', () => {
    render(
      <MyCoursesPanel courses={[lean, braking]} feedbackUpgradeSlugs={['braking']} name="Student" />
    );

    const buttons = screen.getAllByRole('button', { name: 'feedbackUpgrade' });

    expect(buttons).toHaveLength(1);
    expect(within(document.getElementById('upgrade') as HTMLElement).getByRole('button')).toBe(
      buttons[0]
    );
    expect(screen.getByText('feedbackPrice')).toBeInTheDocument();
  });

  it('shows the connected status with a link to /feedback once feedback is paid', () => {
    render(<MyCoursesPanel courses={[lean]} hasFeedback name="Student" />);

    expect(screen.queryByRole('button', { name: 'feedbackUpgrade' })).not.toBeInTheDocument();
    expect(screen.getByText('feedbackConnected')).toBeVisible();
    expect(screen.getByRole('link', { name: 'feedbackSend' })).toHaveAttribute('href', '/feedback');
  });

  it('hides the feedback card without an upgrade or paid feedback', () => {
    render(<MyCoursesPanel courses={[lean]} name="Student" />);

    expect(screen.queryByText('feedbackTitle')).not.toBeInTheDocument();
    expect(document.getElementById('upgrade')).toBeNull();
  });

  it('puts the #upgrade anchor on the first feedback card only', () => {
    render(
      <MyCoursesPanel
        courses={[lean, braking]}
        feedbackUpgradeSlugs={['lean', 'braking']}
        name="Student"
      />
    );

    expect(document.querySelectorAll('#upgrade')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'feedbackUpgrade' })).toHaveLength(2);
  });
});

describe('AvailableCoursesSection', () => {
  it('renders nothing without courses to buy', () => {
    const { container } = render(<AvailableCoursesSection availableCourses={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('links unpurchased courses to their sales page', () => {
    render(<AvailableCoursesSection availableCourses={[available]} />);

    expect(screen.getByText('dashboard.availableToPurchase')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /counter steering/i })).toHaveAttribute(
      'href',
      '/courses/counter-steering'
    );
  });
});
