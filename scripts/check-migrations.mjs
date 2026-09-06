#!/usr/bin/env node
// Страховка от потери данных в миграциях (MOT-37).
//
// `pnpm payload migrate:create` строит диф от снапшота к текущей схеме Payload.
// Если поле пропало из схемы (плагин выключен, опечатка, не та ветка), drizzle
// честно вписывает в up() `DROP COLUMN` / `DROP TABLE` — а на проде это потеря
// данных. 01.09 так «уехал» `ALTER TABLE "media" DROP COLUMN "prefix"`.
//
// Скрипт читает только тело up() каждой миграции: в down() DROP легален.
// Падает (exit 1), если в up() найден DROP TABLE или DROP COLUMN по таблице
// из PROTECTED_TABLES. Осознанное удаление — расширить список/убрать таблицу
// из него в том же PR, что и миграция, с объяснением в описании.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROTECTED_TABLES = ['media'];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'src', 'migrations');

const dropTable = /\bDROP\s+TABLE\b/i;
const dropColumnOnProtectedTable = new RegExp(
  `\\bALTER\\s+TABLE\\s+(?:"?public"?\\.)?"?(?:${PROTECTED_TABLES.join('|')})"?\\s+DROP\\s+COLUMN\\b`,
  'i'
);

const extractUpBody = (source) => {
  const upStart = source.search(/export\s+async\s+function\s+up\s*\(/);

  if (upStart === -1) {
    return '';
  }

  const downStart = source.search(/export\s+async\s+function\s+down\s*\(/);
  const body = downStart > upStart ? source.slice(upStart, downStart) : source.slice(upStart);

  // Сжимаем переносы: SQL в шаблонной строке может быть разбит на строки.
  return body.replace(/\s+/g, ' ');
};

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
  .sort();

const violations = [];

for (const file of migrationFiles) {
  const upBody = extractUpBody(readFileSync(path.join(migrationsDir, file), 'utf8'));

  if (dropTable.test(upBody)) {
    violations.push(`${file}: up() содержит DROP TABLE`);
  }

  if (dropColumnOnProtectedTable.test(upBody)) {
    violations.push(
      `${file}: up() содержит DROP COLUMN по защищённой таблице (${PROTECTED_TABLES.join(', ')})`
    );
  }
}

if (violations.length > 0) {
  console.error('check-migrations: найдены деструктивные операции в up():');

  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }

  console.error(
    '\nЭто потеря данных на проде. Прочитай миграцию глазами; если удаление осознанное —' +
      ' обнови PROTECTED_TABLES в scripts/check-migrations.mjs в том же PR и объясни почему.'
  );
  process.exit(1);
}

console.log(`check-migrations: ${migrationFiles.length} миграций, деструктивных операций в up() нет.`);
