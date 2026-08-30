import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/payload-types';

const mocks = vi.hoisted(() => ({
  cookieDelete: vi.fn(),
  cookieSet: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
  update: vi.fn()
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ delete: mocks.cookieDelete, set: mocks.cookieSet })
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

vi.mock('@/lib/auth/currentUser', () => ({ getCurrentUser: mocks.getCurrentUser }));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ login: mocks.login, update: mocks.update })
}));

import { changePasswordAction, deleteAccountAction, updateProfileAction } from './account';
import {
  initialChangePasswordFormState,
  initialDeleteAccountFormState,
  initialUpdateProfileFormState
} from './accountFormState';

const user = {
  collection: 'users',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'student@motophd.com',
  id: 7,
  name: 'Student',
  role: 'student',
  updatedAt: '2026-01-01T00:00:00.000Z'
} satisfies User;

const createFormData = (name: string) => {
  const formData = new FormData();

  formData.set('name', name);

  return formData;
};

const createPasswordFormData = (
  currentPassword: string,
  newPassword: string,
  confirmPassword = newPassword
) => {
  const formData = new FormData();

  formData.set('currentPassword', currentPassword);
  formData.set('newPassword', newPassword);
  formData.set('confirmPassword', confirmPassword);

  return formData;
};

describe('updateProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates only the signed-in user name', async () => {
    mocks.getCurrentUser.mockResolvedValue(user);

    await expect(updateProfileAction(initialUpdateProfileFormState, createFormData('  Alice  '))).resolves.toEqual({
      status: 'success'
    });

    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'users',
      data: { name: 'Alice' },
      id: user.id,
      overrideAccess: false,
      user
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/[locale]/dashboard', 'page');
  });

  it('does not update a profile when no user is signed in', async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(updateProfileAction(initialUpdateProfileFormState, createFormData('Alice'))).resolves.toEqual({
      status: 'error'
    });

    expect(mocks.update).not.toHaveBeenCalled();
  });
});

describe('changePasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a wrong current password without touching the account', async () => {
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.login.mockRejectedValue(new Error('invalid credentials'));

    await expect(
      changePasswordAction(initialChangePasswordFormState, createPasswordFormData('wrong-pass', 'new-password-1'))
    ).resolves.toEqual({ status: 'wrongCurrent' });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it('rejects mismatched new passwords before any payload call', async () => {
    await expect(
      changePasswordAction(
        initialChangePasswordFormState,
        createPasswordFormData('old-pass-123', 'new-password-1', 'new-password-2')
      )
    ).resolves.toEqual({ status: 'mismatch' });

    expect(mocks.login).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects a short new password', async () => {
    await expect(
      changePasswordAction(initialChangePasswordFormState, createPasswordFormData('old-pass-123', 'short'))
    ).resolves.toEqual({ status: 'tooShort' });

    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('changes the password as the user and refreshes the session cookie', async () => {
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.login
      .mockResolvedValueOnce({ token: 'old-session' })
      .mockResolvedValueOnce({ token: 'fresh-session' });

    await expect(
      changePasswordAction(initialChangePasswordFormState, createPasswordFormData('old-pass-123', 'new-password-1'))
    ).resolves.toEqual({ status: 'success' });

    expect(mocks.update).toHaveBeenCalledWith({
      collection: 'users',
      data: { password: 'new-password-1' },
      id: user.id,
      overrideAccess: false,
      user
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      'payload-token',
      'fresh-session',
      expect.objectContaining({ httpOnly: true })
    );
  });
});

describe('deleteAccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createDeleteFormData = (confirmEmail: string) => {
    const formData = new FormData();

    formData.set('confirmEmail', confirmEmail);
    formData.set('locale', 'en');

    return formData;
  };

  it('refuses to delete without the exact email confirmation', async () => {
    mocks.getCurrentUser.mockResolvedValue(user);

    await expect(
      deleteAccountAction(initialDeleteAccountFormState, createDeleteFormData('someone@else.com'))
    ).resolves.toEqual({ status: 'confirmMismatch' });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.cookieDelete).not.toHaveBeenCalled();
  });

  it('anonymizes the account so the old credentials stop working, then signs out', async () => {
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.update.mockResolvedValue({});

    await deleteAccountAction(initialDeleteAccountFormState, createDeleteFormData('Student@MotoPhD.com'));

    const updateArgs = mocks.update.mock.calls[0][0];

    // Старый email исчезает, пароль заменяется длинным случайным — пара для
    // логина перестаёт существовать; строка юзера и покупки остаются.
    expect(updateArgs).toMatchObject({
      collection: 'users',
      data: { email: 'deleted-7@anonymized.invalid', name: '' },
      id: user.id,
      overrideAccess: false,
      user
    });
    expect(updateArgs.data.password.length).toBeGreaterThanOrEqual(24);
    expect(mocks.cookieDelete).toHaveBeenCalledWith('payload-token');
    expect(mocks.redirect).toHaveBeenCalledWith('/en/');
  });
});
