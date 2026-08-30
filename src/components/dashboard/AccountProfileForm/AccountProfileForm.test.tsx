import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountProfileForm } from './AccountProfileForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/account', () => ({
  updateProfileAction: vi.fn()
}));

describe('AccountProfileForm', () => {
  it('allows editing the name while keeping the email read-only', () => {
    render(<AccountProfileForm email="student@motophd.com" name="Student" />);

    expect(screen.getByRole('textbox', { name: 'fullName' })).toHaveValue('Student');
    expect(screen.getByRole('textbox', { name: 'email' })).toHaveValue('student@motophd.com');
    expect(screen.getByRole('textbox', { name: 'email' })).toHaveAttribute('readonly');
  });
});
