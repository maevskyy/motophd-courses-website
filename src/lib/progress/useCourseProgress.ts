'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  markDone as markDoneInStore,
  readProgress,
  setLastOpened as setLastOpenedInStore
} from './store';
import { EMPTY_PROGRESS, type CourseProgress } from './types';

// На сервере и при первом рендере — пустой прогресс, localStorage читаем уже
// после монтирования, чтобы разметка совпала с серверной.
export const useCourseProgress = (courseSlug: string) => {
  const [progress, setProgress] = useState<CourseProgress>(EMPTY_PROGRESS);

  useEffect(() => {
    setProgress(readProgress(courseSlug));
  }, [courseSlug]);

  const markDone = useCallback(
    (order: number) => setProgress(markDoneInStore(courseSlug, order)),
    [courseSlug]
  );

  const setLastOpened = useCallback(
    (order: number) => setProgress(setLastOpenedInStore(courseSlug, order)),
    [courseSlug]
  );

  return { progress, markDone, setLastOpened };
};
