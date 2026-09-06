import type { Course } from '@/payload-types';
import type { SeoImage } from './pageMetadata';

// Обложка курса из Payload как og:image. Media.read для анонимов — allowlist
// image/*, поэтому картинка публична по своему url (/api/media/file/<name>).
// Нет обложки или это не картинка — вернём null, страница возьмёт дефолт.
export const courseCoverImage = (course: Pick<Course, 'cover' | 'title'>): SeoImage | null => {
  const { cover } = course;

  if (!cover || typeof cover !== 'object' || !cover.url || !cover.mimeType?.startsWith('image/')) {
    return null;
  }

  return {
    alt: cover.alt || course.title,
    height: cover.height ?? undefined,
    url: cover.url,
    width: cover.width ?? undefined
  };
};
