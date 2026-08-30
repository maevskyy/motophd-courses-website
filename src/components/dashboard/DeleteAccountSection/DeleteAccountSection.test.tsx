import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteAccountSection } from './DeleteAccountSection';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/account', () => ({
  deleteAccountAction: vi.fn()
}));

describe('DeleteAccountSection', () => {
  it('requires typing the email before the delete button', () => {
    render(<DeleteAccountSection />);

    expect(screen.getByLabelText('deleteAccountConfirmLabel')).toBeRequired();
    expect(screen.getByRole('button', { name: 'deleteAccount' })).toBeInTheDocument();
  });
});
