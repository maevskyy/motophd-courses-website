#!/usr/bin/env node
// Заливает видео в Cloudflare Stream из терминала, кусками по 50 МБ с докачкой.
// Каждое видео сразу создаётся с подписанными ссылками и allowed origins,
// поэтому отдельно защищать их не нужно. Прогресс пишется в stdout, состояние
// (upload URL + uid) — в .stream-uploads.json рядом с файлами: повторный запуск
// пропускает залитое и докачивает оборванное.
//
// Запуск:
//   set -a; source .env; set +a
//   node scripts/stream-upload.mjs ~/Pictures/motophd/video/*.mov
//   node scripts/stream-upload.mjs --public ~/Pictures/motophd/video/teaser.mov
//
// --public — без подписанных ссылок: для тизеров, которые страница курса
// встраивает по голому uid (см. src/lib/video/getTeaserEmbedUrl.ts).
//
// Нужны CF_API_TOKEN (Cloudflare → My Profile → API Tokens, право Stream:Edit)
// и CF_ACCOUNT_ID; если второго нет, берём его из R2_ENDPOINT.
// Токен нигде не печатается.

import { open, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CHUNK = 50 * 1024 * 1024; // кратно 256 КиБ, как требует Stream
const MAX_RETRIES = 5;
const SHORT_TIMEOUT = 30_000; // HEAD/POST
const CHUNK_TIMEOUT = 300_000; // один кусок в 50 МБ; при обрыве сети fetch иначе висит вечно
const API_TOKEN = process.env.CF_API_TOKEN;
const ACCOUNT_ID =
  process.env.CF_ACCOUNT_ID || process.env.R2_ENDPOINT?.match(/^https:\/\/([0-9a-f]{32})\./)?.[1];
const ORIGINS = process.env.STREAM_ALLOWED_ORIGINS || 'motophd.com,www.motophd.com';
const args = process.argv.slice(2);
const isPublic = args.includes('--public');
const files = args.filter((arg) => arg !== '--public');

if (!API_TOKEN || !ACCOUNT_ID) {
  console.error(
    'Нужны CF_API_TOKEN и CF_ACCOUNT_ID (или R2_ENDPOINT). Смотри комментарий в начале файла.'
  );
  process.exit(1);
}

if (files.length === 0) {
  console.error('Укажи файлы: node scripts/stream-upload.mjs <видео...>');
  process.exit(1);
}

const stateFile = path.join(path.dirname(path.resolve(files[0])), '.stream-uploads.json');
const state = await readFile(stateFile, 'utf8')
  .then((text) => JSON.parse(text))
  .catch(() => ({}));
const saveState = () => writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`);

const auth = { Authorization: `Bearer ${API_TOKEN}`, 'Tus-Resumable': '1.0.0' };
const b64 = (value) => Buffer.from(value, 'utf8').toString('base64');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const megabytes = (bytes) => `${Math.round(bytes / 1048576)} МБ`;

// tus creation: Stream отвечает 201, ссылка на докачку в Location, uid в stream-media-id.
const createUpload = async (name, size) => {
  const metadata = [
    `name ${b64(name)}`,
    ...(isPublic ? [] : ['requiresignedurls']),
    `allowedorigins ${b64(ORIGINS)}`
  ].join(',');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      signal: AbortSignal.timeout(SHORT_TIMEOUT),
      headers: {
        ...auth,
        'Upload-Length': String(size),
        'Upload-Metadata': metadata
      }
    }
  );

  if (response.status !== 201) {
    throw new Error(`создание загрузки: ${response.status} ${await response.text()}`);
  }

  return {
    uploadUrl: response.headers.get('location'),
    uid: response.headers.get('stream-media-id')
  };
};

const currentOffset = async (uploadUrl) => {
  const response = await fetch(uploadUrl, {
    method: 'HEAD',
    headers: auth,
    signal: AbortSignal.timeout(SHORT_TIMEOUT)
  });

  if (response.status === 404 || response.status === 410) {
    return null; // загрузка протухла, начинаем заново
  }

  if (!response.ok) {
    throw new Error(`HEAD ${response.status}`);
  }

  return Number(response.headers.get('upload-offset'));
};

const sendChunk = async (uploadUrl, offset, chunk) => {
  const response = await fetch(uploadUrl, {
    method: 'PATCH',
    signal: AbortSignal.timeout(CHUNK_TIMEOUT),
    headers: {
      ...auth,
      'Upload-Offset': String(offset),
      'Content-Type': 'application/offset+octet-stream'
    },
    body: chunk
  });

  if (response.status !== 204) {
    throw new Error(`PATCH ${response.status} ${await response.text()}`);
  }

  return Number(response.headers.get('upload-offset'));
};

const uploadFile = async (file) => {
  const name = path.basename(file, path.extname(file));
  const { size } = await stat(file);
  let entry = state[name];

  if (entry?.done) {
    console.log(`${name}: уже залито, uid ${entry.uid}`);
    return;
  }

  let offset = entry ? await currentOffset(entry.uploadUrl) : null;

  if (offset === null) {
    entry = await createUpload(name, size);
    state[name] = entry;
    await saveState();
    offset = 0;
    console.log(`${name}: старт, ${megabytes(size)}, uid ${entry.uid}${isPublic ? ', публичное' : ''}`);
  } else {
    console.log(`${name}: продолжаю с ${megabytes(offset)} из ${megabytes(size)}`);
  }

  const handle = await open(file, 'r');
  let nextReport = 10;

  try {
    while (offset < size) {
      const length = Math.min(CHUNK, size - offset);
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, offset);

      for (let attempt = 1; ; attempt += 1) {
        try {
          offset = await sendChunk(entry.uploadUrl, offset, buffer);
          break;
        } catch (error) {
          if (attempt >= MAX_RETRIES) {
            throw error;
          }
          console.log(
            `${name}: обрыв (${error.message}), попытка ${attempt + 1} через ${attempt * 5} с`
          );
          await sleep(attempt * 5000);
          const resumed = await currentOffset(entry.uploadUrl);
          if (resumed === null) {
            throw new Error('загрузка протухла на сервере — перезапусти скрипт, начнёт заново');
          }
          if (resumed !== offset) {
            // сервер принял больше/меньше, чем мы думали — перечитываем кусок с его позиции
            offset = resumed;
            break;
          }
        }
      }

      const percent = Math.floor((offset / size) * 100);
      if (percent >= nextReport) {
        console.log(`${name}: ${percent}%`);
        nextReport = Math.floor(percent / 10) * 10 + 10;
      }
    }
  } finally {
    await handle.close();
  }

  entry.done = true;
  await saveState();
  console.log(`${name}: готово`);
};

let failed = 0;

for (const file of files) {
  try {
    await uploadFile(file);
  } catch (error) {
    failed += 1;
    console.log(`${path.basename(file)}: ОШИБКА — ${error.message}`);
  }
}

console.log('\nФАЙЛ              UID');
for (const [name, entry] of Object.entries(state).sort()) {
  console.log(`${name.padEnd(17)} ${entry.uid}  ${entry.done ? 'залито' : 'не дошло'}`);
}

if (failed > 0) {
  console.log(`\nНе залилось: ${failed}. Запусти скрипт ещё раз, он докачает.`);
  process.exit(1);
}
