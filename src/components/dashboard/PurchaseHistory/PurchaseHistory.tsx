import { useLocale, useTranslations } from 'next-intl';
import type { PurchaseHistoryItem } from '@/lib/data/purchases';
import { cx } from '@/lib/classNames';
import styles from './PurchaseHistory.module.scss';

const tierKeys = {
  feedback: 'tierFeedback',
  feedback_upgrade: 'tierFeedbackUpgrade',
  standard: 'tierStandard'
} as const;

const statusKeys = {
  failed: 'statusFailed',
  paid: 'statusPaid',
  pending: 'statusPending',
  refunded: 'statusRefunded'
} as const;

export function PurchaseHistory({ purchases }: { purchases: PurchaseHistoryItem[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const formatDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(amount);

  return (
    <section className={styles.history}>
      <h3 className={styles.history__title}>{t('purchaseHistory')}</h3>
      {purchases.length === 0 ? (
        <p className={styles.history__empty}>{t('purchaseHistoryEmpty')}</p>
      ) : (
        purchases.map((purchase) => (
          <div className={styles.history__row} key={purchase.id}>
            <span className={styles.history__course}>{purchase.courseTitle}</span>
            <span className={styles.history__meta}>{t(tierKeys[purchase.tier])}</span>
            <span className={styles.history__meta}>
              {formatDate.format(new Date(purchase.purchasedAt))}
            </span>
            <span className={styles.history__amount}>
              {formatAmount(purchase.amount, purchase.currency)}
            </span>
            <span
              className={cx(
                styles.history__status,
                purchase.status === 'paid' ? styles.history__statusPaid : styles.history__statusOther
              )}
            >
              {t(statusKeys[purchase.status])}
            </span>
          </div>
        ))
      )}
    </section>
  );
}
