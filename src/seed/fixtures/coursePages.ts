import type { LocalizedContent, PrototypeContent } from './types';

export const coursesPageContent: LocalizedContent<PrototypeContent['courses']> = {
  en: {
    label: 'All Courses',
    title: 'The MotoPhD Curriculum',
    sub: 'Each course targets one specific problem. Master it completely. Then move to the next.'
  },
  ru: {
    label: 'Все курсы',
    title: 'Программа MotoPhD',
    sub: 'Каждый курс решает одну конкретную проблему. Разбери её полностью и переходи к следующей.'
  }
};

export const salesContent: LocalizedContent<PrototypeContent['sales']> = {
  en: {
    breadcrumb: 'All Courses',
    tag: 'Cornering Confidence',
    title: ['Stop Being Afraid', 'to Lean Your', 'Motorcycle'],
    pain:
      "If you've ever tensed up in a corner, run wide, or avoided leaning because it felt dangerous — this course was built for you.",
    outcomes: [
      'Understand why your motorcycle can lean far more than you think',
      'Remove the fear reflex before entering corners',
      'Learn progressive drills to build real confidence',
      'Know what a controlled lean should feel like'
    ],
    priceNote: 'Lifetime access. No subscription.',
    options: [
      { name: 'Course only', price: '€29', desc: 'Videos + PDFs. Learn at your pace.' },
      { name: 'Course + feedback', price: '€50', desc: 'Includes one personal video review.' }
    ],
    disclaimer:
      'I understand that motorcycle riding involves risk and I am responsible for my own safety when applying course material.',
    guarantee: 'Instant access · Secure checkout · Lifetime access',
    curriculumIntro:
      '4 modules. Theory + practice drills. Each module has a clear, measurable outcome.',
    bottomTitle: ['Ready to corner'],
    bottomAccent: 'without fear?',
    bottomSub: 'One course. One transformation. Lifetime access.'
  },
  ru: {
    breadcrumb: 'Все курсы',
    tag: 'Уверенность в поворотах',
    title: ['Перестань бояться', 'наклонять', 'мотоцикл'],
    pain:
      'Если ты когда-нибудь зажимался в повороте, вылетал на встречку или боялся наклонять мотоцикл — этот курс создан для тебя.',
    outcomes: [
      'Поймёшь, почему мотоцикл может наклоняться намного сильнее, чем кажется',
      'Уберёшь рефлекс страха перед входом в поворот',
      'Получишь прогрессивные упражнения для уверенности',
      'Поймёшь, как должен ощущаться контролируемый наклон'
    ],
    priceNote: 'Доступ навсегда. Без подписки.',
    options: [
      { name: 'Только курс', price: '€29', desc: 'Видео + PDF. Учись в своём темпе.' },
      { name: 'Курс + разбор', price: '€50', desc: 'Включает один персональный видео-разбор.' }
    ],
    disclaimer:
      'Я понимаю, что езда на мотоцикле связана с риском, и сам отвечаю за безопасность при применении материалов курса.',
    guarantee: 'Мгновенный доступ · Безопасная оплата · Доступ навсегда',
    curriculumIntro: '4 модуля. Теория + практика. У каждого модуля понятный результат.',
    bottomTitle: ['Готов проходить повороты'],
    bottomAccent: 'без страха?',
    bottomSub: 'Один курс. Одна трансформация. Доступ навсегда.'
  }
};
