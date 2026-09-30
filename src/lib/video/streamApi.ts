// Cloudflare Stream API для раздела «Видео» в админке: создать загрузку,
// узнать статус, удалить, получить весь список. Только сервер: токен с правом
// Stream:Edit не должен попасть в браузер.
//
// Нужны CF_API_TOKEN и CF_ACCOUNT_ID; без второго берём id аккаунта из
// R2_ENDPOINT (как scripts/stream-upload.mjs).

const API_ROOT = 'https://api.cloudflare.com/client/v4/accounts';
const TIMEOUT_MS = 30_000;

export type StreamVideoStatus = 'error' | 'missing' | 'processing' | 'ready' | 'uploading';

export type StreamVideo = {
  allowedOrigins: string[];
  durationSec: number | null;
  name: string | null;
  protected: boolean;
  status: StreamVideoStatus;
  uid: string;
};

type StreamApiVideo = {
  allowedOrigins?: string[];
  duration?: number;
  meta?: { name?: string };
  requireSignedURLs?: boolean;
  status?: { state?: string };
  uid: string;
};

const getAccountId = () =>
  process.env.CF_ACCOUNT_ID ||
  process.env.R2_ENDPOINT?.match(/^https:\/\/([0-9a-f]{32})\./)?.[1] ||
  null;

export const isStreamApiConfigured = () => Boolean(process.env.CF_API_TOKEN && getAccountId());

const requireConfig = () => {
  const token = process.env.CF_API_TOKEN;
  const accountId = getAccountId();

  if (!token || !accountId) {
    throw new Error('Cloudflare Stream не настроен: нужны CF_API_TOKEN и CF_ACCOUNT_ID');
  }

  return { accountId, token };
};

const streamFetch = (path: string, init: RequestInit = {}) => {
  const { accountId, token } = requireConfig();

  return fetch(`${API_ROOT}/${accountId}/stream${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
};

// Домены, с которых плеер Stream согласится играть видео. admin — чтобы видео
// можно было посмотреть в карточке раздела «Видео».
export const getAllowedOrigins = () =>
  (process.env.STREAM_ALLOWED_ORIGINS || 'motophd.com,www.motophd.com,admin.motophd.com')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// pendingupload — файл ещё льётся; downloading/queued/inprogress — Stream
// перекодирует. Цифры прогресса не храним: статус обновляется по кнопке.
export const toStatus = (state: string | undefined): StreamVideoStatus => {
  switch (state) {
    case 'ready':
      return 'ready';
    case 'error':
      return 'error';
    case 'pendingupload':
      return 'uploading';
    default:
      return 'processing';
  }
};

const toVideo = (video: StreamApiVideo): StreamVideo => ({
  allowedOrigins: video.allowedOrigins ?? [],
  durationSec: video.duration && video.duration > 0 ? Math.round(video.duration) : null,
  name: video.meta?.name || null,
  protected: Boolean(video.requireSignedURLs),
  status: toStatus(video.status?.state),
  uid: video.uid
});

const encodeMetadata = (value: string) => Buffer.from(value, 'utf8').toString('base64');

// tus creation для браузера (direct_user=true): Stream отвечает одноразовой
// ссылкой, в которую браузер шлёт файл кусками напрямую, мимо нашего сервера.
// Защита (подписанные ссылки + домены) задаётся здесь, в браузер не отдаётся:
// загрузить видео без неё из админки нельзя.
export const createStreamUpload = async ({ name, size }: { name: string; size: number }) => {
  const metadata = [
    `name ${encodeMetadata(name)}`,
    'requiresignedurls',
    `allowedorigins ${encodeMetadata(getAllowedOrigins().join(','))}`
  ].join(',');

  const response = await streamFetch('?direct_user=true', {
    headers: {
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(size),
      'Upload-Metadata': metadata
    },
    method: 'POST'
  });
  const uploadUrl = response.headers.get('location');
  const uid = response.headers.get('stream-media-id');

  if (response.status !== 201 || !uploadUrl || !uid) {
    throw new Error(`Stream не создал загрузку: ${response.status} ${await response.text()}`);
  }

  return { uid, uploadUrl };
};

// null — видео в Stream нет (удалили в дашборде Cloudflare).
export const getStreamVideo = async (uid: string): Promise<StreamVideo | null> => {
  const response = await streamFetch(`/${encodeURIComponent(uid)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Stream не отдал видео ${uid}: ${response.status}`);
  }

  const body = (await response.json()) as { result: StreamApiVideo };

  return toVideo(body.result);
};

// Защищённому видео, которому не хватает доменов из getAllowedOrigins
// (например, залитому до появления admin.motophd.com), дописываем их.
// Публичные видео (тизеры) не трогаем: у них защиты нет намеренно.
export const needsAllowedOrigins = (video: StreamVideo) =>
  video.protected && getAllowedOrigins().some((origin) => !video.allowedOrigins.includes(origin));

export const addAllowedOrigins = async (video: StreamVideo) => {
  const allowedOrigins = [...new Set([...video.allowedOrigins, ...getAllowedOrigins()])];
  const response = await streamFetch(`/${encodeURIComponent(video.uid)}`, {
    body: JSON.stringify({ allowedOrigins }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`Stream не обновил домены видео ${video.uid}: ${response.status}`);
  }
};

// Уже удалённое в Stream — не ошибка: цель «видео нет» достигнута.
export const deleteStreamVideo = async (uid: string) => {
  const response = await streamFetch(`/${encodeURIComponent(uid)}`, { method: 'DELETE' });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Stream не удалил видео ${uid}: ${response.status}`);
  }
};

// Stream отдаёт до 1000 видео за запрос — на наш каталог хватает с запасом.
export const listStreamVideos = async (): Promise<StreamVideo[]> => {
  const response = await streamFetch('?asc=true');

  if (!response.ok) {
    throw new Error(`Stream не отдал список видео: ${response.status}`);
  }

  const body = (await response.json()) as { result: StreamApiVideo[] };

  return body.result.map(toVideo);
};
