import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppNavButton, AppNavLink, AppShell, AppSidebar } from './index';

const route = vi.hoisted(() => ({ pathname: '/dashboard' }));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  usePathname: () => route.pathname
}));

describe('AppShell', () => {
  it('renders the sidebar slots and the main area', () => {
    render(
      <AppShell
        sidebar={
          <AppSidebar footer={<span>Footer</span>} header={<span>Header</span>} navLabel="Cabinet">
            <button type="button">Item</button>
          </AppSidebar>
        }
      >
        <p>Content</p>
      </AppShell>
    );

    expect(screen.getByRole('complementary')).toHaveTextContent('Header');
    expect(screen.getByRole('navigation', { name: 'Cabinet' })).toHaveTextContent('Item');
    expect(screen.getByRole('complementary')).toHaveTextContent('Footer');
    expect(screen.getByRole('main')).toHaveTextContent('Content');
  });
});

describe('AppNavLink', () => {
  it('marks only the link matching the current pathname', () => {
    route.pathname = '/dashboard/settings';

    render(
      <>
        <AppNavLink href="/dashboard">Course</AppNavLink>
        <AppNavLink href="/dashboard/settings">Settings</AppNavLink>
      </>
    );

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Course' })).not.toHaveAttribute('aria-current');
  });
});

describe('AppNavButton', () => {
  it('marks the active tab and reports clicks', () => {
    const onClick = vi.fn();

    render(
      <>
        <AppNavButton active icon="grid" onClick={onClick}>
          Overview
        </AppNavButton>
        <AppNavButton active={false} onClick={onClick}>
          Profile
        </AppNavButton>
      </>
    );

    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Profile' })).not.toHaveAttribute('aria-current');

    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
