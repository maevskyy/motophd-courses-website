import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import { CoursePurchases } from './CoursePurchases';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
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

describe('CoursePurchases', () => {
  it('lists one row per paid course with its tier, date, amount and the upgrade link', () => {
    render(
      <CoursePurchases
        feedbackUpgradeSlugs={['lean']}
        purchases={[
          purchase({}),
          purchase({ courseSlug: 'braking', courseTitle: 'Braking', id: 2, tier: 'feedback' }),
          purchase({ courseSlug: 'trail', courseTitle: 'Trail', id: 3, status: 'pending' })
        ]}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText(/courseTierStandard · Aug 1, 2026 · €29\.00/)).toBeInTheDocument();
    expect(screen.getByText(/courseTierFeedback/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'feedbackUpgrade' })).toHaveAttribute(
      'href',
      '/dashboard#upgrade'
    );
  });

  it('counts a paid feedback upgrade as feedback for the same course', () => {
    render(
      <CoursePurchases
        feedbackUpgradeSlugs={[]}
        purchases={[purchase({}), purchase({ id: 2, tier: 'feedback_upgrade' })]}
      />
    );

    // Курс и апгрейд к нему — одна строка с суммой обеих оплат.
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText(/courseTierFeedback · Aug 1, 2026 · €58\.00/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('says there are no purchases yet when nothing is paid', () => {
    render(
      <CoursePurchases feedbackUpgradeSlugs={[]} purchases={[purchase({ status: 'failed' })]} />
    );

    expect(screen.getByText('purchaseHistoryEmpty')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
