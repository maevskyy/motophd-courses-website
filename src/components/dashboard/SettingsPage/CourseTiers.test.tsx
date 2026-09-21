import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import { CourseTiers } from './CourseTiers';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

const purchase = (overrides: Partial<PurchaseHistoryItem>): PurchaseHistoryItem => ({
  amount: 29,
  courseSlug: 'lean',
  courseTitle: 'Lean with confidence',
  currency: 'EUR',
  id: 1,
  purchasedAt: '2026-08-01T10:00:00.000Z',
  status: 'paid',
  tier: 'standard',
  ...overrides
});

describe('CourseTiers', () => {
  it('lists one row per paid course with its tier and the upgrade link', () => {
    render(
      <CourseTiers
        feedbackUpgradeSlugs={['lean']}
        purchases={[
          purchase({}),
          purchase({ courseSlug: 'braking', courseTitle: 'Braking', id: 2, tier: 'feedback' }),
          purchase({ courseSlug: 'trail', courseTitle: 'Trail', id: 3, status: 'pending' })
        ]}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('courseTierStandard')).toBeInTheDocument();
    expect(screen.getByText('courseTierFeedback')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'feedbackUpgrade' })).toHaveAttribute(
      'href',
      '/dashboard#upgrade'
    );
  });

  it('counts a paid feedback upgrade as feedback for the same course', () => {
    render(
      <CourseTiers
        feedbackUpgradeSlugs={[]}
        purchases={[purchase({}), purchase({ id: 2, tier: 'feedback_upgrade' })]}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('courseTierFeedback')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders nothing without paid courses', () => {
    const { container } = render(
      <CourseTiers feedbackUpgradeSlugs={[]} purchases={[purchase({ status: 'failed' })]} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
