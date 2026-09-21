import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  cookieToken: undefined as string | undefined,
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  requestHeaders: new Headers({ cookie: 'payload-token=signed-token' })
}));

const { auth } = mocks;

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: (name: string) =>
      name === 'payload-token' && mocks.cookieToken ? { value: mocks.cookieToken } : undefined
  }),
  headers: vi.fn().mockResolvedValue(mocks.requestHeaders)
}));

const authHeaders = () => auth.mock.calls[0][0].headers as Headers;

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ auth: mocks.auth })
}));

const loadCurrentUser = () => import('./currentUser');

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns the user resolved by Payload from the request cookie', async () => {
    const user = { email: 'student@motophd.com', id: 1, role: 'student' };
    mocks.cookieToken = 'signed-token';
    auth.mockResolvedValue({ user });

    const { getCurrentUser } = await loadCurrentUser();

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(authHeaders().get('cookie')).toBe('payload-token=signed-token');
    expect(authHeaders().get('authorization')).toBe('JWT signed-token');
  });

  it('prefers the cookie re-set by a server action over the request header', async () => {
    // После смены пароля кука уже новая, а заголовок Cookie — ещё со старым
    // (убитым) токеном; Payload должен получить новый.
    mocks.cookieToken = 'fresh-token';
    auth.mockResolvedValue({ user: { id: 1 } });

    const { getCurrentUser } = await loadCurrentUser();
    await getCurrentUser();

    expect(authHeaders().get('authorization')).toBe('JWT fresh-token');
  });

  it('passes the request through untouched without an auth cookie', async () => {
    mocks.cookieToken = undefined;
    auth.mockResolvedValue({ user: null });

    const { getCurrentUser } = await loadCurrentUser();
    await getCurrentUser();

    expect(authHeaders().get('authorization')).toBeNull();
  });

  it('returns null for an anonymous request', async () => {
    auth.mockResolvedValue({ user: null });

    const { getCurrentUser } = await loadCurrentUser();

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('requireUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('redirects to login when the request is anonymous', async () => {
    auth.mockResolvedValue({ user: null });

    const { requireUser } = await loadCurrentUser();

    await expect(requireUser('/en/login?next=%2Fen%2Fdashboard')).rejects.toThrow(
      'redirect:/en/login?next=%2Fen%2Fdashboard'
    );
  });
});
