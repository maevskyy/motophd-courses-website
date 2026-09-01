'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/providers/ToastProvider';
import { cx } from '@/lib/classNames';
import type { SalesContent } from '@/lib/data';
import { checkoutAction } from '@/lib/payments/checkout';
import styles from './PricingBox.module.scss';

interface Props {
  checkoutEnabled: boolean;
  courseSlug: string;
  locale: 'en' | 'ru';
  sales: SalesContent;
}

export function PricingBox({ checkoutEnabled, courseSlug, locale, sales }: Props) {
  const t = useTranslations();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [state, formAction] = useActionState(checkoutAction, null);

  function selectOption(index: number) {
    setSelected(index);
    showToast(t('toast.selected', { price: sales.options[index].price }));
  }

  return (
    <aside className={styles.salesSticky}>
      {!checkoutEnabled ? (
        <p className={styles.checkoutFallback}>{t('checkout.unavailable')}</p>
      ) : null}
      <div className={styles.salesPrice}>{sales.options[selected].price}</div>
      <p className={styles.salesNote}>{sales.priceNote}</p>
      <form action={formAction}>
        <input name="courseSlug" type="hidden" value={courseSlug} />
        <input name="locale" type="hidden" value={locale} />
        <input name="tier" type="hidden" value={sales.options[selected].tier} />
        <div className={styles.priceOptions}>
          {sales.options.map((option, index) => (
            <button
              className={cx(styles.priceOption, selected === index && styles.priceOptionSelected)}
              key={option.name}
              onClick={() => selectOption(index)}
              type="button"
            >
              <div className={styles.priceOption__top}>
                <span className={styles.priceOption__name}>{option.name}</span>
                <span className={styles.priceOption__price}>{option.price}</span>
              </div>
              <div className={styles.priceOption__desc}>{option.desc}</div>
            </button>
          ))}
        </div>
        <label className={styles.fieldLabel} htmlFor="checkout-email">
          {t('checkout.email')}
        </label>
        <input className={styles.field} id="checkout-email" name="email" type="email" />
        <label className={styles.fieldLabel} htmlFor="checkout-promo">
          {t('checkout.promoCode')}
        </label>
        <input className={styles.field} id="checkout-promo" name="promoCode" type="text" />
        <div className={styles.disclaimer}>
          <label className={styles.disclaimer__label}>
            <input
              checked={accepted}
              className={styles.disclaimer__input}
              onChange={(event) => setAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>{sales.disclaimer}</span>
          </label>
        </div>
        {state && 'error' in state ? <p className={styles.checkoutError}>{t(`checkout.errors.${state.error}`)}</p> : null}
        <button className={styles.btnEnroll} disabled={!accepted || !checkoutEnabled} type="submit">
          {t('actions.pay')}
        </button>
      </form>
      <div className={styles.salesGuarantee}>✓ {sales.guarantee}</div>
    </aside>
  );
}
