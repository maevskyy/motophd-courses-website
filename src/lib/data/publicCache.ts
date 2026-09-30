/*
  Кэш публичных данных витрины: курсы и программа уроков для анонимного
  посетителя. Страницы витрины динамические (региональная цена по стране),
  Cloudflare их не кэширует, и без этого кэша каждый просмотр — запросы в
  Postgres. Данные одинаковые для всех анонимов, поэтому держим их в памяти
  процесса: приложение — один процесс в одном контейнере.

  Сбрасывается целиком хуком clearPublicCacheHook при любом сохранении или
  удалении курса, урока, видео или файла в админке — правка видна сразу.
  TTL — страховка на правки мимо админки (SQL, миграции).

  Запросы от имени пользователя (кабинет, плеер) сюда не ходят: там доступ
  зависит от покупок.
*/

import { revalidatePath } from 'next/cache';

const TTL_MS = 5 * 60 * 1000;

type Entry = { expiresAt: number; value: Promise<unknown> };

const entries = new Map<string, Entry>();

// Копия на каждый ответ: страницы могут менять объект (цены региона), а
// закэшированный оригинал общий для всех запросов.
const copy = <T>(value: T): T => structuredClone(value);

export const cachedPublic = <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const hit = entries.get(key);

  if (hit && hit.expiresAt > now) {
    return (hit.value as Promise<T>).then(copy);
  }

  // Храним промис, а не результат: одновременные запросы после сброса ждут
  // один поход в базу, а не делают по своему.
  const value = load();
  entries.set(key, { expiresAt: now + TTL_MS, value });
  value.catch(() => {
    if (entries.get(key)?.value === value) {
      entries.delete(key);
    }
  });

  return value.then(copy);
};

// Страницы витрины ещё и в кэше Next (ISR): сбрасываем и его, чтобы правка
// была видна сразу, а не через revalidate. Вне запроса Next (CLI, миграции,
// сид) revalidatePath бросает — там сбрасывать нечего.
const revalidateStorefront = () => {
  try {
    revalidatePath('/', 'layout');
  } catch {
    // не в контексте Next
  }
};

export const clearPublicCache = () => {
  entries.clear();
};

const RECLEAR_AFTER_COMMIT_MS = 2000;

// Хуки Payload выполняются до коммита транзакции: запрос витрины в эти
// миллисекунды прочитал бы из базы старые данные и положил их в кэш на весь
// TTL. Поэтому сбрасываем ещё раз, когда транзакция точно закоммичена.
export const clearPublicCacheHook = () => {
  clearPublicCache();
  revalidateStorefront();
  setTimeout(() => {
    clearPublicCache();
    revalidateStorefront();
  }, RECLEAR_AFTER_COMMIT_MS).unref();
};
