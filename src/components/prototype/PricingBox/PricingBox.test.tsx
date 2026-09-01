import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));
vi.mock('@/lib/payments/checkout', () => ({ checkoutAction: vi.fn() }));

import { PricingBox } from './PricingBox';

const sales = {
  breadcrumb: 'Courses',
  disclaimer: 'Riding disclaimer',
  enrollCta: 'Enroll',
  guarantee: 'Lifetime access',
  modulesTitle: 'Modules',
  options: [
    { desc: 'Videos', name: 'Course only', price: '€29', tier: 'standard' as const },
    { desc: 'Feedback', name: 'Course + feedback', price: '€129', tier: 'feedback' as const }
  ],
  outcomes: [],
  pain: '',
  priceNote: 'No subscription',
  tag: 'Lean',
  title: ['Lean']
};

describe('PricingBox', () => {
  it('does not submit an order until the disclaimer is accepted', () => {
    render(<PricingBox checkoutEnabled courseSlug="lean" locale="en" sales={sales} />);

    expect(screen.getByRole('button', { name: 'actions.pay' })).toBeDisabled();
  });

  it('shows the contact fallback when the provider is disabled', () => {
    render(<PricingBox checkoutEnabled={false} courseSlug="lean" locale="en" sales={sales} />);

    expect(screen.getByText('checkout.unavailable')).toBeVisible();
    expect(screen.getByRole('button', { name: 'actions.pay' })).toBeDisabled();
  });

  it('renders the price received from the course record', () => {
    render(
      <PricingBox
        checkoutEnabled
        courseSlug="lean"
        locale="en"
        sales={{ ...sales, options: [{ ...sales.options[0], price: '€31' }, sales.options[1]] }}
      />
    );

    expect(screen.getAllByText('€31')).toHaveLength(2);
  });
});
