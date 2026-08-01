import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  requestHeaders: new Headers({ cookie: 'payload-token=signed-token' })
}));

const { auth, requestHeaders } = mocks;

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(mocks.requestHeaders)
}));

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
    auth.mockResolvedValue({ user });

    const { getCurrentUser } = await loadCurrentUser();

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(auth).toHaveBeenCalledWith({ headers: requestHeaders });
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
