import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { CoursePlayerClient } from '@/components/player/CoursePlayerClient';
import { hasPaidAccess } from '@/lib/access/hasPaidAccess';
import { requireUser } from '@/lib/auth';
import {
  getCourseBySlug,
  getCourseLessons,
  getPlayerLesson,
  toAppLocale,
  toCurriculumModules,
  toPlayerContent
} from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { getPlaybackUrl } from '@/lib/video';

export const dynamic = 'force-dynamic';

export default async function CoursePlayerPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  await connection();

  const { locale, slug } = await params;
  const safeLocale = toAppLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/learn/${slug}`)}`
  );
  const course = await getCourseBySlug(slug, safeLocale, user);

  if (!course) {
    notFound();
  }

  const payload = await getPayloadClient();

  if (!(await hasPaidAccess(payload, user, course))) {
    redirect(`/${safeLocale}/courses/${course.slug}?access=denied`);
  }

  const lessons = await getCourseLessons(course.id, safeLocale, user);
  const curriculum = toCurriculumModules(course, lessons);
  const currentLesson = getPlayerLesson(lessons);
  const player = toPlayerContent(course, lessons, {
    pdfUrl:
      currentLesson?.type === 'pdf'
        ? `/api/lessons/${currentLesson.id}/pdf?locale=${safeLocale}`
        : null,
    videoEmbedUrl: getPlaybackUrl(currentLesson?.streamVideoId, { free: false })
  });

  return <CoursePlayerClient curriculum={curriculum} player={player} />;
}
