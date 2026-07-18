import type { Locale } from '@/i18n/routing';

export type Course = {
  slug: string;
  icon: string;
  badge?: string;
  imageTone: 'red' | 'green' | 'blue';
  featured?: boolean;
  pain: string;
  title: string;
  description: string;
  includes: string[];
};

export type CurriculumModule = {
  number: string;
  title: string;
  meta: string;
  open?: boolean;
  lessons: Array<{
    icon: string;
    name: string;
    duration: string;
  }>;
};

export type PrototypeContent = {
  home: {
    heroBadge: string;
    heroTitle: string[];
    heroRed: string;
    heroAfterRed: string;
    heroSub: string;
    stats: Array<{ value: string; accent?: string; label: string }>;
    coursesLabel: string;
    coursesTitle: string[];
    coursesSub: string;
    methodLabel: string;
    methodTitle: string;
    methodSub: string;
    method: Array<{ icon: string; num: string; title: string; desc: string }>;
    testimonialsLabel: string;
    testimonialsTitle: string[];
    testimonials: Array<{ initial: string; name: string; country: string; quote: string }>;
    howLabel: string;
    howTitle: string[];
    steps: Array<{ num: string; title: string; desc: string }>;
    instructorLabel: string;
    instructorTitle: string[];
    instructorCopy: string[];
    instructorName: string;
    instructorRole: string;
    faqLabel: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
    ctaTitle: string[];
    ctaAccent: string;
    ctaSub: string;
  };
  courses: {
    label: string;
    title: string;
    sub: string;
  };
  sales: {
    breadcrumb: string;
    tag: string;
    title: string[];
    pain: string;
    outcomes: string[];
    priceNote: string;
    options: Array<{ name: string; price: string; desc: string }>;
    disclaimer: string;
    guarantee: string;
    curriculumIntro: string;
    bottomTitle: string[];
    bottomAccent: string;
    bottomSub: string;
  };
  dashboard: {
    studentName: string;
    studentEmail: string;
    downloads: Array<{ name: string; size: string }>;
  };
  player: {
    title: string;
    subtitle: string;
    videoMeta: string;
    notes: string[];
    feel: string;
    overviewTitle: string;
    overviewCopy: string;
    moduleOutcome: string[];
    sidebarTitle: string;
  };
};

const coursesEn: Course[] = [
  {
    slug: 'lean',
    icon: '🏍️',
    badge: 'Flagship',
    imageTone: 'red',
    featured: true,
    pain: 'Fear → Confidence',
    title: 'Stop Being Afraid to Lean Your Motorcycle',
    description:
      'Learn why your motorcycle can lean far more than you think — and gain the confidence to corner safely, smoothly and consistently.',
    includes: [
      '1 Theory PDF (5–6 pages)',
      '1 Theory Video (10 min)',
      '3 Practice Videos (5 min each)',
      'Lifetime access'
    ]
  },
  {
    slug: 'counter-steering',
    icon: '⚡',
    imageTone: 'green',
    pain: 'Confusion → Mastery',
    title: 'Counter Steering',
    description:
      'Master the technique that separates confident riders from anxious ones. Understand exactly what your hands do in a corner.',
    includes: [
      'Theory explanation',
      'Control drills',
      'Common mistakes guide',
      'Lifetime access'
    ]
  },
  {
    slug: 'emergency-braking',
    icon: '🛑',
    imageTone: 'blue',
    pain: 'Panic → Control',
    title: 'Emergency Braking',
    description:
      'Build the muscle memory and mental framework to stop your motorcycle correctly, safely, every single time.',
    includes: [
      'Braking fundamentals',
      'Practice drills',
      'Mistake checklist',
      'Lifetime access'
    ]
  }
];

