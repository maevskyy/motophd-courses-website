import type { DefaultDocumentIDType, Payload, Where } from 'payload';

import type { Media } from '@/payload-types';

import { locales } from './contentSeedData';

// Payload требует у PDF заголовок, xref-таблицу и %%EOF (utilities/validatePDF).
// Смещения в xref соответствуют этой строке — менять её только вместе с ними.
export const fixturePdf = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 /Kids [] >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF\n'
);

export const FIXTURE_PDF_FILENAME = 'motophd-fixture.pdf';

// Маркер «нашего» дока. Искать по filename нельзя: Payload при загрузке
// переименовывает файл, если такой уже есть на диске или в бакете
// (motophd-fixture-1.pdf, -2, …), и поиск по точному имени перестаёт
// находить док. alt пишет сам сид, Payload его не трогает.
export const FIXTURE_PDF_ALT = 'MotoPhD fixture PDF';

// alt — маркер, filename — страховка: сид удаляет всё, что нашёл сверх
// одного дока, и чужой файл с таким же alt, но другим именем, не тронет.
export const fixturePdfWhere: Where = {
  and: [{ alt: { equals: FIXTURE_PDF_ALT } }, { filename: { like: 'motophd-fixture' } }]
};

// alt локализован; сид пишет и ищет его в дефолтной локали.
const markerLocale = 'en';

const findFixturePdfs = (payload: Payload) =>
  payload.find({
    collection: 'media',
    depth: 0,
    locale: markerLocale,
    overrideAccess: true,
    pagination: false,
    sort: 'createdAt',
    where: fixturePdfWhere
  });

const createFixturePdf = (payload: Payload) =>
  payload.create({
    collection: 'media',
    data: {
      alt: FIXTURE_PDF_ALT
    },
    file: {
      data: fixturePdf,
      mimetype: 'application/pdf',
      name: FIXTURE_PDF_FILENAME,
      size: fixturePdf.length
    },
    locale: markerLocale,
    overrideAccess: true
  });

// Поле pdf локализовано, поэтому по каждой локали отдельно. Делать это до
// удаления дубля: FK в Postgres при удалении медиа обнуляет ссылку урока.
const relinkLessons = async (payload: Payload, from: Media['id'], to: Media['id']) => {
  for (const locale of locales) {
    const { errors } = await payload.update({
      collection: 'lessons',
      data: { pdf: to },
      depth: 0,
      locale,
      overrideAccess: true,
      where: { pdf: { equals: from } }
    });

    if (errors.length > 0) {
      throw new Error(
        `Could not relink lessons from media #${from} to #${to} (${locale}): ${errors
          .map((error) => `#${error.id}: ${error.message}`)
          .join('; ')}`
      );
    }
  }
};

// Оставляет самый старый док фикстуры, остальные перевешивает и удаляет.
// Удаление — только через Payload API: так плагин хранилища удалит и сам
// файл (локальный ./media или объект в R2), а не только строку в базе.
export const dedupeFixturePdf = async (payload: Payload): Promise<Media | undefined> => {
  const {
    docs: [keep, ...extras]
  } = await findFixturePdfs(payload);

  if (!keep) {
    return undefined;
  }

  for (const extra of extras) {
    await relinkLessons(payload, extra.id, keep.id);
    await payload.delete({ collection: 'media', id: extra.id, overrideAccess: true });
  }

  if (extras.length > 0) {
    payload.logger.info(
      `Removed ${extras.length} duplicate fixture PDF doc(s), kept media #${keep.id}.`
    );
  }

  return keep;
};

export const ensureFixturePdf = async (payload: Payload) =>
  (await dedupeFixturePdf(payload)) ?? createFixturePdf(payload);

export const seedFixturePdf = async (payload: Payload, lessonIds: DefaultDocumentIDType[]) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const pdf = await ensureFixturePdf(payload);

  // Последовательно: параллельные update одного документа по разным локалям
  // затирают друг друга, и PDF оставался привязанным только к одной из них.
  for (const lessonId of lessonIds) {
    for (const locale of locales) {
      await payload.update({
        collection: 'lessons',
        data: { pdf: pdf.id },
        id: lessonId,
        locale,
        overrideAccess: true
      });
    }
  }
};
