import { useTranslations } from 'next-intl';
import type { CourseCardCourse } from '@/lib/data';
import { LockedDashCourse } from './DashboardCards';
import { FeedbackCard, MyCourse, type FeedbackStatus, type MyCourseData } from './MyCourse';
import styles from './Dashboard.module.scss';

interface MyCoursesPanelProps {
  courses: MyCourseData[];
  // Slug'и курсов, у которых можно докупить обратную связь — считает сервер.
  feedbackUpgradeSlugs?: string[];
  // Обратная связь уже оплачена (hasFeedbackAccess) — карточка со статусом.
  hasFeedback?: boolean;
  name: string;
}

const feedbackStatus = (
  slug: string,
  upgradeSlugs: string[],
  hasFeedback: boolean
): FeedbackStatus | undefined => {
  if (upgradeSlugs.includes(slug)) {
    return 'upgrade';
  }

  return hasFeedback ? 'connected' : undefined;
};

// Экран «Мой курс»: приветствие, затем на каждый купленный курс —
// resume-карточка, модули и карточка обратной связи. Плашек статистики нет:
// единственная цифра на экране — прогресс.
export function MyCoursesPanel({
  courses,
  feedbackUpgradeSlugs = [],
  hasFeedback = false,
  name
}: MyCoursesPanelProps) {
  const t = useTranslations();
  let upgradeAnchorUsed = false;

  return (
    <>
      <div className={styles.dashGreeting}>
        <h1 className={styles.dashGreetingTitle}>{t('dashboard.welcomeTitle', { name })}</h1>
      </div>
      <div className={styles.dashCourseList}>
        {courses.map((course) => {
          const status = feedbackStatus(course.slug, feedbackUpgradeSlugs, hasFeedback);
          // Якорь #upgrade (ссылка из настроек) — только у первой карточки.
          const id = status && !upgradeAnchorUsed ? 'upgrade' : undefined;

          upgradeAnchorUsed = upgradeAnchorUsed || Boolean(id);

          return (
            <div className={styles.dashCourseBlock} key={course.slug}>
              <MyCourse course={course} />
              {status ? <FeedbackCard course={course} id={id} status={status} /> : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

// Секция «Можно купить» — только при наличии непокупленных курсов.
export function AvailableCoursesSection({
  availableCourses = []
}: {
  availableCourses?: CourseCardCourse[];
}) {
  const t = useTranslations();

  if (availableCourses.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.dashSectionTitle}>{t('dashboard.availableToPurchase')}</div>
      <div className={styles.dashCourses}>
        {availableCourses.map((course) => (
          <LockedDashCourse course={course} key={course.slug} />
        ))}
      </div>
    </>
  );
}
