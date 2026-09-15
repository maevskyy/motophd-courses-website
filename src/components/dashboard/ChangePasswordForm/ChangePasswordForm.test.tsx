import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/account', () => ({
  changePasswordAction: vi.fn()
}));

describe('ChangePasswordForm', () => {
  it('asks for the current password and the new password twice', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText('currentPassword')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('newPassword')).toHaveAttribute('minlength', '8');
    expect(screen.getByLabelText('confirmNewPassword')).toHaveAttribute('type', 'password');
  });
});
