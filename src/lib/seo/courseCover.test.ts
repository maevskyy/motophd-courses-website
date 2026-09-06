import { describe, expect, it } from 'vitest';

import type { Media } from '@/payload-types';
import { courseCoverImage } from './courseCover';

const media = (overrides: Partial<Media> = {}): Media => ({
  createdAt: '2026-01-01T00:00:00.000Z',
  filename: 'cover.jpg',
  height: 630,
  id: 3,
  mimeType: 'image/jpeg',
  updatedAt: '2026-01-01T00:00:00.000Z',
  url: '/api/media/file/cover.jpg',
  width: 1200,
  ...overrides
});

describe('courseCoverImage', () => {
  it('returns null when the cover is missing or not populated', () => {
    expect(courseCoverImage({ cover: null, title: 'Lean' })).toBeNull();
    expect(courseCoverImage({ cover: undefined, title: 'Lean' })).toBeNull();
    expect(courseCoverImage({ cover: 3, title: 'Lean' })).toBeNull();
  });

  it('returns null for non-image media, which anonymous readers cannot fetch', () => {
    expect(
      courseCoverImage({ cover: media({ mimeType: 'application/pdf' }), title: 'Lean' })
    ).toBeNull();
    expect(courseCoverImage({ cover: media({ url: null }), title: 'Lean' })).toBeNull();
  });

  it('maps a public image cover to an og:image descriptor', () => {
    expect(courseCoverImage({ cover: media({ alt: 'Rider leaning' }), title: 'Lean' })).toEqual({
      alt: 'Rider leaning',
      height: 630,
      url: '/api/media/file/cover.jpg',
      width: 1200
    });
  });

  it('falls back to the course title as alt text', () => {
    expect(
      courseCoverImage({ cover: media({ height: null, width: null }), title: 'Lean' })
    ).toEqual({
      alt: 'Lean',
      height: undefined,
      url: '/api/media/file/cover.jpg',
      width: undefined
    });
  });
});