const coursesRu: Course[] = [
  {
    slug: 'lean',
    icon: '🏍️',
    badge: 'Флагман',
    imageTone: 'red',
    featured: true,
    pain: 'Страх → Уверенность',
    title: 'Перестань бояться наклонять мотоцикл',
    description:
      'Узнай, почему твой мотоцикл может наклоняться гораздо больше, чем ты думаешь — и научись проходить повороты уверенно, плавно и стабильно.',
    includes: [
      '1 PDF с теорией (5–6 страниц)',
      '1 видео с теорией (10 мин)',
      '3 практических видео (по 5 мин)',
      'Доступ навсегда'
    ]
  },
  {
    slug: 'counter-steering',
    icon: '⚡',
    imageTone: 'green',
    pain: 'Растерянность → Мастерство',
    title: 'Контрруление',
    description:
      'Освой технику, которая отличает уверенных райдеров от нервных. Пойми, что именно делают твои руки в повороте.',
    includes: ['Теория', 'Упражнения', 'Частые ошибки', 'Доступ навсегда']
  },
  {
    slug: 'emergency-braking',
    icon: '🛑',
    imageTone: 'blue',
    pain: 'Паника → Контроль',
    title: 'Экстренное торможение',
    description:
      'Выработай мышечную память и правильный алгоритм действий, чтобы тормозить правильно, безопасно — каждый раз.',
    includes: ['Основы торможения', 'Практические дрилы', 'Чеклист ошибок', 'Доступ навсегда']
  }
];

