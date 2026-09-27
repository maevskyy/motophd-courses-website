import type { CurriculumModule, LocalizedContent } from './types';

const lessons = (titles: string[]): CurriculumModule[] =>
  titles.map((title, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title,
    meta: '1 video',
    open: index === 0,
    lessons: [{ icon: '🎥', name: title, duration: '' }]
  }));

const leanEn = lessons([
  'Level 01 — Theory',
  'Level 02 — Preparation',
  'Level 03 — Hanging Off',
  'Level 04 — Trajectory & Deep Lean',
  'Level 05 — Mixing Different Steering Methods'
]);

const leanRu = lessons([
  'Уровень 01 — Теория',
  'Уровень 02 — Подготовка',
  'Уровень 03 — Свешивание',
  'Уровень 04 — Траектория и глубокий наклон',
  'Уровень 05 — Микс разных инструментов руления'
]);

const counterEn = lessons([
  'Level 01 — Theory',
  'Level 02 — Preparation',
  'Level 03 — Practice',
  'Level 04 — Control',
  'Level 05 — Application'
]);

const counterRu = lessons([
  'Уровень 01 — Теория',
  'Уровень 02 — Подготовка',
  'Уровень 03 — Практика',
  'Уровень 04 — Контроль',
  'Уровень 05 — Применение'
]);

export const curriculumByCourse: Record<string, LocalizedContent<CurriculumModule[]>> = {
  lean: { en: leanEn, ru: leanRu },
  'counter-steering': { en: counterEn, ru: counterRu },
  'emergency-braking': { en: counterEn, ru: counterRu }
};

export const getCurriculumForCourse = (slug: string): LocalizedContent<CurriculumModule[]> =>
  curriculumByCourse[slug] || { en: counterEn, ru: counterRu };
