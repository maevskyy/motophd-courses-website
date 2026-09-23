#!/usr/bin/env node
// Заливает обложки уроков в Media и привязывает их к урокам курса через REST
// Payload — без кликов в админке. Картинки лежат в папке как <lang>-<NN>.jpg
// (ru-01.jpg, en-03.jpg, …): lang — локаль, NN — порядковый номер урока (order).
// uk отдельно не нужен: у него fallback на ru.
//
// Запуск:
//   node scripts/attach-lesson-covers.mjs --site https://motophd.com --course lean ~/Pictures/motophd/covers
//
// Спросит email и пароль админа (пароль не показывается и не сохраняется).
// Повторный запуск пропускает уроки, у которых обложка уже есть; --force
// перезаписывает. Логин создаёт сессию → по правилу «одна сессия» админка
// в браузере разлогинится, это ожидаемо.

import { openAsBlob } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};
const site = (option('--site', 'https://motophd.com') || '').replace(/\/$/, '');
const courseSlug = option('--course', 'lean');
const force = args.includes('--force');
const dir = args.filter((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--site' && args[index - 1] !== '--course')[0];

if (!dir) {
  console.error('Укажи папку с картинками: node scripts/attach-lesson-covers.mjs [--site URL] [--course slug] <папка>');
  process.exit(1);
}

// В терминале спрашиваем через rl.question (пароль скрыт); при вводе из pipe
// читаем строки итератором — второй question успевает потерять строку.
const isTTY = Boolean(process.stdin.isTTY);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: isTTY });
const pipedLines = isTTY ? null : rl[Symbol.asyncIterator]();
const ask = async (question, { hidden = false } = {}) => {
  if (pipedLines) {
    const { value } = await pipedLines.next();
    return (value ?? '').trim();
  }
  return new Promise((resolve) => {
    const write = rl._writeToOutput;
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) rl.output.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl._writeToOutput = write;
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
};

const api = async (pathname, { token, ...init } = {}) => {
  const response = await fetch(`${site}/api${pathname}`, {
    ...init,
    headers: { ...(token ? { Authorization: `JWT ${token}` } : {}), ...(init.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${init.method || 'GET'} ${pathname}: ${response.status} ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
};

const files = (await readdir(dir))
  .map((name) => ({ name, match: name.match(/^([a-z]{2})-(\d{2})\.(jpe?g|png|webp)$/i) }))
  .filter(({ match }) => match)
  .map(({ name, match }) => ({ file: path.join(dir, name), locale: match[1].toLowerCase(), name, order: Number(match[2]) }))
  // На один урок и локаль — один файл; при дублях (ru-01.jpg и ru-01.png) берём jpg.
  .sort((a, b) => a.locale.localeCompare(b.locale) || a.order - b.order || a.name.localeCompare(b.name))
  .filter((item, index, all) => index === 0 || all[index - 1].locale !== item.locale || all[index - 1].order !== item.order);

if (files.length === 0) {
  console.error(`В ${dir} нет файлов вида ru-01.jpg`);
  process.exit(1);
}

const email = await ask('Email админа: ');
const password = await ask('Пароль: ', { hidden: true });
rl.close();
const { token } = await api('/users/login', {
  body: JSON.stringify({ email, password }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST'
});

const { docs: courses } = await api(`/courses?where[slug][equals]=${courseSlug}&limit=1`, { token });
if (courses.length === 0) {
  throw new Error(`курс ${courseSlug} не найден`);
}
const course = courses[0];

const lessonsByLocale = new Map();
const lessonsFor = async (locale) => {
  if (!lessonsByLocale.has(locale)) {
    const { docs } = await api(
      `/lessons?where[course][equals]=${course.id}&sort=order&limit=100&locale=${locale}&fallback-locale=none&depth=0`,
      { token }
    );
    lessonsByLocale.set(locale, docs);
  }
  return lessonsByLocale.get(locale);
};

let attached = 0;
let skipped = 0;

for (const { file, locale, name, order } of files) {
  const lesson = (await lessonsFor(locale)).find((doc) => doc.order === order);
  if (!lesson) {
    console.log(`${name}: урока с order=${order} нет, пропуск`);
    skipped += 1;
    continue;
  }
  if (lesson.cover && !force) {
    console.log(`${name}: у урока ${lesson.id} (${locale}) обложка уже есть, пропуск (--force чтобы заменить)`);
    skipped += 1;
    continue;
  }

  const form = new FormData();
  // openAsBlob не знает mime → Payload видит octet-stream и отклоняет; задаём сами.
  const mime = /\.png$/i.test(name) ? 'image/png' : /\.webp$/i.test(name) ? 'image/webp' : 'image/jpeg';
  form.append('file', new Blob([await openAsBlob(file)], { type: mime }), name);
  form.append('_payload', JSON.stringify({ alt: `${course.title} — lesson ${order} (${locale})` }));
  const { doc: media } = await api('/media', { body: form, method: 'POST', token });

  await api(`/lessons/${lesson.id}?locale=${locale}`, {
    body: JSON.stringify({ cover: media.id }),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
    token
  });
  lesson.cover = media.id;

  console.log(`${name}: media ${media.id} → урок ${lesson.id} (${locale})`);
  attached += 1;
}

console.log(`\nПривязано: ${attached}, пропущено: ${skipped}.`);
