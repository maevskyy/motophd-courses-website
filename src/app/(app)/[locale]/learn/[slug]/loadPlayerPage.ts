import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import type { Payload } from 'payload';
import type { Lesson } from '@/payload-types';
import { hasPaidAccess } from '@/lib/access/hasPaidAccess';
import { requireUser } from '@/lib/auth';
import {
  getCourseBySlug,
  getCourseLessons,
  getPlayerLesson,
  parseLessonOrder,
  toPlayerContent,
  toPlayerDownloads
} from '@/lib/data';
import type { PlayerLesson } from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { getPlaybackUrl, lessonPosterUrl } from '@/lib/video';
import { requireLocale } from '@/i18n/requireLocale';

interface Params {
  locale: string;
  slug: string;
  // Сегмент URL как есть; без него страница показывает следующий непройденный урок.
  order?: string;
}

// Общий загрузчик для /learn/[slug] и /learn/[slug]/[order]: гость → логин,
// без покупки → страница продажи, чужой order → 404 (уже после гейта, чтобы
// не раскрывать состав курса тем, кто его не купил).
export const loadPlayerPage = async ({ locale, order, slug }: Params) => {
  await connection();

  const safeLocale = requireLocale(locale);
  const path = [`/${safeLocale}/learn/${slug}`, order].filter(Boolean).join('/');
  const user = await requireUser(`/${safeLocale}/login?next=${encodeURIComponent(path)}`);
  const course = await getCourseBySlug(slug, safeLocale, user);

  if (!course) {
    notFound();
  }

  const payload = await getPayloadClient();

  if (!(await hasPaidAccess(payload, user, course))) {
    redirect(`/${safeLocale}/courses/${course.slug}?access=denied`);
  }

  const lessons = await withPdfMedia(
    payload,
    await getCourseLessons(course.id, safeLocale, user)
  );
  const currentLesson = getPlayerLesson(lessons, parseLessonOrder(order));
  const player = toPlayerContent(course, lessons, {
    currentLesson,
    downloads: toPlayerDownloads(lessons, safeLocale),
    locale: safeLocale,
    // Постер — обложка урока: Stream иначе показывает случайный кадр.
    videoEmbedUrl: currentLesson?.streamVideoId
      ? getPlaybackUrl(currentLesson.streamVideoId, {
          free: false,
          poster: lessonPosterUrl(currentLesson)
        })
      : null
  });
  return {
    activeOrder: order === undefined ? undefined : requireLessonOrder(player.lessons, order),
    player
  };
};

// media.read пускает не-админов только к картинкам, поэтому PDF у студента
// приходит как id. Покупка уже проверена выше — дорезолвим файлы сами, чтобы
// в «Материалах» было имя файла, а не название урока.
const withPdfMedia = async (payload: Payload, lessons: Lesson[]): Promise<Lesson[]> => {
  const ids = lessons.flatMap((lesson) => (typeof lesson.pdf === 'number' ? [lesson.pdf] : []));

  if (ids.length === 0) {
    return lessons;
  }

  const media = await payload.find({
    collection: 'media',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    where: { id: { in: ids } }
  });
  const byId = new Map(media.docs.map((doc) => [doc.id, doc]));

  return lessons.map((lesson) =>
    typeof lesson.pdf === 'number' && byId.has(lesson.pdf)
      ? { ...lesson, pdf: byId.get(lesson.pdf) }
      : lesson
  );
};

// Сегмент URL → order урока; не число или нет такого урока → 404.
const requireLessonOrder = (lessons: PlayerLesson[], segment: string) => {
  const order = parseLessonOrder(segment);

  if (order === undefined || !getPlayerLesson(lessons, order)) {
    notFound();
  }

  return order;
};
