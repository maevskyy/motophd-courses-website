import { connection } from 'next/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { requireUser } from '@/lib/auth';
import {
  getCourseLessons,
  getDashboardCourses,
  getPublishedCourses,
  toAppLocale,
  toCourseCardCourse,
  toDashboardContent
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  await connection();

  const { locale } = await params;
  const safeLocale = toAppLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/dashboard`)}`
  );
  const [payloadCourses, publishedCourses] = await Promise.all([
    getDashboardCourses(safeLocale, user),
    getPublishedCourses(safeLocale, user)
  ]);
  const purchasedCourseIds = new Set(payloadCourses.map((course) => course.id));
  const courses = payloadCourses.map((course, index) => toCourseCardCourse(course, index, safeLocale));
  const availableCourses = publishedCourses
    .filter((course) => !purchasedCourseIds.has(course.id))
    .map((course, index) => toCourseCardCourse(course, index, safeLocale));
  const lessons = payloadCourses[0]
    ? await getCourseLessons(payloadCourses[0].id, safeLocale, user)
    : [];
  const content = toDashboardContent(lessons, safeLocale);

  return (
    <DashboardClient
      availableCourses={availableCourses}
      content={content}
      courses={courses}
      email={user.email}
      locale={safeLocale}
      name={user.name || user.email}
    />
  );
}
