import type { CurriculumModule, LocalizedContent } from './types';

const leanCurriculumEn: CurriculumModule[] = [
  {
    number: '01',
    title: 'Level 01 — Theory',
    meta: '1 video · Theory foundation',
    open: true,
    lessons: [{ icon: 'play', name: 'Video Lesson', duration: '' }]
  },
  {
    number: '02',
    title: 'Level 02 — Preparation',
    meta: '1 video · 3 PDFs · Getting bike and body ready',
    lessons: [
      { icon: 'play', name: 'Video Tutorial', duration: '' },
      { icon: 'document', name: 'Motorcycle Preparation', duration: 'PDF' },
      { icon: 'document', name: 'Tire Condition Check', duration: 'PDF' },
      { icon: 'document', name: 'Practicing Proper Body Position', duration: 'PDF' }
    ]
  },
  {
    number: '03',
    title: 'Level 03 — Hanging Off',
    meta: '1 video · 2 PDFs · Hanging-off fundamentals',
    lessons: [
      { icon: 'play', name: 'Video Tutorial', duration: '' },
      { icon: 'document', name: 'Hanging-Off Technique', duration: 'PDF' },
      { icon: 'document', name: 'Flick Technique', duration: 'PDF' }
    ]
  },
  {
    number: '04',
    title: 'Level 04 — Trajectory & Deep Lean',
    meta: '1 video · 2 PDFs · Line choice and throttle control',
    lessons: [
      { icon: 'play', name: 'Video Tutorial', duration: '' },
      { icon: 'document', name: 'Turn-In Points & Trajectory Work', duration: 'PDF' },
      { icon: 'document', name: 'Throttle Phase Work', duration: 'PDF' }
    ]
  },
  {
    number: '05',
    title: 'Level 05 — Mixing Different Steering Methods',
    meta: '1 video · 3 PDFs · Combining every tool',
    lessons: [
      { icon: 'play', name: 'Video Tutorial', duration: '' },
      { icon: 'document', name: 'Footwork', duration: 'PDF' },
      { icon: 'document', name: 'Countersteering + Body', duration: 'PDF' },
      { icon: 'document', name: 'MotoPhD Challenge', duration: 'PDF' }
    ]
  }
];

