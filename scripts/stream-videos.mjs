#!/usr/bin/env node
// Помощник для Cloudflare Stream: показывает все видео аккаунта, включает
// подписанные ссылки и allowed origins, печатает таблицу «имя → UID».
//
// Заливать файлы удобнее руками в дашборде (он умеет докачку больших файлов),
// а этот скрипт делает скучную часть: обходит все видео и проставляет защиту,
// чтобы не кликать по каждому ролику отдельно.
//
// Запуск:
//   CF_ACCOUNT_ID=... CF_API_TOKEN=... node scripts/stream-videos.mjs        # только показать
//   CF_ACCOUNT_ID=... CF_API_TOKEN=... node scripts/stream-videos.mjs --apply # показать и защитить
//
// Токен создаётся в Cloudflare → My Profile → API Tokens с правом Stream:Edit.
// Ни токен, ни UID в репозиторий не попадают — скрипт только читает переменные.

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const API_TOKEN = process.env.CF_API_TOKEN;
const APPLY = process.argv.includes('--apply');
const ORIGINS = (process.env.STREAM_ALLOWED_ORIGINS || 'motophd.com,www.motophd.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error(
    'Нужны переменные CF_ACCOUNT_ID и CF_API_TOKEN. Смотри комментарий в начале файла.'
  );
  process.exit(1);
}

const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`;
const headers = { Authorization: `Bearer ${API_TOKEN}` };

const call = async (url, init = {}) => {
  const response = await fetch(url, { ...init, headers: { ...headers, ...init.headers } });
  const body = await response.json();

  if (!response.ok || !body.success) {
    const detail = body.errors?.map((error) => error.message).join('; ') || response.statusText;
    throw new Error(`${init.method || 'GET'} ${url} → ${response.status}: ${detail}`);
  }

  return body.result;
};

// Stream отдаёт видео страницами по 1000; курсор — created_before последнего.
const listVideos = async () => {
  const videos = [];
  let before = null;

  for (;;) {
    const url = new URL(API);
    url.searchParams.set('limit', '1000');
    if (before) {
      url.searchParams.set('before', before);
    }

    const page = await call(url.toString());
    videos.push(...page);

    if (page.length < 1000) {
      return videos;
    }

    before = page[page.length - 1].created;
  }
};

const protect = (video) =>
  call(`${API}/${video.uid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requireSignedURLs: true, allowedOrigins: ORIGINS })
  });

const videos = await listVideos();

if (videos.length === 0) {
  console.log('В аккаунте нет ни одного видео.');
  process.exit(0);
}

const unprotected = videos.filter((video) => !video.requireSignedURLs);

if (APPLY && unprotected.length > 0) {
  for (const video of unprotected) {
    await protect(video);
    console.log(`защищено: ${video.meta?.name || video.uid}`);
  }
  console.log('');
}

const rows = (APPLY ? await listVideos() : videos)
  .slice()
  .sort((a, b) => (a.meta?.name || '').localeCompare(b.meta?.name || ''));

const nameWidth = Math.max(...rows.map((video) => (video.meta?.name || '—').length), 4);
const line = (name, uid, state) => `${name.padEnd(nameWidth)}  ${uid}  ${state}`;

console.log(line('ФАЙЛ', 'UID'.padEnd(32), 'СОСТОЯНИЕ'));

for (const video of rows) {
  const ready = video.status?.state === 'ready' ? 'готово' : `${video.status?.state || '?'}`;
  const signed = video.requireSignedURLs ? 'защищено' : 'ОТКРЫТО';
  console.log(line(video.meta?.name || '—', video.uid, `${ready}, ${signed}`));
}

const stillOpen = rows.filter((video) => !video.requireSignedURLs).length;

if (stillOpen > 0) {
  console.log(`\nБез подписанных ссылок: ${stillOpen}. Запусти с --apply, чтобы закрыть.`);
}
