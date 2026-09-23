import { describe, expect, it } from 'vitest';

import { lessonPosterUrl } from './lessonPosterUrl';

const image = { id: 1, mimeType: 'image/jpeg', url: '/api/media/file/ru-01.jpg' };

describe('lessonPosterUrl', () => {
  it('makes the media url absolute against the site url', () => {
    expect(lessonPosterUrl({ cover: image } as never, 'https://motophd.com')).toBe(
      'https://motophd.com/api/media/file/ru-01.jpg'
    );
  });

  it('keeps an already absolute url', () => {
    expect(
      lessonPosterUrl({ cover: { ...image, url: 'https://cdn.example.com/x.jpg' } } as never, 'https://motophd.com')
    ).toBe('https://cdn.example.com/x.jpg');
  });

  it('returns null without a cover, for an unpopulated id, or for a non-image', () => {
    expect(lessonPosterUrl({ cover: null } as never, 'https://motophd.com')).toBeNull();
    expect(lessonPosterUrl({ cover: 7 } as never, 'https://motophd.com')).toBeNull();
    expect(
      lessonPosterUrl({ cover: { ...image, mimeType: 'application/pdf' } } as never, 'https://motophd.com')
    ).toBeNull();
    expect(lessonPosterUrl(null, 'https://motophd.com')).toBeNull();
  });
});
