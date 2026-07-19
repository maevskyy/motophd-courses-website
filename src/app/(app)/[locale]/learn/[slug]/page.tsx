import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { CoursePlayerClient } from '@/components/player/CoursePlayerClient';
import {
  getCourseBySlug,
  getCourseLessons,
  toAppLocale,
  toCurriculumModules,
  toPlayerContent
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function CoursePlayerPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  await connection();

  const { locale, slug } = await params;
  const safeLocale = toAppLocale(locale);
  const course = await getCourseBySlug(slug, safeLocale);

  if (!course) {
    notFound();
  }

  const lessons = await getCourseLessons(course.id, safeLocale);
  const curriculum = toCurriculumModules(course, lessons);
  const player = toPlayerContent(course, lessons);

  return <CoursePlayerClient curriculum={curriculum} player={player} />;
}
