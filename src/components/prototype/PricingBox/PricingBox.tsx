'use client';

import { useActionState, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { legalDocumentHref } from '@/lib/legal';
import type { Locale } from '@/i18n/locales';
import { useToast } from '@/components/providers/ToastProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { SalesContent } from '@/lib/data';
import { checkoutAction } from '@/lib/payments/checkout';
import { useRegionalPrice } from '@/lib/pricing/useRegionalPrice';
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
  const [disclaimerError, setDisclaimerError] = useState(false);
  const disclaimerRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useActionState(checkoutAction, null);
  const prices = useRegionalPrice(sales.pricing);
  const priceOf = (index: number) =>
    `€${sales.options[index].tier === 'standard' ? prices.priceStandard : prices.priceFeedback}`;
  // Пока браузер узнаёт страну — место цены есть, самой цены нет.
  const pendingStyle = prices.pending ? { visibility: 'hidden' as const } : undefined;

  function selectOption(index: number) {
    setSelected(index);
    showToast(t('toast.selected', { price: priceOf(index) }));
  }

  /*
    Кнопка оплаты всегда активна и красная: приглушённая disabled-кнопка
    прятала главное действие страницы. Без галочки дисклеймера форма не уходит —
    показываем подсказку под чекбоксом и ставим на него фокус.
  */
  function guardDisclaimer(event: React.FormEvent<HTMLFormElement>) {
    if (accepted) {
      return;
    }

    event.preventDefault();
    setDisclaimerError(true);
    disclaimerRef.current?.focus();
  }

  return (
    <aside className={cx(styles.box, className)} id="pricing">
      {!checkoutEnabled ? <p className={styles.fallback}>{t('checkout.unavailable')}</p> : null}
      <p className={styles.price} style={pendingStyle}>
        {priceOf(selected)}
      </p>
      <p className={styles.note}>{sales.priceNote}</p>
      <form action={formAction} onSubmit={guardDisclaimer}>
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
                <span className={styles.optionPrice} style={pendingStyle}>
                  {priceOf(index)}
                </span>
              </span>
              <span className={styles.optionDesc}>{option.desc}</span>
            </button>
          ))}
        </div>
        {sales.options[selected].tier === 'feedback' ? (
          <div className={styles.includes}>
            <p className={styles.includesHeading}>{sales.feedbackIncludes.heading}</p>
            <ul className={styles.includesList}>
              {sales.feedbackIncludes.items.map((item) => (
                <li className={styles.includesItem} key={item.title}>
                  <Icon className={styles.includesIcon} name="check" size={14} />
                  <span>
                    <strong className={styles.includesTitle}>{item.title}</strong>
                    <span className={styles.includesText}>{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
              aria-describedby={disclaimerError ? 'checkout-disclaimer-error' : undefined}
              aria-invalid={disclaimerError || undefined}
              checked={accepted}
              className={styles.disclaimerInput}
              onChange={(event) => {
                setAccepted(event.target.checked);

                if (event.target.checked) {
                  setDisclaimerError(false);
                }
              }}
              ref={disclaimerRef}
              type="checkbox"
            />
            <span>{sales.disclaimer}</span>
          </label>
          {disclaimerError ? (
            <p className={styles.error} id="checkout-disclaimer-error" role="alert">
              {t('toast.acceptDisclaimer')}
            </p>
          ) : null}
          {/* Документы, с которыми соглашаются оплатой, — рядом с кнопкой, а не только в подвале. */}
          <p className={styles.legalNote}>
            {t.rich('checkout.legalNote', {
              offer: (chunks) => (
                <a
                  href={legalDocumentHref('offer', locale)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a
                  href={legalDocumentHref('privacy', locale)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {chunks}
                </a>
              )
            })}
          </p>
        </div>
        {state && 'error' in state ? (
          <p className={styles.error} role="alert">
            {t(`checkout.errors.${state.error}`)}
          </p>
        ) : null}
        <button className={styles.submit} disabled={!checkoutEnabled} type="submit">
          {t('actions.pay')}
        </button>
        <p className={styles.altPayment}>
          {t.rich('checkout.altPayment', {
            email: (chunks) => <a href="mailto:support@motophd.com">{chunks}</a>
          })}
        </p>
      </form>
      <p className={styles.guarantee}>
        <Icon className={styles.guaranteeIcon} name="check" size={14} />
        {sales.guarantee}
      </p>
    </aside>
  );
}
