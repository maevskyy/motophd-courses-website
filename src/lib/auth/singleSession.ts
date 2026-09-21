import type { CollectionAfterLoginHook } from 'payload';

type SessionRecord = { id: string };
type UserWithSessions = { id: number | string; sessions?: null | SessionRecord[]; updatedAt?: null | string };

// Читаем sid из JWT без проверки подписи: токен только что выписан самим
// Payload в этом же запросе, проверять нечего.
export const decodeSessionId = (token: string): null | string => {
  const [, claims] = token.split('.');

  if (!claims) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
    const sid = (parsed as { sid?: unknown }).sid;

    return typeof sid === 'string' ? sid : null;
  } catch {
    return null;
  }
};

// Одна активная сессия на пользователя: вход с нового устройства выбивает
// все предыдущие. Payload хранит сессии списком (users_sessions) и при входе
// дописывает новую — здесь оставляем только её. Пишем через db, как сам
// Payload в addSessionToUser: та же транзакция (req), без хуков коллекции
// и без сдвига updatedAt.
export const keepOnlyCurrentSession: CollectionAfterLoginHook<UserWithSessions> = async ({
  collection,
  req,
  token,
  user
}) => {
  const sid = decodeSessionId(token);
  const sessions = user.sessions ?? [];

  if (!sid || sessions.length <= 1) {
    return user;
  }

  const current = sessions.filter((session) => session.id === sid);

  if (current.length === 0) {
    return user;
  }

  const next = { ...user, sessions: current, updatedAt: null };

  await req.payload.db.updateOne({
    id: user.id,
    collection: collection.slug,
    data: next,
    req,
    returning: false
  });

  return next;
};
