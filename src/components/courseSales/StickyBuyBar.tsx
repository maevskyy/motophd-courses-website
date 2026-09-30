'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cx } from '@/lib/classNames';
import { type CoursePricing, useRegionalPrice } from '@/lib/pricing/useRegionalPrice';
import styles from './StickyBuyBar.module.scss';

interface Props {
  /** Цены курса: в панели тариф не выбирают, поэтому «от» младшего тарифа. */
  pricing: CoursePricing;
  /** id блока цены — и цель кнопки, и наблюдаемый элемент. */
  targetId: string;
}

export function StickyBuyBar({ pricing, targetId }: Props) {
  const t = useTranslations();
  const { pending, priceStandard } = useRegionalPrice(pricing);
  // Стартуем скрытыми: до первого срабатывания наблюдателя панель не должна
  // мигать поверх страницы.
  const [targetVisible, setTargetVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    // Панель — это дубль блока цены. Пока сам блок на экране, она бесполезна и
    // только загораживает поля формы оплаты, поэтому уезжает вниз.
    const observer = new IntersectionObserver(([entry]) => {
      setTargetVisible(entry.isIntersecting);
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [targetId]);

  return (
    <>
      {/* Панель зафиксирована и не занимает места в потоке — распорка резервирует
          её высоту, чтобы низ подвала не оказался под ней. */}
      <div aria-hidden className={styles.spacer} />
      <div className={cx(styles.bar, targetVisible && styles.barHidden)}>
        <span className={styles.price} style={pending ? { visibility: 'hidden' } : undefined}>
          {t('course.priceFrom', { price: `€${priceStandard}` })}
        </span>
        <a className={styles.button} href={`#${targetId}`}>
          {t('actions.enrollNow')}
        </a>
      </div>
    </>
  );
}
