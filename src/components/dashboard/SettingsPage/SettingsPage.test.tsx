import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPage } from './SettingsPage';

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

vi.mock('@/lib/auth/account', () => ({
  changePasswordAction: vi.fn(),
  deleteAccountAction: vi.fn(),
  updateProfileAction: vi.fn()
}));

describe('SettingsPage', () => {
  it('has one h1 and the four sections in the canonical order', () => {
    render(
      <SettingsPage
        email="student@motophd.com"
        feedbackUpgradeSlugs={[]}
        name="Student"
        purchases={[]}
      />
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('settings');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'profile',
      'security',
      'billing',
      'dangerZone'
    ]);
  });
});
