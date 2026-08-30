import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthStatusProvider, useAuthStatus } from './AuthStatusProvider';

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }));

function Status() {
  return <span>{useAuthStatus() ? 'logged-in' : 'logged-out'}</span>;
}

describe('AuthStatusProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('остаётся разлогиненным, когда Payload не знает пользователя', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ user: null }), ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthStatusProvider>
        <Status />
      </AuthStatusProvider>
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/users/me', expect.anything())
    );
    expect(screen.getByText('logged-out')).toBeInTheDocument();
  });

  it('переключается в залогиненного после ответа Payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ user: { id: 1 } }), ok: true })
    );

    render(
      <AuthStatusProvider>
        <Status />
      </AuthStatusProvider>
    );

    await screen.findByText('logged-in');
  });

  it('верит серверному значению и не ходит в сеть', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthStatusProvider initialLoggedIn>
        <Status />
      </AuthStatusProvider>
    );

    expect(screen.getByText('logged-in')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('переживает недоступный API без падения', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthStatusProvider>
        <Status />
      </AuthStatusProvider>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByText('logged-out')).toBeInTheDocument();
  });
});
