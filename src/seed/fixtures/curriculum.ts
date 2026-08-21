import type { CurriculumModule, LocalizedContent } from './types';

const leanCurriculumEn: CurriculumModule[] = [
  {
    number: '01',
    title: 'Level 01 — Theory',
    meta: '1 video · Theory foundation',
    open: true,
    lessons: [{ icon: '🎥', name: 'Video', duration: '' }]
  },
  {
    number: '02',
    title: 'Level 02 — Preparation',
    meta: '1 video · 3 PDFs · Getting bike and body ready',
    lessons: [
      { icon: '🎥', name: 'Video', duration: '' },
      { icon: '📄', name: 'Motorcycle Preparation', duration: 'PDF' },
      { icon: '📄', name: 'Tire Condition Check', duration: 'PDF' },
      { icon: '📄', name: 'Practicing Proper Body Position', duration: 'PDF' }
    ]
  },
  {
    number: '03',
    title: 'Level 03 — Hanging Off',
    meta: '1 video · 2 PDFs · Hanging-off fundamentals',
    lessons: [
      { icon: '🎥', name: 'Video', duration: '' },
      { icon: '📄', name: 'Hanging-Off Technique', duration: 'PDF' },
      { icon: '📄', name: 'Flick Technique', duration: 'PDF' }
    ]
  },
  {
    number: '04',
    title: 'Level 04 — Trajectory & Deep Lean',
    meta: '1 video · 2 PDFs · Line choice and throttle control',
    lessons: [
      { icon: '🎥', name: 'Video', duration: '' },
      { icon: '📄', name: 'Turn-In Points & Trajectory Work', duration: 'PDF' },
      { icon: '📄', name: 'Throttle Phase Work', duration: 'PDF' }
    ]
  },
  {
    number: '05',
    title: 'Level 05 — Mixing Different Steering Methods',
    meta: '1 video · 3 PDFs · Combining every tool',
    lessons: [
      { icon: '🎥', name: 'Video', duration: '' },
      { icon: '📄', name: 'Footwork', duration: 'PDF' },
      { icon: '📄', name: 'Countersteering + Body', duration: 'PDF' },
      { icon: '📄', name: 'MotoPhD Challenge', duration: 'PDF' }
    ]
  }
];

const leanCurriculumRu: CurriculumModule[] = [
  {
    number: '01',
    title: 'Уровень 01 — Теория',
    meta: '1 видео · Теоретическая база',
    open: true,
    lessons: [{ icon: '🎥', name: 'Видеоролик', duration: '' }]
  },
  {
    number: '02',
    title: 'Уровень 02 — Подготовка',
    meta: '1 видео · 3 PDF · Подготовка байка и тела',
    lessons: [
      { icon: '🎥', name: 'Видеоролик', duration: '' },
      { icon: '📄', name: 'Подготовка мотоцикла', duration: 'PDF' },
      { icon: '📄', name: 'Проверка состояния резины', duration: 'PDF' },
      { icon: '📄', name: 'Отработка правильного положения тела', duration: 'PDF' }
    ]
  },
  {
    number: '03',
    title: 'Уровень 03 — Свешивание',
    meta: '1 видео · 2 PDF · Основы свешивания',
    lessons: [
      { icon: '🎥', name: 'Видеоролик', duration: '' },
      { icon: '📄', name: 'Техника свешивания', duration: 'PDF' },
      { icon: '📄', name: 'Техника перекладки', duration: 'PDF' }
    ]
  },
  {
    number: '04',
    title: 'Уровень 04 — Траектория и глубокий наклон',
    meta: '1 видео · 2 PDF · Выбор траектории и газ',
    lessons: [
      { icon: '🎥', name: 'Видеоролик', duration: '' },
      { icon: '📄', name: 'Работа над точками руления и траекторией', duration: 'PDF' },
      { icon: '📄', name: 'Работа над фазами газа', duration: 'PDF' }
    ]
  },
  {
    number: '05',
    title: 'Уровень 05 — Микс разных инструментов руления',
    meta: '1 видео · 3 PDF · Соединяем всё вместе',
    lessons: [
      { icon: '🎥', name: 'Видеоролик', duration: '' },
      { icon: '📄', name: 'Работа ног', duration: 'PDF' },
      { icon: '📄', name: 'Контр руление + тело', duration: 'PDF' },
      { icon: '📄', name: 'Челлендж от MotoPhD', duration: 'PDF' }
    ]
  }
];

const legacyCurriculum: CurriculumModule[] = [
  {
    number: '1',
    title: 'Understanding Lean Angle',
    meta: '1 PDF · 1 video (10 min) · Theory foundation',
    open: true,
    lessons: [
      { icon: '📄', name: 'Theory PDF — Lean Angle & Physics', duration: '5–6 pages' },
      {
        icon: '🎥',
        name: 'Theory Video — Why Your Bike Can Lean Far More',
        duration: '10 min'
      },
      { icon: '⚠️', name: 'Common Mistakes: What Most Riders Get Wrong', duration: 'Reading' }
    ]
  },
  {
    number: '2',
    title: 'Understanding Grip',
    meta: '1 PDF · 1 video · Grip awareness training',
    lessons: [
      { icon: '📄', name: 'Theory PDF — Grip & Contact Patch', duration: '5 pages' },
      { icon: '🎥', name: 'Theory Video — How Tyres Actually Hold You', duration: '10 min' }
    ]
  },
  {
    number: '3',
    title: 'Practice Drills — Building Lean Confidence',
    meta: '3 practice videos · PDF drill sheets',
    lessons: [
      { icon: '🎥', name: 'Drill 1 — First Lean Exercise (Parking Lot)', duration: '5 min' },
      { icon: '🎥', name: 'Drill 2 — Progressive Lean Progression', duration: '5 min' },
      { icon: '🎥', name: 'Drill 3 — Corner Entry Confidence', duration: '5 min' },
      { icon: '📄', name: 'Drill Sheets PDF', duration: 'Exercises' }
    ]
  },
  {
    number: '4',
    title: 'Applying It on the Road',
    meta: 'Real-world application framework',
    lessons: [
      { icon: '🎥', name: 'From Parking Lot to Real Corners', duration: '5 min' },
      { icon: '📄', name: 'What You Should Now Feel — Checklist', duration: 'PDF' }
    ]
  }
];

export const curriculumByCourse: Record<string, LocalizedContent<CurriculumModule[]>> = {
  lean: { en: leanCurriculumEn, ru: leanCurriculumRu },
  'counter-steering': { en: legacyCurriculum, ru: legacyCurriculum },
  'emergency-braking': { en: legacyCurriculum, ru: legacyCurriculum }
};

export const getCurriculumForCourse = (slug: string): LocalizedContent<CurriculumModule[]> =>
  curriculumByCourse[slug] || { en: legacyCurriculum, ru: legacyCurriculum };
