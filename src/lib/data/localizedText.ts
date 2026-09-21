import type { AppLocale } from './types';

// Статические подписи страниц курса и плеера по локалям. Record<AppLocale, …>:
// новая локаль без своего текста не пройдёт typecheck.

export type SalesText = Record<
  | 'allCourses'
  | 'courseOnly'
  | 'courseOnlyDesc'
  | 'feedback'
  | 'feedbackDesc'
  | 'guarantee'
  | 'lifetime'
  | 'disclaimer'
  | 'modulesTitle'
  | 'studentName',
  string
>;

export const salesText: Record<AppLocale, SalesText> = {
  en: {
    allCourses: 'All Courses',
    courseOnly: 'Course only',
    courseOnlyDesc: 'Videos + PDFs. Learn at your pace.',
    feedback: 'Course + feedback',
    feedbackDesc: 'Includes one personal video review.',
    guarantee: 'Instant access · Secure checkout · Lifetime access',
    lifetime: 'Lifetime access. No subscription.',
    disclaimer:
      'I understand that motorcycle riding involves risk and I am responsible for my own safety when applying course material.',
    modulesTitle: 'COURSE MODULES',
    studentName: 'Demo Student'
  },
  ru: {
    allCourses: 'Все курсы',
    courseOnly: 'Только курс',
    courseOnlyDesc: 'Видео + PDF. Учись в своём темпе.',
    feedback: 'Курс + разбор',
    feedbackDesc: 'Включает персональную обратную связь.',
    guarantee: 'Мгновенный доступ · Безопасная оплата · Доступ навсегда',
    lifetime: 'Доступ навсегда. Без подписки.',
    disclaimer:
      'Я понимаю, что езда на мотоцикле связана с риском, и сам отвечаю за безопасность при применении материалов курса.',
    modulesTitle: 'МОДУЛИ КУРСА',
    studentName: 'Demo Student'
  },
  uk: {
    allCourses: 'Усі курси',
    courseOnly: 'Лише курс',
    courseOnlyDesc: 'Відео + PDF. Вчися у своєму темпі.',
    feedback: 'Курс + розбір',
    feedbackDesc: 'Включає персональний зворотний зв’язок.',
    guarantee: 'Миттєвий доступ · Безпечна оплата · Доступ назавжди',
    lifetime: 'Доступ назавжди. Без підписки.',
    disclaimer:
      'Я розумію, що їзда на мотоциклі пов’язана з ризиком, і сам відповідаю за безпеку під час застосування матеріалів курсу.',
    modulesTitle: 'МОДУЛІ КУРСУ',
    studentName: 'Demo Student'
  }
};

export const readingLabels: Record<AppLocale, string> = { en: 'Reading', ru: 'Чтение', uk: 'Читання' };

// Уровни курса — по slug и локали. Если сумма count не совпадает с числом
// уроков, toCurriculumModules показывает один модуль (см. adapters.ts).
export const curriculumLevelsByCourse: Record<string, Record<AppLocale, Array<{ title: string; count: number }>>> = {
  lean: {
    en: [
      { title: 'Level 01 — Theory', count: 1 },
      { title: 'Level 02 — Preparation', count: 4 },
      { title: 'Level 03 — Hanging Off', count: 3 },
      { title: 'Level 04 — Trajectory & Deep Lean', count: 3 },
      { title: 'Level 05 — Mixing Different Steering Methods', count: 4 }
    ],
    ru: [
      { title: 'Уровень 01 — Теория', count: 1 },
      { title: 'Уровень 02 — Подготовка', count: 4 },
      { title: 'Уровень 03 — Свешивание', count: 3 },
      { title: 'Уровень 04 — Траектория и глубокий наклон', count: 3 },
      { title: 'Уровень 05 — Микс разных инструментов руления', count: 4 }
    ],
    uk: [
      { title: 'Рівень 01 — Теорія', count: 1 },
      { title: 'Рівень 02 — Підготовка', count: 4 },
      { title: 'Рівень 03 — Звішування', count: 3 },
      { title: 'Рівень 04 — Траєкторія та глибокий нахил', count: 3 },
      { title: 'Рівень 05 — Мікс різних інструментів керування', count: 4 }
    ]
  }
};
