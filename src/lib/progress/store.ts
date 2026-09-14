import { EMPTY_PROGRESS, type CourseProgress } from './types';

const STORAGE_PREFIX = 'motophd:progress:v1:';

export const progressStorageKey = (courseSlug: string) => `${STORAGE_PREFIX}${courseSlug}`;

// На сервере окна нет; в браузере localStorage может бросить (приватный режим,
// запрет cookies) — в обоих случаях ведём себя как «прогресса нет».
const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isNumber = (value: unknown): value is number => typeof value === 'number';

const parseProgress = (raw: string | null): CourseProgress => {
  if (!raw) {
    return EMPTY_PROGRESS;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null || !('done' in parsed)) {
      return EMPTY_PROGRESS;
    }

    const { done, lastOpened, updatedAt } = parsed as Record<string, unknown>;

    if (!Array.isArray(done)) {
      return EMPTY_PROGRESS;
    }

    return {
      done: done.filter(isNumber),
      ...(isNumber(lastOpened) ? { lastOpened } : {}),
      updatedAt: typeof updatedAt === 'string' ? updatedAt : ''
    };
  } catch {
    return EMPTY_PROGRESS;
  }
};

export const readProgress = (courseSlug: string): CourseProgress => {
  const storage = getStorage();

  if (!storage) {
    return EMPTY_PROGRESS;
  }

  try {
    return parseProgress(storage.getItem(progressStorageKey(courseSlug)));
  } catch {
    return EMPTY_PROGRESS;
  }
};

const writeProgress = (courseSlug: string, progress: CourseProgress) => {
  try {
    getStorage()?.setItem(progressStorageKey(courseSlug), JSON.stringify(progress));
  } catch {
    // Квота или запрет хранилища: прогресс останется только в памяти хука.
  }
};

const withTimestamp = (progress: Omit<CourseProgress, 'updatedAt'>): CourseProgress => ({
  ...progress,
  updatedAt: new Date().toISOString()
});

export const markDone = (courseSlug: string, order: number): CourseProgress => {
  const current = readProgress(courseSlug);
  const done = current.done.includes(order)
    ? current.done
    : [...current.done, order].sort((a, b) => a - b);
  const next = withTimestamp({ ...current, done });

  writeProgress(courseSlug, next);

  return next;
};

export const setLastOpened = (courseSlug: string, order: number): CourseProgress => {
  const next = withTimestamp({ ...readProgress(courseSlug), lastOpened: order });

  writeProgress(courseSlug, next);

  return next;
};
