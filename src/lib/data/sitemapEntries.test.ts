import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn()
}));

vi.mock('./payload', () => ({
  getPayloadClient: mocks.getPayloadClient
}));

import { getSitemapCourses, getSitemapLegalPages } from './sitemapEntries';

describe('sitemap data access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPayloadClient.mockResolvedValue({ find: mocks.find });
  });

  it('loads only published courses, slugs and timestamps, under public access rules', async () => {
    const docs = [{ slug: 'lean', updatedAt: '2026-09-01T10:00:00.000Z' }];
    mocks.find.mockResolvedValue({ docs });

    await expect(getSitemapCourses()).resolves.toEqual(docs);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'courses',
        depth: 0,
        overrideAccess: false,
        select: { slug: true, updatedAt: true },
        sort: 'order',
        where: { status: { equals: 'published' } }
      })
    );
    expect(mocks.find.mock.calls[0][0]).not.toHaveProperty('locale');
  });

  it('loads legal page slugs under public access rules', async () => {
    const docs = [{ slug: 'privacy', updatedAt: '2026-09-01T10:00:00.000Z' }];
    mocks.find.mockResolvedValue({ docs });

    await expect(getSitemapLegalPages()).resolves.toEqual(docs);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'legalPages',
        depth: 0,
        overrideAccess: false,
        select: { slug: true, updatedAt: true }
      })
    );
  });
});
