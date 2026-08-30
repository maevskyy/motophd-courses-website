import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/payload-types';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  update: vi.fn()
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

vi.mock('@/lib/auth/currentUser', () => ({ getCurrentUser: mocks.getCurrentUser }));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({ update: mocks.update })
}));

import { initialUpdateProfileFormState, updateProfileAction } from './account';

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
