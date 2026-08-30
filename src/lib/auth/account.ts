'use server';

import { revalidatePath } from 'next/cache';
import { getPayloadClient } from '@/lib/data/payload';
import type { UpdateProfileFormState } from './accountFormState';
import { getCurrentUser } from './currentUser';

export async function updateProfileAction(
  _previousState: UpdateProfileFormState,
  formData: FormData
): Promise<UpdateProfileFormState> {
  const name = String(formData.get('name') || '').trim();

  if (name.length > 120) {
    return { status: 'error' };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { status: 'error' };
  }

  try {
    const payload = await getPayloadClient();

    await payload.update({
      collection: 'users',
      data: { name },
      id: user.id,
      overrideAccess: false,
      user
    });
  } catch {
    return { status: 'error' };
  }

  revalidatePath('/[locale]/dashboard', 'page');

  return { status: 'success' };
}
