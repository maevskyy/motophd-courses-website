'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
// Напрямую из checkout, не через баррель @/lib/payments: баррель тянет
// server-only код (next/headers) в клиентский бандл и роняет прод-сборку.
import { checkoutAction } from '@/lib/payments/checkout';
import styles from './FeedbackUpgradeButton.module.scss';

interface Props {
  courseSlug: string;
}

// Кнопка «докупить обратную связь» у купленного standard-курса. Показывать её
// или нет — решает сервер (getFeedbackUpgradeCourseSlugs); здесь только вызов
// готового чекаута с тарифом feedback_upgrade, цену разницы считает он сам.
export function FeedbackUpgradeButton({ courseSlug }: Props) {
  const t = useTranslations('dashboard');
  const checkout = useTranslations('checkout');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(checkoutAction, null);

  return (
    <form action={formAction} className={styles.upgrade}>
      <input name="courseSlug" type="hidden" value={courseSlug} />
      <input name="locale" type="hidden" value={locale} />
      <input name="tier" type="hidden" value="feedback_upgrade" />
      <button className={styles.upgrade__button} disabled={pending} type="submit">
        {t(pending ? 'feedbackUpgradePending' : 'feedbackUpgrade')}
      </button>
      <p className={styles.upgrade__hint}>{t('feedbackUpgradeHint')}</p>
      {state && 'error' in state ? (
        <p className={styles.upgrade__error} role="alert">
          {checkout(`errors.${state.error}`)}
        </p>
      ) : null}
    </form>
  );
}
