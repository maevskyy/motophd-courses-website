import type { Lesson } from '@/payload-types';
import { getSiteUrl } from '@/lib/seo/siteUrl';

// Абсолютный URL обложки урока для постера Stream-плеера. Media.read для
// анонимов — allowlist image/*, поэтому картинка публична по своему url;
// Stream грузит её из своего iframe без куки сайта. Не картинка или не
// загружена (depth 0) — null, плеер покажет кадр из видео как раньше.
export const lessonPosterUrl = (
  lesson: Pick<Lesson, 'cover'> | null | undefined,
  siteUrl = getSiteUrl()
): null | string => {
  const cover = lesson?.cover;

  if (!cover || typeof cover !== 'object' || !cover.url || !cover.mimeType?.startsWith('image/')) {
    return null;
  }

  return cover.url.startsWith('http') ? cover.url : `${siteUrl}${cover.url}`;
};
