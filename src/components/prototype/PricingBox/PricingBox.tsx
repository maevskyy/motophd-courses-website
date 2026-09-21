'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { useToast } from '@/components/providers/ToastProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { SalesContent } from '@/lib/data';
import { checkoutAction } from '@/lib/payments/checkout';
import styles from './PricingBox.module.scss';

interface Props {
  checkoutEnabled: boolean;
  className?: string;
  courseSlug: string;
  locale: Locale;
  sales: SalesContent;
}

export function PricingBox({ checkoutEnabled, className, courseSlug, locale, sales }: Props) {
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
    <aside className={cx(styles.box, className)} id="pricing">
      {!checkoutEnabled ? <p className={styles.fallback}>{t('checkout.unavailable')}</p> : null}
      <p className={styles.price}>{sales.options[selected].price}</p>
      <p className={styles.note}>{sales.priceNote}</p>
      <form action={formAction}>
        <input name="courseSlug" type="hidden" value={courseSlug} />
        <input name="locale" type="hidden" value={locale} />
        <input name="tier" type="hidden" value={sales.options[selected].tier} />
        <div className={styles.options}>
          {sales.options.map((option, index) => (
            <button
              aria-pressed={selected === index}
              className={cx(styles.option, selected === index && styles.optionSelected)}
              key={option.name}
              onClick={() => selectOption(index)}
              type="button"
            >
              <span className={styles.optionTop}>
                <span className={styles.optionName}>{option.name}</span>
                <span className={styles.optionPrice}>{option.price}</span>
              </span>
              <span className={styles.optionDesc}>{option.desc}</span>
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
          <label className={styles.disclaimerLabel}>
            <input
              checked={accepted}
              className={styles.disclaimerInput}
              onChange={(event) => setAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>{sales.disclaimer}</span>
          </label>
        </div>
        {state && 'error' in state ? (
          <p className={styles.error} role="alert">
            {t(`checkout.errors.${state.error}`)}
          </p>
        ) : null}
        <button className={styles.submit} disabled={!accepted || !checkoutEnabled} type="submit">
          {t('actions.pay')}
        </button>
      </form>
      <p className={styles.guarantee}>
        <Icon className={styles.guaranteeIcon} name="check" size={14} />
        {sales.guarantee}
      </p>
    </aside>
  );
}
