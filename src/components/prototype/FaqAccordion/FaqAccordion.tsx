'use client';

import { useId, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './FaqAccordion.module.scss';

export function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());
  const baseId = useId();

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
      {items.map((item, index) => {
        const open = openItems.has(index);
        const answerId = `${baseId}-${index}`;
        const questionId = `${answerId}-question`;

        return (
          <div className={cx(styles.faqItem, open && styles.faqItemOpen)} key={item.question}>
            <h3 className={styles.faqHeading}>
              <button
                aria-controls={answerId}
                aria-expanded={open}
                className={styles.faqQuestion}
                id={questionId}
                onClick={() => toggle(index)}
                type="button"
              >
                <span>{item.question}</span>
                <span className={styles.faqIcon}>
                  <Icon name={open ? 'minus' : 'plus'} size={18} />
                </span>
              </button>
            </h3>
            <div
              aria-labelledby={questionId}
              className={styles.faqAnswer}
              id={answerId}
              role="region"
            >
              {/* Внутренняя обёртка нужна приёму 0fr → 1fr: она несёт отступы и умеет сжиматься до нуля. */}
              <div className={styles.faqAnswerInner}>
                <p className={styles.faqAnswerText}>
                  <span>{item.answer}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