const leanCurriculumRu: CurriculumModule[] = [
  {
    number: '01',
    title: 'Уровень 01 — Теория',
    meta: '1 видео · Теоретическая база',
    open: true,
    lessons: [{ icon: 'play', name: 'Видеоролик', duration: '' }]
  },
  {
    number: '02',
    title: 'Уровень 02 — Подготовка',
    meta: '1 видео · 3 PDF · Подготовка байка и тела',
    lessons: [
      { icon: 'play', name: 'Видеоролик', duration: '' },
      { icon: 'document', name: 'Подготовка мотоцикла', duration: 'PDF' },
      { icon: 'document', name: 'Проверка состояния резины', duration: 'PDF' },
      { icon: 'document', name: 'Отработка правильного положения тела', duration: 'PDF' }
    ]
  },
  {
    number: '03',
    title: 'Уровень 03 — Свешивание',
    meta: '1 видео · 2 PDF · Основы свешивания',
    lessons: [
      { icon: 'play', name: 'Видеоролик', duration: '' },
      { icon: 'document', name: 'Техника свешивания', duration: 'PDF' },
      { icon: 'document', name: 'Техника перекладки', duration: 'PDF' }
    ]
  },
  {
    number: '04',
    title: 'Уровень 04 — Траектория и глубокий наклон',
    meta: '1 видео · 2 PDF · Выбор траектории и газ',
    lessons: [
      { icon: 'play', name: 'Видеоролик', duration: '' },
      { icon: 'document', name: 'Работа над точками руления и траекторией', duration: 'PDF' },
      { icon: 'document', name: 'Работа над фазами газа', duration: 'PDF' }
    ]
  },
  {
    number: '05',
    title: 'Уровень 05 — Микс разных инструментов руления',
    meta: '1 видео · 3 PDF · Соединяем всё вместе',
    lessons: [
      { icon: 'play', name: 'Видеоролик', duration: '' },
      { icon: 'document', name: 'Работа ног', duration: 'PDF' },
      { icon: 'document', name: 'Контр руление + тело', duration: 'PDF' },
      { icon: 'document', name: 'Челлендж от MotoPhD', duration: 'PDF' }
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
      { icon: 'document', name: 'Theory PDF — Lean Angle & Physics', duration: '5–6 pages' },
      {
        icon: 'play',
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
      { icon: 'document', name: 'Theory PDF — Grip & Contact Patch', duration: '5 pages' },
      { icon: 'play', name: 'Theory Video — How Tyres Actually Hold You', duration: '10 min' }
    ]
  },
  {
    number: '3',
    title: 'Practice Drills — Building Lean Confidence',
    meta: '3 practice videos · PDF drill sheets',
    lessons: [
      { icon: 'play', name: 'Drill 1 — First Lean Exercise (Parking Lot)', duration: '5 min' },
      { icon: 'play', name: 'Drill 2 — Progressive Lean Progression', duration: '5 min' },
      { icon: 'play', name: 'Drill 3 — Corner Entry Confidence', duration: '5 min' },
      { icon: 'document', name: 'Drill Sheets PDF', duration: 'Exercises' }
    ]
  },
  {
    number: '4',
    title: 'Applying It on the Road',
    meta: 'Real-world application framework',
    lessons: [
      { icon: 'play', name: 'From Parking Lot to Real Corners', duration: '5 min' },
      { icon: 'document', name: 'What You Should Now Feel — Checklist', duration: 'PDF' }
    ]
  }
];

const legacyCurriculumRu: CurriculumModule[] = [
  {
    number: '1',
    title: 'Понимаем угол наклона',
    meta: '1 PDF · 1 видео (10 мин) · Теоретическая база',
    open: true,
    lessons: [
      { icon: 'document', name: 'PDF по теории — угол наклона и физика', duration: '5–6 страниц' },
      {
        icon: 'play',
        name: 'Видео по теории — почему мотоцикл наклоняется сильнее, чем ты думаешь',
        duration: '10 мин'
      },
      { icon: '⚠️', name: 'Частые ошибки: что большинство райдеров делают не так', duration: 'Чтение' }
    ]
  },
  {
    number: '2',
    title: 'Понимаем сцепление',
    meta: '1 PDF · 1 видео · Тренируем чувство сцепления',
    lessons: [
      { icon: 'document', name: 'PDF по теории — сцепление и пятно контакта', duration: '5 страниц' },
      { icon: 'play', name: 'Видео по теории — как резина на самом деле держит тебя', duration: '10 мин' }
    ]
  },
  {
    number: '3',
    title: 'Практика — строим уверенность в наклоне',
    meta: '3 практических видео · PDF с упражнениями',
    lessons: [
      { icon: 'play', name: 'Упражнение 1 — первый наклон (на площадке)', duration: '5 мин' },
      { icon: 'play', name: 'Упражнение 2 — наклон по нарастающей', duration: '5 мин' },
      { icon: 'play', name: 'Упражнение 3 — уверенный вход в поворот', duration: '5 мин' },
      { icon: 'document', name: 'PDF с упражнениями', duration: 'Упражнения' }
    ]
  },
  {
    number: '4',
    title: 'Переносим на дорогу',
    meta: 'Как применять это в реальных поворотах',
    lessons: [
      { icon: 'play', name: 'С площадки — в настоящие повороты', duration: '5 мин' },
      { icon: 'document', name: 'Что ты теперь должен чувствовать — чеклист', duration: 'PDF' }
    ]
  }
];

export const curriculumByCourse: Record<string, LocalizedContent<CurriculumModule[]>> = {
  lean: { en: leanCurriculumEn, ru: leanCurriculumRu },
  'counter-steering': { en: legacyCurriculum, ru: legacyCurriculumRu },
  'emergency-braking': { en: legacyCurriculum, ru: legacyCurriculumRu }
};

export const getCurriculumForCourse = (slug: string): LocalizedContent<CurriculumModule[]> =>
  curriculumByCourse[slug] || { en: legacyCurriculum, ru: legacyCurriculumRu };
