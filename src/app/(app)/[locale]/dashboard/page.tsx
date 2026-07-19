import { connection } from 'next/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import {
  getCourseLessons,
  getDashboardCourses,
  toAppLocale,
  toCourseCardCourse,
  toDashboardContent
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  await connection();

  const { locale } = await params;
  const safeLocale = toAppLocale(locale);
  const payloadCourses = await getDashboardCourses(safeLocale);
  const courses = payloadCourses.map((course, index) => toCourseCardCourse(course, index, safeLocale));
  const lessons = payloadCourses[0] ? await getCourseLessons(payloadCourses[0].id, safeLocale) : [];
  const content = toDashboardContent(lessons, safeLocale);

  return <DashboardClient content={content} courses={courses} />;
}
