import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { CourseCardCourse } from '@/lib/data';
import { cx } from '@/lib/classNames';
import styles from './CourseCard.module.scss';

type CourseCardProps = {
  course: CourseCardCourse;
  catalog?: boolean;
};

export function CourseCard({ course, catalog = false }: CourseCardProps) {
  const t = useTranslations('actions');
  const showEnroll = !catalog || course.featured;

  return (
    <Link
      className={cx(styles.courseCard, course.featured && styles.courseCardFeatured)}
      href={`/courses/${course.slug}`}
    >
      <div
        className={cx(
          styles.courseImg,
          course.imageTone === 'green' && styles.courseImgGreen,
          course.imageTone === 'blue' && styles.courseImgBlue
        )}
      >
        {course.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={course.title} className={styles.courseImg__photo} src={course.image} />
        ) : (
          <span className={styles.courseImg__icon}>{course.icon}</span>
        )}
      </div>
      <div className={styles.courseBody}>
        <div className={styles.coursePain}>{course.pain}</div>
        <div className={styles.courseTitle}>{course.title}</div>
        <div className={styles.courseDesc}>{course.description}</div>
        {catalog ? (
          <div className={styles.includes}>
            <div className={styles.includes__title}>{t('whatsIncluded')}</div>
            {course.includes.map((item) => (
              <div className={styles.includes__item} key={item}>
                ✓ {item}
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.coursePriceRow}>
          <div className={styles.coursePrice}>€{course.priceStandard}</div>
          <span className={showEnroll ? styles.courseBtn : styles.courseBtnGhost}>
            {showEnroll ? t('enrollNow') : t('viewCourse')}
          </span>
        </div>
      </div>
    </Link>
  );
}
