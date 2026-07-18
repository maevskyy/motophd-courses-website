'use client';

import { useState } from 'react';
import { cx } from '@/lib/classNames';
import styles from './FaqAccordion.module.scss';

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  }

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => (
        <div
          className={cx(styles.faqItem, openItems.has(index) && styles.faqItemOpen)}
          key={item.question}
        >
          <button className={styles.faqQuestion} onClick={() => toggle(index)} type="button">
            <span>{item.question}</span>
            <span className={styles.faqIcon}>+</span>
          </button>
          <div className={styles.faqAnswer}>{item.answer}</div>
        </div>
      ))}
    </div>
  );
}
