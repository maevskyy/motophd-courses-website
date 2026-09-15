import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { CoursePlayerClient } from '@/components/player/CoursePlayerClient';
import { hasPaidAccess } from '@/lib/access/hasPaidAccess';
import { requireUser } from '@/lib/auth';
import {
  getCourseBySlug,
  getCourseLessons,
  getPlayerLesson,
  parseLessonOrder,
  toAppLocale,
  toCurriculumModules,
  toPlayerContent,
  toPlayerDownloads
} from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { getPlaybackUrl } from '@/lib/video';

export const dynamic = 'force-dynamic';

export default async function CoursePlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  await connection();

  const [{ locale, slug }, { lesson }] = await Promise.all([params, searchParams]);
  const safeLocale = toAppLocale(locale);
  const requestedOrder = parseLessonOrder(lesson);
  // После логина возвращаем на тот же урок, а не на первый.
  const playerPath =
    `/${safeLocale}/learn/${slug}` +
    (requestedOrder === undefined ? '' : `?lesson=${requestedOrder}`);
  const user = await requireUser(`/${safeLocale}/login?next=${encodeURIComponent(playerPath)}`);
  const course = await getCourseBySlug(slug, safeLocale, user);

  if (!course) {
    notFound();
  }

  const payload = await getPayloadClient();

  if (!(await hasPaidAccess(payload, user, course))) {
    redirect(`/${safeLocale}/courses/${course.slug}?access=denied`);
  }

  const lessons = await getCourseLessons(course.id, safeLocale, user);
  const curriculum = toCurriculumModules(course, lessons, safeLocale);
  // Текущий урок — из ?lesson=<order>; без параметра или с чужим значением
  // играет первый по порядку.
  const currentLesson = getPlayerLesson(lessons, requestedOrder);
  const player = toPlayerContent(course, lessons, {
    currentLesson,
    downloads: toPlayerDownloads(lessons, safeLocale),
    videoEmbedUrl: getPlaybackUrl(currentLesson?.streamVideoId, { free: false })
  });

  return <CoursePlayerClient courseSlug={course.slug} curriculum={curriculum} player={player} />;
}
