import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useLocale: () => 'ru',
  useTranslations: () => (key: string) => key
}));
vi.mock('@/lib/payments/checkout', () => ({ checkoutAction: vi.fn() }));

import { checkoutAction } from '@/lib/payments/checkout';
import { FeedbackUpgradeButton } from './FeedbackUpgradeButton';

const checkoutActionMock = vi.mocked(checkoutAction);

describe('FeedbackUpgradeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the course to checkout with the feedback_upgrade tier and the current locale', async () => {
    checkoutActionMock.mockResolvedValue({ redirectUrl: '/ru/checkout/mock?order=1' });
    render(<FeedbackUpgradeButton courseSlug="lean" />);

    await userEvent.click(screen.getByRole('button', { name: 'feedbackUpgrade' }));

    expect(checkoutActionMock).toHaveBeenCalledTimes(1);

    const formData = checkoutActionMock.mock.calls[0][1];

    expect(formData.get('courseSlug')).toBe('lean');
    expect(formData.get('tier')).toBe('feedback_upgrade');
    expect(formData.get('locale')).toBe('ru');
    expect(formData.get('email')).toBeNull();
  });

  it('shows the checkout error returned by the action', async () => {
    checkoutActionMock.mockResolvedValue({ error: 'upgradeUnavailable' });
    render(<FeedbackUpgradeButton courseSlug="lean" />);

    await userEvent.click(screen.getByRole('button', { name: 'feedbackUpgrade' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('errors.upgradeUnavailable');
    expect(screen.getByRole('button', { name: 'feedbackUpgrade' })).toBeEnabled();
  });
});
