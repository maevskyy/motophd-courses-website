import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/account', () => ({
  changePasswordAction: vi.fn()
}));

describe('ChangePasswordForm', () => {
  it('asks only for the new password twice', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText('newPassword')).toHaveAttribute('minlength', '8');
    expect(screen.getByLabelText('newPassword')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('confirmNewPassword')).toHaveAttribute('type', 'password');
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
  });
});
