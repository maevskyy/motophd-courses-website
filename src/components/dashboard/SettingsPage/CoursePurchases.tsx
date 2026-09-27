import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import styles from './CoursePurchases.module.scss';

interface Props {
  // Slug'и курсов, где можно докупить обратную связь — считает сервер.
  feedbackUpgradeSlugs: string[];
  purchases: PurchaseHistoryItem[];
}

interface OwnedCourse {
  amount: number;
  currency: string;
  hasFeedback: boolean;
  purchasedAt: string;
  slug: string;
  title: string;
}

const feedbackTiers: ReadonlyArray<PurchaseHistoryItem['tier']> = ['feedback', 'feedback_upgrade'];

/*
  Одна строка на купленный курс вместо двух списков: раньше тариф и история
  покупок шли отдельными блоками и повторяли друг друга. Оплаты одного курса
  схлопываются: сумма складывается (курс + апгрейд), дата — от последней,
  обратная связь есть, если оплачен feedback или feedback_upgrade.
*/
export const getOwnedCourses = (purchases: PurchaseHistoryItem[]): OwnedCourse[] => {
  const owned = new Map<string, OwnedCourse>();

  for (const purchase of purchases) {
    const { amount, courseSlug, courseTitle, currency, purchasedAt, status, tier } = purchase;

    if (!courseSlug || status !== 'paid') continue;

    const current = owned.get(courseSlug);

    owned.set(courseSlug, {
      amount: (current?.amount ?? 0) + amount,
      currency,
      hasFeedback: (current?.hasFeedback ?? false) || feedbackTiers.includes(tier),
      purchasedAt:
        current && new Date(current.purchasedAt) > new Date(purchasedAt)
          ? current.purchasedAt
          : purchasedAt,
      slug: courseSlug,
      title: courseTitle
    });
  }

  return [...owned.values()];
};

export function CoursePurchases({ feedbackUpgradeSlugs, purchases }: Props) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const courses = getOwnedCourses(purchases);

  if (courses.length === 0) {
    return <p className={styles.purchases__empty}>{t('purchaseHistoryEmpty')}</p>;
  }

  const formatDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(amount);

  return (
    <ul className={styles.purchases}>
      {courses.map((course) => (
        <li className={styles.purchases__row} key={course.slug}>
          <div className={styles.purchases__course}>
            <p className={styles.purchases__title}>{course.title}</p>
            <p className={styles.purchases__meta}>
              {t(course.hasFeedback ? 'courseTierFeedback' : 'courseTierStandard')} ·{' '}
              {formatDate.format(new Date(course.purchasedAt))} ·{' '}
              {formatAmount(course.amount, course.currency)}
            </p>
          </div>
          {feedbackUpgradeSlugs.includes(course.slug) ? (
            <Link className={styles.purchases__upgrade} href="/dashboard#upgrade">
              {t('feedbackUpgrade')}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
