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
  it('allows editing the name while showing the email as plain text', () => {
    render(<AccountProfileForm email="student@motophd.com" name="Student" />);

    expect(screen.getByRole('textbox', { name: 'fullName' })).toHaveValue('Student');
    // Email — значение с пояснением, не поле ввода: единственный textbox — имя.
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByText('student@motophd.com')).toBeInTheDocument();
    expect(screen.getByText('emailReadOnly')).toBeInTheDocument();
  });
});
