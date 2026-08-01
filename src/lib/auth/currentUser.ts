import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/payload-types';
import { getPayloadClient } from '@/lib/data/payload';

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  return user as User | null;
});

export const requireUser = async (loginPath = '/login'): Promise<User> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(loginPath);
  }

  return user;
};
