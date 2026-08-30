'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import styles from './CourseSalesPage.module.scss';

function AccessNoticeInner() {
  const searchParams = useSearchParams();
  const t = useTranslations('access');

  if (searchParams.get('access') !== 'denied') {
    return null;
  }

  return (
    <p className={styles.salesAccessNotice} role="alert">
      {t('courseDenied')}
    </p>
  );
}

// useSearchParams живёт под Suspense, чтобы статичная страница курса
// не выпадала целиком в клиентский рендер из-за query-параметра.
export function AccessNotice() {
  return (
    <Suspense fallback={null}>
      <AccessNoticeInner />
    </Suspense>
  );
}
