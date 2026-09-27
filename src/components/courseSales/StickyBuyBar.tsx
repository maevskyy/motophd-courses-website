'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cx } from '@/lib/classNames';
import styles from './StickyBuyBar.module.scss';

interface Props {
  /** Минимальная цена курса: в панели тариф не выбирают, поэтому «от». */
  price: string;
  /** id блока цены — и цель кнопки, и наблюдаемый элемент. */
  targetId: string;
}

export function StickyBuyBar({ price, targetId }: Props) {
  const t = useTranslations();
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
        <span className={styles.price}>{t('course.priceFrom', { price })}</span>
        <a className={styles.button} href={`#${targetId}`}>
          {t('actions.enrollNow')}
        </a>
      </div>
    </>
  );
}
