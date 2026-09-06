import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  getFeedbackUpgradeCourseSlugs,
  type FeedbackUpgradeCandidate
} from '@/lib/access/feedbackUpgrade';
import type { CourseCardCourse, DashboardContent } from '@/lib/data';
import { CoursesPanel, DownloadsPanel, OverviewPanel } from './DashboardPanels';

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

const content: DashboardContent = {
  dashboard: { downloads: [] }
};

const contentWithDownloads: DashboardContent = {
  dashboard: {
    downloads: [
      { id: 4, title: 'Lean Angle & Physics', url: '/api/lessons/4/pdf?locale=en' },
      { id: 9, title: 'Grip & Contact Patch', url: '/api/lessons/9/pdf?locale=en' }
    ]
  }
};

const courses = [
  {
    currency: 'EUR',
    description: '',
    icon: '🏍️',
    imageTone: 'red',
    includes: [],
    pain: '',
    priceFeedback: 129,
    priceStandard: 29,
    slug: 'lean',
    title: 'Lean with confidence'
  },
  {
    currency: 'EUR',
    description: '',
    icon: '⚡',
    imageTone: 'green',
    includes: [],
    pain: '',
    priceFeedback: 129,
    priceStandard: 29,
    slug: 'counter-steering',
    title: 'Counter steering'
  }
] satisfies CourseCardCourse[];

describe('OverviewPanel', () => {
  it('shows the actual number of purchased courses and links to each course', () => {
    render(<OverviewPanel content={content} courses={courses} email="student@motophd.com" name="Student" />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lean with confidence/i })).toHaveAttribute(
      'href',
      '/learn/lean'
    );
    expect(screen.getByRole('link', { name: /counter steering/i })).toHaveAttribute(
      'href',
      '/learn/counter-steering'
    );
  });

  it('shows zero when the student has no purchased courses', () => {
    render(<OverviewPanel content={content} courses={[]} email="student@motophd.com" name="Student" />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows published courses that are not purchased in the purchase section', () => {
    render(
      <CoursesPanel
        availableCourses={[courses[1]]}
        content={content}
        courses={[courses[0]]}
        email="student@motophd.com"
        name="Student"
      />
    );

    expect(screen.getByRole('link', { name: /lean with confidence/i })).toHaveAttribute(
      'href',
      '/learn/lean'
    );
    expect(screen.getByRole('link', { name: /counter steering/i })).toHaveAttribute(
      'href',
      '/courses/counter-steering'
    );
  });
});

describe('feedback upgrade button', () => {
  const paid = (
    courseSlug: string,
    tier: FeedbackUpgradeCandidate['tier']
  ): FeedbackUpgradeCandidate => ({ courseSlug, status: 'paid', tier });
  const upgradeButton = () => screen.queryByRole('button', { name: 'feedbackUpgrade' });
  // Как на сервере: список купленных курсов и slug'и для докупки — из покупок.
  const renderOverview = (
    purchasedCourses: CourseCardCourse[],
    purchases: FeedbackUpgradeCandidate[]
  ) =>
    render(
      <OverviewPanel
        content={content}
        courses={purchasedCourses}
        email="student@motophd.com"
        feedbackUpgradeSlugs={getFeedbackUpgradeCourseSlugs(purchases)}
        name="Student"
      />
    );

  it('offers the upgrade for a paid standard course without feedback', () => {
    renderOverview([courses[0]], [paid('lean', 'standard')]);

    expect(upgradeButton()).toBeVisible();
    expect(screen.getByRole('link', { name: /lean with confidence/i })).toHaveAttribute(
      'href',
      '/learn/lean'
    );
  });

  it('hides the upgrade once feedback is paid for the course', () => {
    renderOverview([courses[0]], [paid('lean', 'standard'), paid('lean', 'feedback_upgrade')]);

    expect(upgradeButton()).not.toBeInTheDocument();
  });

  it('hides the upgrade for a course bought with feedback outright', () => {
    renderOverview([courses[0]], [paid('lean', 'feedback')]);

    expect(upgradeButton()).not.toBeInTheDocument();
  });

  it('shows nothing without purchases', () => {
    renderOverview([], []);

    expect(upgradeButton()).not.toBeInTheDocument();
  });

  it('shows the upgrade only on the matching course card', () => {
    render(
      <CoursesPanel
        content={content}
        courses={courses}
        email="student@motophd.com"
        feedbackUpgradeSlugs={['counter-steering']}
        name="Student"
      />
    );

    expect(screen.getAllByRole('button', { name: 'feedbackUpgrade' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /counter steering/i })).toHaveAttribute(
      'href',
      '/learn/counter-steering'
    );
  });
});

describe('DownloadsPanel', () => {
  it('links every purchased PDF to the protected lesson route', () => {
    render(
      <DownloadsPanel
        content={contentWithDownloads}
        courses={courses}
        email="student@motophd.com"
        name="Student"
      />
    );

    expect(screen.getByRole('link', { name: /lean angle/i })).toHaveAttribute(
      'href',
      '/api/lessons/4/pdf?locale=en'
    );
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
