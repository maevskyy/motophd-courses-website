import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CourseCardCourse } from '@/lib/data';
import { FeedbackUpgradeButton } from './FeedbackUpgradeButton';
import styles from './Dashboard.module.scss';

export function DashStat({ label, suffix = '', value }: { label: string; suffix?: string; value: string }) {
  return (
    <div className={styles.dashStat}>
      <div className={styles.dashStatNum}>
        {value}
        {suffix}
      </div>
      <div className={styles.dashStatLabel}>{label}</div>
    </div>
  );
}

export function PurchasedDashCourse({
  course,
  feedbackUpgrade = false
}: {
  course: CourseCardCourse;
  // Решает сервер по истории покупок (getFeedbackUpgradeCourseSlugs).
  feedbackUpgrade?: boolean;
}) {
  const t = useTranslations();

  // Кнопка докупки — отдельная форма, поэтому карточка больше не целиком
  // ссылка: <form> внутри <a> невалиден, и клик по кнопке уводил бы в плеер.
  return (
    <article className={styles.dashCourseCard}>
      <Link className={styles.dashCourseLink} href={`/learn/${course.slug}`}>
        <div className={styles.dashCourseThumb}>
          <Icon name={course.icon} size={32} />
        </div>
        <div className={styles.dashCourseBody}>
          <div className={styles.dashCourseTitle}>{course.title}</div>
          <div className={styles.dashCourseAction}>
            <span className={styles.btnContinue}>
              {t('actions.continueLearning')}
              <Icon name="arrowRight" size={16} />
            </span>
          </div>
        </div>
      </Link>
      {feedbackUpgrade ? <FeedbackUpgradeButton courseSlug={course.slug} /> : null}
    </article>
  );
}

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
