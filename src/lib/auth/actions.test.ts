import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookieStore: {
    delete: vi.fn(),
    set: vi.fn()
  },
  login: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
}));

const { cookieStore, login } = mocks;

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mocks.cookieStore)
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ login: mocks.login })
}));

import { loginAction, logoutAction } from './actions';
import { initialLoginFormState } from './formState';

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => formData.set(key, value));

  return formData;
};

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets the httpOnly token cookie and returns to a safe path after login', async () => {
    login.mockResolvedValue({ token: 'signed-token' });

    const formData = createFormData({
      email: 'student@motophd.com',
      locale: 'en',
      next: '/en/courses/cornering-basics',
      password: 'student1234'
    });

    await expect(loginAction(initialLoginFormState, formData)).rejects.toThrow(
      'redirect:/en/courses/cornering-basics'
    );

    expect(login).toHaveBeenCalledWith({
      collection: 'users',
      data: {
        email: 'student@motophd.com',
        password: 'student1234'
      }
    });
    expect(cookieStore.set).toHaveBeenCalledWith('payload-token', 'signed-token', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false
    });
  });

  it('returns the same error for an invalid login and does not set a cookie', async () => {
    login.mockRejectedValue(new Error('Invalid credentials'));

    const formData = createFormData({
      email: 'student@motophd.com',
      locale: 'en',
      password: 'wrong-password'
    });

    await expect(loginAction(initialLoginFormState, formData)).resolves.toEqual({ error: true });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('ignores an external return address after login', async () => {
    login.mockResolvedValue({ token: 'signed-token' });

    const formData = createFormData({
      email: 'student@motophd.com',
      locale: 'ru',
      next: 'https://example.com',
      password: 'student1234'
    });

    await expect(loginAction(initialLoginFormState, formData)).rejects.toThrow(
      'redirect:/ru/dashboard'
    );
  });
});

describe('logoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes the token cookie and returns to the localized home page', async () => {
    const formData = createFormData({ locale: 'ru' });

    await expect(logoutAction(formData)).rejects.toThrow('redirect:/ru/');

    expect(cookieStore.delete).toHaveBeenCalledWith('payload-token');
  });
});
