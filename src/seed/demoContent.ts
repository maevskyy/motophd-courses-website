/*
  Заготовки для обучающих видео по админке: по одной готовой сущности на
  каждый шаг. В ролике показывают, как заполнять, не сохраняют и открывают
  готовый вариант отсюда. Всё заполнено на en, ru и uk — так и учим.

  Курс — черновик: на сайте его нет. Уроку достаются видео, обложки и PDF
  урока 01 Leaning (ищем по имени файла/видео, не по id), курсу — фото
  public/course-braking.jpg. Повторный запуск ничего не дублирует: находит
  созданное по slug/email/коду и обновляет.

  Запуск: pnpm payload run src/seed/demoContent.ts
*/
import { copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import config from '@payload-config';
import { getPayload, type Payload } from 'payload';

import { generatePassword } from '../lib/auth/generatePassword';

const SLUG = 'demo-course';
const STUDENT_EMAIL = 'demo.student@motophd.com';
const PROMO_CODE = 'DEMO10';
const COVER_FILE = 'demo-course-cover.jpg';

const course = {
  en: {
    title: 'Demo: Braking Without Panic',
    pain: 'Panic → Control',
    description:
      'Demo course for the admin guide. Learn to brake hard and straight when it matters — without locking the front wheel.',
    outcomes: [
      'Brake hard without locking the front wheel',
      'Stop in a straight line in an emergency',
      'Use both brakes in the right order'
    ]
  },
  ru: {
    title: 'Демо: Торможение без паники',
    pain: 'Паника → Контроль',
    description:
      'Демо-курс для инструкции по админке. Учимся тормозить резко и ровно, когда это важно, не блокируя переднее колесо.',
    outcomes: [
      'Резко тормозить без блокировки переднего колеса',
      'Останавливаться по прямой в экстренной ситуации',
      'Работать обоими тормозами в правильном порядке'
    ]
  },
  uk: {
    title: 'Демо: Гальмування без паніки',
    pain: 'Паніка → Контроль',
    description:
      'Демо-курс для інструкції з адмінки. Вчимося гальмувати різко й рівно, коли це важливо, не блокуючи переднє колесо.',
    outcomes: [
      'Різко гальмувати без блокування переднього колеса',
      'Зупинятися по прямій в екстреній ситуації',
      'Працювати обома гальмами в правильному порядку'
    ]
  }
} as const;

// Материалы урока: у uk своих нет — берёт русские, как уроки Leaning.
const lesson = {
  en: {
    title: 'Lesson 1 — Emergency braking',
    video: 'lean · урок 01 · EN',
    cover: 'en-01.png',
    pdf: 'MotoPhD-Level-02-EN.pdf'
  },
  ru: {
    title: 'Урок 1 — Экстренное торможение',
    video: 'lean · урок 01 · RU',
    cover: 'ru-01.png',
    pdf: 'MotoPhD-Level-02-RU.pdf'
  },
  uk: {
    title: 'Урок 1 — Екстрене гальмування',
    video: 'lean · урок 01 · RU',
    cover: 'ru-01.png',
    pdf: 'MotoPhD-Level-02-RU.pdf'
  }
} as const;

const locales = ['en', 'ru', 'uk'] as const;

const findId = async (
  payload: Payload,
  collection: 'media' | 'videos',
  field: 'filename' | 'title',
  value: string
) => {
  const { docs } = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { [field]: { equals: value } }
  });

  if (!docs[0]) {
    console.warn(`demo: ${collection} «${value}» не найден — поле останется пустым`);
  }

  return docs[0]?.id ?? null;
};

const upsert = async <T extends { id: number }>(
  find: () => Promise<T | undefined>,
  create: () => Promise<T>,
  update: (id: number) => Promise<T>
) => {
  const existing = await find();

  return existing ? update(existing.id) : create();
};

const coverCopy = () => {
  const path = join(tmpdir(), COVER_FILE);

  copyFileSync(join(process.cwd(), 'public/course-braking.jpg'), path);

  return path;
};

const payload = await getPayload({ config });

// Обложка курса.
const coverId =
  (
    await payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { filename: { equals: COVER_FILE } }
    })
  ).docs[0]?.id ??
  (
    await payload.create({
      collection: 'media',
      data: { alt: 'Demo course cover' },
      // Имя загружаемого файла становится filename: по нему повторный запуск
      // находит обложку.
      filePath: coverCopy(),
      overrideAccess: true
    })
  ).id;

