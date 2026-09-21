import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import styles from './CourseTiers.module.scss';

interface Props {
  // Slug'и курсов, где можно докупить обратную связь — считает сервер.
  feedbackUpgradeSlugs: string[];
  purchases: PurchaseHistoryItem[];
}

interface OwnedCourse {
  hasFeedback: boolean;
  slug: string;
  title: string;
}

const feedbackTiers: ReadonlyArray<PurchaseHistoryItem['tier']> = ['feedback', 'feedback_upgrade'];

// Один пункт на купленный курс: оплаченные покупки схлопываются по slug'у,
// обратная связь есть, если оплачен feedback или feedback_upgrade.
export const getOwnedCourses = (purchases: PurchaseHistoryItem[]): OwnedCourse[] => {
  const owned = new Map<string, OwnedCourse>();

  for (const { courseSlug, courseTitle, status, tier } of purchases) {
    if (!courseSlug || status !== 'paid') continue;

    const current = owned.get(courseSlug) ?? {
      hasFeedback: false,
      slug: courseSlug,
      title: courseTitle
    };

    owned.set(courseSlug, {
      ...current,
      hasFeedback: current.hasFeedback || feedbackTiers.includes(tier)
    });
  }

  return [...owned.values()];
};

export function CourseTiers({ feedbackUpgradeSlugs, purchases }: Props) {
  const t = useTranslations('dashboard');
  const courses = getOwnedCourses(purchases);

  if (courses.length === 0) return null;

  return (
    <ul className={styles.tiers}>
      {courses.map((course) => (
        <li className={styles.tiers__row} key={course.slug}>
          <span className={styles.tiers__course}>{course.title}</span>
          <span className={styles.tiers__tier}>
            {t(course.hasFeedback ? 'courseTierFeedback' : 'courseTierStandard')}
          </span>
          {feedbackUpgradeSlugs.includes(course.slug) ? (
            <Link className={styles.tiers__upgrade} href="/dashboard#upgrade">
              {t('feedbackUpgrade')}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