export const curriculum: CurriculumModule[] = [
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

const sharedPlayer = {
  title: 'Theory Video — Why Your Bike Can Lean Far More Than You Think',
  subtitle: 'Understanding the physics of lean angle removes fear before you even get on the bike.',
  videoMeta: '10:00 · MotoPhD Online',
  notes: [
    'A motorcycle can lean to ~45° before any hard part touches the ground',
    'Most street riders never exceed 25° — the bike has enormous reserve',
    'Fear of leaning comes from unfamiliarity, not from real danger',
    'Tyres grip through a combination of load and contact patch, not angle alone',
    'Understanding this cognitively is the first step to removing the fear reflex'
  ],
  feel:
    'After this lesson, you should feel that leaning is a controlled, physics-backed action — not a gamble. The goal is to shift your emotional relationship with lean angle before any physical practice begins.',
  overviewTitle: 'Module 1 — Understanding Lean Angle',
  overviewCopy:
    'This module builds the mental foundation for everything that follows. Before you practice any drill, you must understand why the motorcycle behaves the way it does in a corner.',
  moduleOutcome: [
    'Understand the physics of motorcycle lean angle',
    'Know your actual lean angle reserve on a street bike',
    'Identify the #1 cause of corner fear in riders',
    'Be ready to start the first physical drill with confidence'
  ],
  sidebarTitle: 'Stop Being Afraid to Lean'
};

export const prototypeContent: Record<Locale, PrototypeContent> = {
  en: {
    home: {
      heroBadge: 'Motorcycle Performance Education System',
      heroTitle: ['More than 5,000 riders', 'have improved their', 'motorcycle'],
      heroRed: 'control.',
      heroAfterRed: "Now it's your turn.",
      heroSub:
        'The same principles that transformed riders in person — now available online, at your pace, from anywhere in the world.',
      stats: [
        { value: '5,000+', accent: '5,000', label: 'Riders Coached' },
        { value: '10+ yrs', accent: '10', label: 'Coaching Experience' },
        { value: '3', accent: '3', label: 'Courses at Launch' },
        { value: 'YT', label: '@MotoPhD' }
      ],
      coursesLabel: 'The MotoPhD Curriculum',
      coursesTitle: ['One course. One fear.', 'One transformation.'],
      coursesSub:
        'Each course solves a specific problem that holds riders back. No fluff, no filler — just practical riding knowledge that you apply on the road.',
      methodLabel: 'The MotoPhD Method',
      methodTitle: 'Why this system works',
      methodSub:
        'Most riders pick up bad habits because nobody explained the physics. MotoPhD fixes that — for good.',
      method: [
        {
          icon: '🧠',
          num: 'Step 01',
          title: 'Understand',
          desc: 'Before you ride, you understand exactly what your motorcycle is doing — and why. Physics, grip, lean dynamics explained in plain language.'
        },
        {
          icon: '🏍️',
          num: 'Step 02',
          title: 'Train',
          desc: 'Structured exercises. Progressive drills. No guesswork. Each module builds the next. Clear outcome at every stage.'
        },
        {
          icon: '✅',
          num: 'Step 03',
          title: 'Apply',
          desc: 'Real confidence on real roads. You apply what you learn immediately, and feel the difference in your very next ride.'
        }
      ],
      testimonialsLabel: 'Student Results',
      testimonialsTitle: ['What riders say', 'after MotoPhD'],
      testimonials: [
        {
          initial: 'M',
          name: 'Marco T.',
          country: 'Italy',
          quote:
            'I was terrified of corners for 3 years. After the lean angle course I rode the mountain pass I had been avoiding. Completely changed my riding.'
        },
        {
          initial: 'S',
          name: 'Sarah K.',
          country: 'United Kingdom',
          quote:
            'Finally someone explained WHY the bike leans — not just how to do it. That understanding changed everything for me. I feel in control now.'
        },
        {
          initial: 'A',
          name: 'Alex R.',
          country: 'Germany',
          quote:
            "The drills are so practical. I did the first exercise in a parking lot and felt results immediately. Best €29 I've spent on riding."
        }
      ],
      howLabel: 'How It Works',
      howTitle: ['From purchase to', 'better riding — in minutes'],
      steps: [
        { num: '1', title: 'Choose Course', desc: 'Pick the skill you want to build' },
        { num: '2', title: 'Purchase Access', desc: 'Secure checkout, instant access' },
        { num: '3', title: 'Get Account', desc: 'Login credentials delivered by email' },
        { num: '4', title: 'Learn', desc: 'Video + PDF at your own pace' },
        { num: '5', title: 'Ride Better', desc: 'Apply on the road. Lifetime access.' }
      ],
      instructorLabel: 'The Instructor',
      instructorTitle: ['Built by a coach', "who's been there."],
      instructorCopy: [
        "More than 5,000 riders have improved their motorcycle control through my offline coaching. Now I'm bringing the same system online — so riders anywhere in the world can learn the same principles.",
        "I don't teach theory for the sake of it. Every concept in MotoPhD has been tested with real riders on real roads. If it doesn't make you a better rider, it doesn't make it into the course."
      ],
      instructorName: 'MotoPhD Instructor',
      instructorRole: 'Motorcycle Performance Coach',
      faqLabel: 'FAQ',
      faqTitle: 'Common Questions',
      faq: [
        {
          question: 'Is this for beginners or experienced riders?',
          answer:
            "MotoPhD courses are designed for riders of all levels. Whether you've been riding 6 months or 6 years, if you have a specific fear or skill gap — there's a course for it."
        },
        {
          question: 'Do I need a specific type of motorcycle?',
          answer:
            'No. The principles taught in MotoPhD courses apply to any motorcycle — sports bikes, naked bikes, adventure bikes, tourers. The physics are universal.'
        },
        {
          question: 'How long do I have access after purchase?',
          answer:
            "Lifetime access. Once you purchase a course, it's yours forever. No subscription, no expiry. Watch it as many times as you need."
        },
        {
          question: 'What format are the courses in?',
          answer:
            'Each course includes a combination of video lessons and downloadable PDF guides. Videos range from 5–10 minutes. Everything is designed to watch, pause, and apply on the road.'
        },
        {
          question: 'What languages are available?',
          answer:
            'Courses are currently available in English and Russian. Spanish will be added in a future update.'
        },
        {
          question: 'What is your refund policy?',
          answer:
            'As these are digital products, we do not offer refunds once course access has been granted. By completing your purchase you acknowledge and accept this policy.'
        }
      ],
      ctaTitle: ['Ride Safer.', 'Ride Faster.'],
      ctaAccent: 'Understand Your Motorcycle.',
      ctaSub: "Join thousands of riders who've already made the transformation."
    },
    courses: {
      label: 'All Courses',
      title: 'The MotoPhD Curriculum',
      sub: 'Each course targets one specific problem. Master it completely. Then move to the next.'
    },
    sales: {
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
    dashboard: {
      studentName: 'Demo Student',
      studentEmail: 'demo@motophd.com',
      downloads: [
        { name: 'Lean Angle & Physics — Theory Guide', size: 'PDF · 5–6 pages · Watermarked' },
        { name: 'Practice Drill Sheets — Module 3', size: 'PDF · Exercise guide · Watermarked' }
      ]
    },
    player: sharedPlayer
  },
  ru: {
    home: {
      heroBadge: 'Система обучения мотоциклетному мастерству',
      heroTitle: ['Более 5 000 райдеров', 'улучшили управление', 'мотоциклом благодаря'],
      heroRed: 'моему коучингу.',
      heroAfterRed: 'Теперь твоя очередь.',
      heroSub:
        'Те же принципы, что помогли тысячам райдеров офлайн — теперь доступны онлайн, в твоём темпе, из любой точки мира.',
      stats: [
        { value: '5,000+', accent: '5,000', label: 'Обученных райдеров' },
        { value: '10+ yrs', accent: '10', label: 'Лет опыта' },
        { value: '3', accent: '3', label: 'Курса на старте' },
        { value: 'YT', label: '@MotoPhD' }
      ],
      coursesLabel: 'Программа MotoPhD',
      coursesTitle: ['Один курс. Один страх.', 'Одна трансформация.'],
      coursesSub:
        'Каждый курс решает конкретную проблему, которая мешает тебе ехать лучше. Без воды — только практические знания, которые ты применяешь на дороге.',
      methodLabel: 'Метод MotoPhD',
      methodTitle: 'Почему эта система работает',
      methodSub:
        'Большинство райдеров набирают плохие привычки, потому что никто не объяснил им физику. MotoPhD исправляет это — раз и навсегда.',
      method: [
        {
          icon: '🧠',
          num: 'Шаг 01',
          title: 'Понять',
          desc: 'До поездки ты точно понимаешь, что делает твой мотоцикл — и почему. Физика, сцепление, наклон — объясняется простым языком.'
        },
        {
          icon: '🏍️',
          num: 'Шаг 02',
          title: 'Тренировать',
          desc: 'Структурированные упражнения. Прогрессивные дрилы. Без догадок. Каждый модуль строится на предыдущем. Понятный результат на каждом этапе.'
        },
        {
          icon: '✅',
          num: 'Шаг 03',
          title: 'Применять',
          desc: 'Настоящая уверенность на настоящих дорогах. Ты применяешь знания сразу и чувствуешь разницу уже в следующей поездке.'
        }
      ],
      testimonialsLabel: 'Результаты учеников',
      testimonialsTitle: ['Что говорят райдеры', 'после MotoPhD'],
      testimonials: [
        {
          initial: 'M',
          name: 'Marco T.',
          country: 'Italy',
          quote:
            'Я три года боялся поворотов. После курса по наклону проехал горный участок, которого избегал. Это полностью изменило мою езду.'
        },
        {
          initial: 'S',
          name: 'Sarah K.',
          country: 'United Kingdom',
          quote:
            'Наконец-то кто-то объяснил, почему мотоцикл наклоняется, а не просто как это делать. Теперь я чувствую контроль.'
        },
        {
          initial: 'A',
          name: 'Alex R.',
          country: 'Germany',
          quote:
            'Упражнения очень практичные. Первое сделал на парковке и сразу почувствовал результат. Лучшие €29, потраченные на езду.'
        }
      ],
      howLabel: 'Как это работает',
      howTitle: ['От покупки до', 'лучшей езды — за минуты'],
      steps: [
        { num: '1', title: 'Выбери курс', desc: 'Выбери навык, который хочешь развить' },
        { num: '2', title: 'Купи доступ', desc: 'Безопасная оплата, мгновенный доступ' },
        { num: '3', title: 'Получи аккаунт', desc: 'Данные для входа придут на почту' },
        { num: '4', title: 'Учись', desc: 'Видео + PDF в своём темпе' },
        { num: '5', title: 'Езди лучше', desc: 'Применяй на дороге. Доступ навсегда.' }
      ],
      instructorLabel: 'Инструктор',
      instructorTitle: ['Создано тренером,', 'который был там же.'],
      instructorCopy: [
        'Более 5 000 райдеров улучшили управление мотоциклом на моих офлайн-тренировках. Теперь я переношу эту систему онлайн, чтобы райдеры по всему миру могли учиться тем же принципам.',
        'Я не учу теории ради теории. Каждый принцип MotoPhD проверен с реальными райдерами на реальных дорогах. Если это не делает тебя лучше, этого нет в курсе.'
      ],
      instructorName: 'Инструктор MotoPhD',
      instructorRole: 'Тренер по мотоциклетному мастерству',
      faqLabel: 'Вопросы и ответы',
      faqTitle: 'Частые вопросы',
      faq: [
        {
          question: 'Подходит ли это для новичков или опытных райдеров?',
          answer:
            'Курсы MotoPhD подходят для райдеров любого уровня. Неважно, ездишь ты 6 месяцев или 6 лет — если есть конкретный страх или пробел в навыке, есть курс для тебя.'
        },
        {
          question: 'Нужен ли конкретный тип мотоцикла?',
          answer:
            'Нет. Принципы курсов MotoPhD применимы к любому мотоциклу — спортивным, нейкедам, эндуро, туристическим. Физика универсальна.'
        },
        {
          question: 'Как долго у меня будет доступ после покупки?',
          answer:
            'Бессрочный доступ. После покупки курс твой навсегда. Никаких подписок, никаких сроков. Пересматривай столько раз, сколько нужно.'
        },
        {
          question: 'В каком формате курсы?',
          answer:
            'Каждый курс включает видеоуроки и скачиваемые PDF-гайды. Видео длятся 5–10 минут. Всё создано так, чтобы смотреть, ставить на паузу и применять на дороге.'
        },
        {
          question: 'На каких языках доступны курсы?',
          answer: 'Курсы доступны на английском и русском языках. Испанский появится позже.'
        },
        {
          question: 'Какая политика возврата?',
          answer:
            'Поскольку это цифровые продукты, мы не делаем возвраты после предоставления доступа к курсу. Совершая покупку, вы принимаете эту политику.'
        }
      ],
      ctaTitle: ['Езди безопаснее.', 'Езди быстрее.'],
      ctaAccent: 'Понимай свой мотоцикл.',
      ctaSub: 'Присоединяйся к тысячам райдеров, которые уже изменили свой стиль езды.'
    },
    courses: {
      label: 'Все курсы',
      title: 'Программа MotoPhD',
      sub: 'Каждый курс решает одну конкретную проблему. Разбери её полностью и переходи к следующей.'
    },
    sales: {
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
    },
    dashboard: {
      studentName: 'Demo Student',
      studentEmail: 'demo@motophd.com',
      downloads: [
        { name: 'Lean Angle & Physics — Theory Guide', size: 'PDF · 5–6 страниц · Watermarked' },
        { name: 'Practice Drill Sheets — Module 3', size: 'PDF · Упражнения · Watermarked' }
      ]
    },
    player: sharedPlayer
  }
};

export const localizedCourses: Record<Locale, Course[]> = {
  en: coursesEn,
  ru: coursesRu
};
