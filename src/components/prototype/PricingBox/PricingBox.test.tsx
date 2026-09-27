import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// t.rich рендерит теги ссылок из строки — в моке возвращаем содержимое как есть.
vi.mock('next-intl', () => {
  const t = (key: string) => key;

  t.rich = (key: string) => key;

  return { useTranslations: () => t };
});
vi.mock('@/components/providers/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));
vi.mock('@/lib/payments/checkout', () => ({ checkoutAction: vi.fn() }));

import { PricingBox } from './PricingBox';

const sales = {
  breadcrumb: 'Courses',
  disclaimer: 'Riding disclaimer',
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
  it('keeps the pay button active but blocks submit until the disclaimer is accepted', () => {
    render(<PricingBox checkoutEnabled courseSlug="lean" locale="en" sales={sales} />);

    const pay = screen.getByRole('button', { name: 'actions.pay' });
    const checkbox = screen.getByRole('checkbox');

    expect(pay).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const submitted = fireEvent.submit(pay.closest('form')!);

    expect(submitted).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent('toast.acceptDisclaimer');
    expect(checkbox).toHaveFocus();
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');

    fireEvent.click(checkbox);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // React сам гасит нативный submit у формы с action — проверяем только, что наша подсказка не возвращается.
    fireEvent.submit(pay.closest('form')!);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
