import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
  useTranslations: () => (key: string) => key
}));

vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));

vi.mock('@/lib/auth/account', () => ({
  updateProfileAction: vi.fn()
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
