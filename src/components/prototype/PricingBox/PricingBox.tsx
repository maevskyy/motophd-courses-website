'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/components/providers/ToastProvider';
import { cx } from '@/lib/classNames';
import type { SalesContent } from '@/lib/data';
import styles from './PricingBox.module.scss';

interface Props {
  courseSlug: string;
  isLoggedIn: boolean;
  loginHref: string;
  sales: SalesContent;
}

export function PricingBox({ courseSlug, isLoggedIn, loginHref, sales }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const { showToast } = useToast();
  const [selected, setSelected] = useState(0);
  const [accepted, setAccepted] = useState(false);

  function selectOption(index: number) {
    setSelected(index);
    showToast(t('toast.selected', { price: sales.options[index].price }));
  }

  function enroll() {
    if (!accepted) {
      showToast(t('toast.acceptDisclaimer'));
      return;
    }

    if (!isLoggedIn) {
      showToast(t('toast.checkout'));
      setTimeout(() => router.push(loginHref), 1000);
      return;
    }

    showToast(t('toast.enrolled'));
    setTimeout(() => router.push(`/learn/${courseSlug}`), 800);
  }

  return (
    <aside className={styles.salesSticky}>
      <div className={styles.salesPrice}>{sales.options[selected].price}</div>
      <p className={styles.salesNote}>{sales.priceNote}</p>
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
      <button className={styles.btnEnroll} onClick={enroll} type="button">
        {t('actions.pay')}
      </button>
      <div className={styles.salesGuarantee}>✓ {sales.guarantee}</div>
    </aside>
  );
}