// Курс: сначала en (обязательные поля), потом ru и uk.
const courseDoc = await upsert(
  async () =>
    (
      await payload.find({
        collection: 'courses',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { slug: { equals: SLUG } }
      })
    ).docs[0],
  () =>
    payload.create({
      collection: 'courses',
      data: {
        slug: SLUG,
        title: course.en.title,
        priceStandard: 29,
        priceFeedback: 129,
        regionalPrices: [{ countries: ['UA', 'MD'], priceStandard: 19, priceFeedback: 79 }],
        order: 99,
        status: 'draft'
      },
      locale: 'en',
      overrideAccess: true
    }),
  (id) => payload.findByID({ collection: 'courses', depth: 0, id, overrideAccess: true })
);

for (const locale of locales) {
  const text = course[locale];

  await payload.update({
    collection: 'courses',
    data: {
      cover: coverId,
      description: text.description,
      outcomes: text.outcomes.map((point) => ({ text: point })),
      pain: text.pain,
      title: text.title
    },
    id: courseDoc.id,
    locale,
    overrideAccess: true
  });
}

// Урок.
const lessonDoc = await upsert(
  async () =>
    (
      await payload.find({
        collection: 'lessons',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { and: [{ course: { equals: courseDoc.id } }, { order: { equals: 1 } }] }
      })
    ).docs[0],
  () =>
    payload.create({
      collection: 'lessons',
      data: { course: courseDoc.id, order: 1, title: lesson.en.title },
      locale: 'en',
      overrideAccess: true
    }),
  (id) => payload.findByID({ collection: 'lessons', depth: 0, id, overrideAccess: true })
);

for (const locale of locales) {
  const material = lesson[locale];

  await payload.update({
    collection: 'lessons',
    data: {
      cover: await findId(payload, 'media', 'filename', material.cover),
      pdf: await findId(payload, 'media', 'filename', material.pdf),
      title: material.title,
      video: await findId(payload, 'videos', 'title', material.video)
    },
    id: lessonDoc.id,
    locale,
    overrideAccess: true
  });
}

// Студент и выданный ему вручную курс.
const student = await upsert(
  async () =>
    (
      await payload.find({
        collection: 'users',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { email: { equals: STUDENT_EMAIL } }
      })
    ).docs[0],
  () =>
    payload.create({
      collection: 'users',
      data: {
        email: STUDENT_EMAIL,
        name: 'Demo Student',
        password: generatePassword(),
        role: 'student'
      },
      overrideAccess: true
    }),
  (id) => payload.findByID({ collection: 'users', depth: 0, id, overrideAccess: true })
);

const hasPurchase =
  (
    await payload.find({
      collection: 'purchases',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { and: [{ user: { equals: student.id } }, { course: { equals: courseDoc.id } }] }
    })
  ).totalDocs > 0;

if (!hasPurchase) {
  await payload.create({
    collection: 'purchases',
    data: {
      amount: 0,
      course: courseDoc.id,
      currency: 'EUR',
      paidAt: new Date().toISOString(),
      provider: 'manual',
      status: 'paid',
      tier: 'standard',
      user: student.id
    },
    overrideAccess: true
  });
}

// Промокод только на демо-курс и тариф «только курс».
const validTo = new Date();
validTo.setFullYear(validTo.getFullYear() + 1);

const promoData = {
  active: true,
  code: PROMO_CODE,
  courses: [courseDoc.id],
  discountType: 'percent' as const,
  maxUses: 20,
  tiers: ['standard' as const],
  validFrom: new Date().toISOString(),
  validTo: validTo.toISOString(),
  value: 10
};

await upsert(
  async () =>
    (
      await payload.find({
        collection: 'promoCodes',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { code: { equals: PROMO_CODE } }
      })
    ).docs[0],
  () =>
    payload.create({
      collection: 'promoCodes',
      data: { ...promoData, usedCount: 0 },
      overrideAccess: true
    }),
  (id) => payload.update({ collection: 'promoCodes', data: promoData, id, overrideAccess: true })
);

console.log(
  `demo: курс #${courseDoc.id} (${SLUG}, черновик), урок #${lessonDoc.id}, студент ${STUDENT_EMAIL}, промокод ${PROMO_CODE}`
);
process.exit(0);
