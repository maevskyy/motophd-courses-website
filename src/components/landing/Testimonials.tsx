'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { HomeContent } from '@/lib/content';
import styles from './Testimonials.module.scss';

type Testimonial = HomeContent['testimonials'][number];

const STARS = [0, 1, 2, 3, 4];

interface Props {
  items: HomeContent['testimonials'];
}

// Все отзывы видны сразу, как в main: без «Показать ещё» и без ссылки на источник.
export function Testimonials({ items }: Props) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <TestimonialCard item={item} key={`${item.name}-${index}`} />
      ))}
    </ul>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const t = useTranslations('actions');
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const quoteId = useId();

  /*
    Кнопка нужна только реально обрезанным цитатам, а обрезка зависит от ширины
    колонки и языка — поэтому меряем в браузере, а не по длине строки в контенте.
    В раскрытом виде не меряем: там обрезки нет, и кнопка «Свернуть» пропала бы.
  */
  useEffect(() => {
    const node = quoteRef.current;

    if (!node || open) {
      return;
    }

    const measure = () => {
      setClamped(node.scrollHeight > node.clientHeight + 1);
    };

    measure();
    // Веб-шрифт доезжает после первого измерения и меняет перенос строк.
    void document.fonts?.ready.then(measure);

    // ResizeObserver есть не везде (jsdom); одно измерение уже сделано выше.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

    observer?.observe(node);

    return () => observer?.disconnect();
  }, [open]);

  return (
    <li className={styles.card}>
      <p aria-label={t('rating')} className={styles.stars} role="img">
        {STARS.map((star) => (
          <Icon key={star} name="starFilled" size={14} />
        ))}
      </p>
      <blockquote
        className={cx(styles.quote, open && styles.quoteOpen)}
        id={quoteId}
        ref={quoteRef}
      >
        {item.quote}
      </blockquote>
      {/*
        Подвал карточки: автор и «Читать целиком» в одной строке под цитатой.
        Отдельная строка под кнопку стоила бы ~96px высоты секции на двух рядах.
      */}
      <div className={styles.footer}>
        <p className={styles.author}>
          <span aria-hidden className={styles.avatar}>
            {item.initial}
          </span>
          <span>{item.name}</span>
        </p>
        {clamped ? (
          <button
            aria-controls={quoteId}
            aria-expanded={open}
            className={styles.readMore}
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? t('showLess') : t('readFull')}
            {/* Одинаковых кнопок на странице до одиннадцати — уточняем, чей это отзыв. */}
            <span className="srOnly">{item.name}</span>
          </button>
        ) : null}
      </div>
    </li>
  );
}
