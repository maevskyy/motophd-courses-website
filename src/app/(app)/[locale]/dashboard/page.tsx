import { connection } from 'next/server';
import { AvailableCoursesSection, MyCoursesPanel } from '@/components/dashboard/DashboardPanels';
import { toMyCourse } from '@/components/dashboard/MyCourse';
import { getFeedbackUpgradeCourseSlugs } from '@/lib/access/feedbackUpgrade';
import { hasFeedbackAccess } from '@/lib/access/hasFeedbackAccess';
import { requireUser } from '@/lib/auth';
import {
  getCourseLessons,
  getDashboardCourses,
  getPublishedCourses,
  getPurchaseHistory,
  toCourseCardCourse
} from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';
import { requireLocale } from '@/i18n/requireLocale';

export const dynamic = 'force-dynamic';

// Экран «Мой курс»: купленные курсы с прогрессом и то, что можно докупить.
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  await connection();

  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/dashboard`)}`
  );
  const payload = await getPayloadClient();
  const [payloadCourses, publishedCourses, purchases, hasFeedback] = await Promise.all([
    getDashboardCourses(safeLocale, user),
    getPublishedCourses(safeLocale, user),
    getPurchaseHistory(safeLocale, user),
    hasFeedbackAccess(payload, user)
  ]);
  const purchasedCourseIds = new Set(payloadCourses.map((course) => course.id));
  const availableCourses = publishedCourses
    .filter((course) => !purchasedCourseIds.has(course.id))
    .map((course, index) => toCourseCardCourse(course, index));
  // Уроки всех купленных курсов — в плоские DTO: объекты Payload в клиент не уезжают.
  const lessonsPerCourse = await Promise.all(
    payloadCourses.map((course) => getCourseLessons(course.id, safeLocale, user))
  );
  const courses = payloadCourses.map((course, index) =>
    toMyCourse(course, lessonsPerCourse[index], safeLocale, index)
  );
  // Докупка обратной связи: paid standard без paid feedback — считаем здесь,
  // в клиент уезжает только список slug'ов.
  const feedbackUpgradeSlugs = getFeedbackUpgradeCourseSlugs(purchases);

  return (
    <>
      <MyCoursesPanel
        courses={courses}
        feedbackUpgradeSlugs={feedbackUpgradeSlugs}
        hasFeedback={hasFeedback}
        name={user.name || user.email}
      />
      <AvailableCoursesSection availableCourses={availableCourses} />
    </>
  );
}
