import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import { PurchaseHistory } from './PurchaseHistory';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

const purchases = [
  {
    amount: 29,
    courseTitle: 'Lean with confidence',
    currency: 'EUR',
    id: 11,
    purchasedAt: '2026-08-01T10:00:00.000Z',
    status: 'paid',
    tier: 'standard'
  },
  {
    amount: 100,
    courseTitle: 'Counter steering',
    currency: 'EUR',
    id: 12,
    purchasedAt: '2026-08-15T10:00:00.000Z',
    status: 'pending',
    tier: 'feedback_upgrade'
  }
] satisfies PurchaseHistoryItem[];

describe('PurchaseHistory', () => {
  it('renders a row per purchase with tier, amount and status', () => {
    render(<PurchaseHistory purchases={purchases} />);

    expect(screen.getByText('Lean with confidence')).toBeInTheDocument();
    expect(screen.getByText('tierFeedbackUpgrade')).toBeInTheDocument();
    expect(screen.getByText('€29.00')).toBeInTheDocument();
    expect(screen.getByText('statusPaid')).toBeInTheDocument();
    expect(screen.getByText('statusPending')).toBeInTheDocument();
  });

  it('shows the empty state without rows', () => {
    render(<PurchaseHistory purchases={[]} />);

    expect(screen.getByText('purchaseHistoryEmpty')).toBeInTheDocument();
  });
});
