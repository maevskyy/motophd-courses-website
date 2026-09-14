import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/account', () => ({
  changePasswordAction: vi.fn()
}));

describe('ChangePasswordForm', () => {
  it('reveals the current and the new password twice only after clicking Edit', async () => {
    render(<ChangePasswordForm />);

    const edit = screen.getByRole('button', { name: 'passwordEdit' });

    expect(edit).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('currentPassword')).not.toBeInTheDocument();

    await userEvent.click(edit);

    expect(screen.getByLabelText('currentPassword')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('newPassword')).toHaveAttribute('minlength', '8');
    expect(screen.getByLabelText('confirmNewPassword')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'passwordEditCancel' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
