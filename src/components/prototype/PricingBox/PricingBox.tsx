'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { cx } from '@/lib/classNames';
import type { PrototypeContent } from '@/lib/content';
import styles from './PricingBox.module.scss';

export function PricingBox({ sales }: { sales: PrototypeContent['sales'] }) {
  const t = useTranslations();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
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
      setTimeout(() => router.push('/login'), 1000);
      return;
    }

    showToast(t('toast.enrolled'));
    setTimeout(() => router.push('/learn/lean'), 800);
  }

  return (
    <aside className={styles.salesSticky}>
      <div className={styles.salesPrice}>
        {sales.options[selected].price} <small>/ lifetime</small>
      </div>
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
        {t('actions.enrollNow')} — {sales.options[selected].price}
      </button>
      <div className={styles.salesGuarantee}>✓ {sales.guarantee}</div>
    </aside>
  );
}
