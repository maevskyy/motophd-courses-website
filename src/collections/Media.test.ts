import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isAdminUser: vi.fn()
}));

vi.mock('@/lib/access/hasPaidAccess', () => mocks);

import { Media } from './Media';

const read = Media.access?.read;

describe('media read access', () => {
  it('allows admins to read every media document', async () => {
    mocks.isAdminUser.mockReturnValue(true);

    expect(read?.({ req: { user: { role: 'admin' } } } as never)).toBe(true);
  });

  it('hides PDFs from visitors while keeping images public', async () => {
    mocks.isAdminUser.mockReturnValue(false);

    expect(read?.({ req: { user: null } } as never)).toEqual({
      or: [
        { mimeType: { not_equals: 'application/pdf' } },
        { mimeType: { exists: false } }
      ]
    });
  });
});
