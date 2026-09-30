import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/video/streamApi', () => ({}));

import { findLessonsUsingVideo, readUploadName, Videos } from './Videos';

const b64 = (value: string) => Buffer.from(value, 'utf8').toString('base64');

describe('readUploadName', () => {
  it('prefers the name the admin gave the video over the file name', () => {
    expect(
      readUploadName(`filename ${b64('IMG_0042.mov')},name ${b64('lean · урок 03 · RU')}`)
    ).toBe('lean · урок 03 · RU');
    expect(
      readUploadName(`filename ${b64('IMG_0042.mov')},filetype ${b64('video/quicktime')}`)
    ).toBe('IMG_0042.mov');
    expect(readUploadName(null)).toBe('video');
  });
});

describe('videos in lessons', () => {
  it('finds a video in any language of a lesson', async () => {
    const find = vi.fn(async ({ locale }: { locale: string }) => ({
      docs: locale === 'ru' ? [{ id: 9, order: 3, title: 'Свешивание' }] : []
    }));

    await expect(findLessonsUsingVideo({ find } as never, 4)).resolves.toEqual([
      { id: 9, label: '№3 «Свешивание» (ru)' }
    ]);
    expect(find).toHaveBeenCalledTimes(3);
  });

  it('refuses to delete a video that a lesson still plays', async () => {
    const find = vi.fn(async () => ({ docs: [{ id: 9, order: 3, title: 'Свешивание' }] }));
    const [beforeDelete] = Videos.hooks?.beforeDelete ?? [];

    await expect(beforeDelete({ id: 4, req: { payload: { find } } } as never)).rejects.toThrow(
      /Свешивание/
    );
  });
});
