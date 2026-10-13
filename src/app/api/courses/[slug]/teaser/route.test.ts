import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findByID: vi.fn(),
  getCourseBySlug: vi.fn(),
  getPlaybackUrl: vi.fn()
}));

vi.mock('@/lib/data', () => ({ getCourseBySlug: mocks.getCourseBySlug }));
vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: async () => ({ findByID: mocks.findByID })
}));
vi.mock('@/lib/video', () => ({
  getPlaybackUrl: mocks.getPlaybackUrl,
  lessonPosterUrl: () => 'https://motophd.com/media/cover.jpg'
}));

import { GET } from './route';

const request = (slug: string, locale = 'ru') =>
  GET(new Request(`http://localhost/api/courses/${slug}/teaser?locale=${locale}`), {
    params: Promise.resolve({ slug })
  });

describe('GET /api/courses/[slug]/teaser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCourseBySlug.mockResolvedValue({ id: 1, slug: 'lean', teaser: 7 });
    mocks.findByID.mockResolvedValue({ id: 7, streamUid: 'stream-uid' });
    mocks.getPlaybackUrl.mockReturnValue('https://customer-x.cloudflarestream.com/token/iframe');
  });

  it('отдаёт ссылку на трейлер без логина и покупки, не кэшируя её', async () => {
    const response = await request('lean');

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      url: 'https://customer-x.cloudflarestream.com/token/iframe'
    });
    expect(mocks.getCourseBySlug).toHaveBeenCalledWith('lean', 'ru');
    expect(mocks.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'videos', id: 7, overrideAccess: true })
    );
    expect(mocks.getPlaybackUrl).toHaveBeenCalledWith('stream-uid', {
      free: true,
      poster: 'https://motophd.com/media/cover.jpg'
    });
  });

  it('подписывает только трейлер курса, даже если он пришёл объектом', async () => {
    mocks.getCourseBySlug.mockResolvedValue({ id: 1, slug: 'lean', teaser: { id: 9 } });

    await request('lean');

    expect(mocks.findByID).toHaveBeenCalledWith(expect.objectContaining({ id: 9 }));
  });

  it('404 у курса без трейлера — видео не читает', async () => {
    mocks.getCourseBySlug.mockResolvedValue({ id: 1, slug: 'lean', teaser: null });

    const response = await request('lean');

    expect(response.status).toBe(404);
    expect(mocks.findByID).not.toHaveBeenCalled();
  });

  it('404 для неопубликованного или несуществующего курса', async () => {
    mocks.getCourseBySlug.mockResolvedValue(null);

    expect((await request('draft')).status).toBe(404);
  });

  it('404 на неизвестный язык — в базу не ходит', async () => {
    expect((await request('lean', 'de')).status).toBe(404);
    expect(mocks.getCourseBySlug).not.toHaveBeenCalled();
  });

  it('404, если подписать нечего (видео удалено или Stream не настроен)', async () => {
    mocks.findByID.mockResolvedValue(null);
    mocks.getPlaybackUrl.mockReturnValue(null);

    expect((await request('lean')).status).toBe(404);
  });
});
