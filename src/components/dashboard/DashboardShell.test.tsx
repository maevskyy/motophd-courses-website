import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardShell } from './DashboardShell';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => '/dashboard'
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/auth/actions', () => ({
  logoutAction: vi.fn()
}));

const renderShell = (courseCount: number) =>
  render(
    <DashboardShell
      courseCount={courseCount}
      displayName="Student"
      email="student@motophd.com"
      locale="en"
    >
      <p>Content</p>
    </DashboardShell>
  );

describe('DashboardShell', () => {
  it('has two sidebar links and marks the current route', () => {
    renderShell(1);

    const nav = screen.getByRole('navigation', { name: 'nav.dashboard' });

    expect(nav.querySelectorAll('a')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'dashboard.myCourse' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'dashboard.settings' })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    );
    expect(screen.getByRole('link', { name: 'dashboard.settings' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.getByRole('main')).toHaveTextContent('Content');
  });

  it('says "my courses" once there are two purchased courses', () => {
    renderShell(2);

    expect(screen.getByRole('link', { name: 'dashboard.myCourses' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('keeps the user block and the sign-out form in the sidebar', () => {
    renderShell(0);

    expect(screen.getByRole('complementary')).toHaveTextContent('student@motophd.com');
    expect(screen.getByRole('button', { name: 'actions.signOut' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'actions.backToWebsite' })).toHaveAttribute('href', '/');
  });
});
