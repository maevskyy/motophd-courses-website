import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { CourseCardCourse } from '@/lib/data';
import { cx } from '@/lib/classNames';
import styles from './Dashboard.module.scss';

export function DashStat({ label, suffix = '', value }: { label: string; suffix?: string; value: string }) {
  return (
    <div className={styles.dashStat}>
      <div className={styles.dashStatNum}>
        <span className={styles.red}>{value}</span>
        {suffix}
      </div>
      <div className={styles.dashStatLabel}>{label}</div>
    </div>
  );
}

export function PurchasedDashCourse({ course }: { course: CourseCardCourse }) {
  const t = useTranslations();

  return (
    <Link className={styles.dashCourseCard} href={`/learn/${course.slug}`}>
      <div className={`${styles.dashCourseThumb} ${styles.dashCourseThumbRed}`}>🏍️</div>
      <div className={styles.dashCourseBody}>
        <div className={styles.dashCourseTitle}>{course.title}</div>
        <div className={styles.dashCourseAction}>
          <span className={styles.btnContinue}>{t('actions.continueLearning')} →</span>
        </div>
      </div>
    </Link>
  );
}

export function LockedDashCourse({ course }: { course: CourseCardCourse }) {
  const t = useTranslations();

  return (
    <Link className={`${styles.dashCourseCard} ${styles.dashCourseCardLocked}`} href={`/courses/${course.slug}`}>
      <div
        className={cx(
          styles.dashCourseThumb,
          course.imageTone === 'green' && styles.dashCourseThumbGreen,
          course.imageTone === 'blue' && styles.dashCourseThumbBlue
        )}
      >
        {course.icon}
        <div className={styles.dashLockOverlay}>🔒</div>
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
