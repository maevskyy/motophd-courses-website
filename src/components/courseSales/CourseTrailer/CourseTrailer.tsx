'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/locales';
import styles from './CourseTrailer.module.scss';

interface Props {
  courseSlug: string;
  courseTitle: string;
  locale: Locale;
  // Обложка курса до нажатия play; нет обложки — тёмный экран с кнопкой.
  poster: null | string;
}

type TrailerState = { status: 'error' | 'idle' | 'loading' } | { status: 'ready'; url: string };

// Нажатие play — уже жест пользователя, поэтому плеер стартует сам.
const withAutoplay = (url: string) => {
  const next = new URL(url);
  next.searchParams.set('autoplay', 'true');
  return next.toString();
};

// Ссылку на видео берём только по нажатию: страница живёт в кэше дольше,
// чем бесплатный токен Stream (api/courses/[slug]/teaser).
export function CourseTrailer({ courseSlug, courseTitle, locale, poster }: Props) {
  const t = useTranslations('courseTrailer');
  const [state, setState] = useState<TrailerState>({ status: 'idle' });

  const play = async () => {
    setState({ status: 'loading' });

    try {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(courseSlug)}/teaser?locale=${locale}`
      );

      if (!response.ok) {
        throw new Error(`Trailer request failed: ${response.status}`);
      }

      const { url } = (await response.json()) as { url: string };
      setState({ status: 'ready', url: withAutoplay(url) });
    } catch {
      setState({ status: 'error' });
    }
  };

  return (
    <div className={styles.trailer}>
      <div className={styles.screen}>
        {state.status === 'ready' ? (
          <iframe
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            className={styles.frame}
            src={state.url}
            title={t('title', { course: courseTitle })}
          />
        ) : (
          <button
            aria-label={t('play', { course: courseTitle })}
            className={styles.facade}
            disabled={state.status === 'loading'}
            onClick={play}
            type="button"
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className={styles.poster} src={poster} />
            ) : null}
            <span className={styles.playIcon}>
              <Icon name="play" size={28} />
            </span>
            <span className={styles.label}>{t('label')}</span>
          </button>
        )}
      </div>
      {state.status === 'error' ? (
        <p className={styles.error} role="alert">
          {t('error')}
        </p>
      ) : null}
    </div>
  );
}
