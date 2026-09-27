import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import type { CourseCardCourse } from '@/lib/data';
import styles from './CourseCard.module.scss';

type CourseCardProps = {
  course: CourseCardCourse;
  catalog?: boolean;
  /** Уровень заголовка карточки — чтобы иерархия h1/h2/h3 на странице шла подряд. */
  titleAs?: 'h2' | 'h3';
};

export function CourseCard({ course, catalog = false, titleAs: Title = 'h3' }: CourseCardProps) {
  const t = useTranslations('actions');

  return (
    <Link className={styles.card} href={`/courses/${course.slug}`}>
      <div className={styles.media}>
        {course.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className={styles.photo} src={course.image} />
        ) : (
          // Одна нейтральная заглушка вместо трёх разноцветных градиентов.
          <span className={styles.placeholder}>
            <Icon name={course.icon} size={40} />
          </span>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.pain}>{course.pain}</p>
        <Title className={styles.title}>{course.title}</Title>
        <p className={styles.desc}>{course.description}</p>
        {catalog ? (
          <div className={styles.includes}>
            <p className={styles.includesTitle}>{t('whatsIncluded')}</p>
            <ul className={styles.includesList}>
              {course.includes.map((item) => (
                <li className={styles.includesItem} key={item}>
                  <Icon className={styles.includesIcon} name="check" size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className={styles.footer}>
          <span className={styles.price}>€{course.priceStandard}</span>
          <span className={styles.action}>
            {catalog ? t('viewCourse') : t('enrollNow')}
            <Icon className={styles.actionIcon} name="arrowRight" size={16} />
          </span>
        </p>
      </div>
    </Link>
  );
}
