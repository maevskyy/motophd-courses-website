import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Course } from '@/lib/content/prototype';
import { cx } from '@/lib/classNames';
import styles from './Prototype.module.scss';

type CourseCardProps = {
  course: Course;
  catalog?: boolean;
};

export function CourseCard({ course, catalog = false }: CourseCardProps) {
  const t = useTranslations('actions');

  return (
    <Link
      className={cx(styles.courseCard, course.featured && styles.courseCardFeatured)}
      href="/courses/lean"
    >
      <div
        className={cx(
          styles.courseImg,
          course.imageTone === 'green' && styles.courseImgGreen,
          course.imageTone === 'blue' && styles.courseImgBlue
        )}
      >
        <span className={styles.courseImg__icon}>{course.icon}</span>
        {course.badge ? <div className={styles.courseImg__badge}>{course.badge}</div> : null}
      </div>
      <div className={styles.courseBody}>
        <div className={styles.coursePain}>{course.pain}</div>
        <div className={styles.courseTitle}>{course.title}</div>
        <div className={styles.courseDesc}>{course.description}</div>
        {catalog ? (
          <div className={styles.includes}>
            <div className={styles.includes__title}>What&apos;s included:</div>
            {course.includes.map((item) => (
              <div className={styles.includes__item} key={item}>
                ✓ {item}
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.coursePriceRow}>
          <div className={styles.coursePrice}>
            €29 {!catalog ? <small>/ lifetime</small> : null}
          </div>
          <span className={course.featured ? styles.courseBtn : styles.courseBtnGhost}>
            {course.featured ? t('enrollNow') : t('viewCourse')}
          </span>
        </div>
      </div>
    </Link>
  );
}
