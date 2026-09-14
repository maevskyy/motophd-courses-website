import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CourseCardCourse } from '@/lib/data';
import styles from './Dashboard.module.scss';

// Купленный курс живёт в MyCourse/ (resume-карточка + модули); здесь только
// карточка «Можно купить».
export function LockedDashCourse({ course }: { course: CourseCardCourse }) {
  const t = useTranslations();

  return (
    <Link className={cx(styles.dashCourseCard, styles.dashCourseLink)} href={`/courses/${course.slug}`}>
      <div className={styles.dashCourseThumb}>
        <Icon name={course.icon} size={32} />
        <span className={styles.dashLockOverlay}>
          <Icon name="lock" size={24} />
        </span>
      </div>
      <div className={styles.dashCourseBody}>
        <div className={styles.dashCourseTitle}>{course.title}</div>
        <div className={styles.dashCourseMeta}>
          <span>{t('dashboard.notPurchased')}</span>
        </div>
        <div className={styles.dashCourseAction}>
          <span className={styles.btnUnlock}>{t('actions.unlockCourse')} — €{course.priceStandard}</span>
        </div>
      </div>
    </Link>
  );
}
