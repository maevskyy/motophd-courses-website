import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Course } from '@/lib/content';
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

export function PurchasedDashCourse({ compact, courseTitle }: { compact?: boolean; courseTitle: string }) {
  const t = useTranslations();

  return (
    <Link className={styles.dashCourseCard} href="/learn/lean">
      <div className={`${styles.dashCourseThumb} ${styles.dashCourseThumbRed}`}>🏍️</div>
      <div className={styles.dashCourseBody}>
        <div className={styles.dashCourseTitle}>{courseTitle}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
        <div className={styles.dashCourseMeta}>
          <span>{t('dashboard.moduleProgress')}</span>
          <span>{compact ? '40%' : t('dashboard.percentComplete')}</span>
        </div>
        <div className={styles.dashCourseAction}>
          <span className={styles.btnContinue}>
            {compact ? t('actions.continue') : t('actions.continueLearning')} →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function LockedDashCourse({ course }: { course: Course }) {
  const t = useTranslations();

  return (
    <Link className={`${styles.dashCourseCard} ${styles.dashCourseCardLocked}`} href="/courses/lean">
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
          <span className={styles.btnUnlock}>{t('actions.unlockCourse')} — €29</span>
        </div>
      </div>
    </Link>
  );
}
