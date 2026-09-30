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

export type FeedbackInclude = { text: string; title: string };

// Что входит в тариф с обратной связью — список под тарифами, когда он
// выбран. Английский — текст Влада (26.09.2026), ru/uk — перевод.
export const feedbackIncludes: Record<AppLocale, { heading: string; items: FeedbackInclude[] }> = {
  en: {
    heading: 'Everything in the Course Only package, plus:',
    items: [
      {
        title: 'Direct contact with your coach',
        text: 'Personal communication throughout the feedback process.'
      },
      {
        title: 'Personal video analysis',
        text: 'Send a video from your training and get a detailed review of your riding technique, mistakes, and what to work on next.'
      },
      {
        title: 'Individual recommendations',
        text: 'Clear feedback based on your current level, riding style, and goals.'
      },
      {
        title: '1-on-1 video call',
        text: 'One personal video call to review your progress, discuss your technique, and answer your questions.'
      },
      {
        title: 'Q&A with Vlad',
        text: 'Ask questions about the course, your training, technique, or specific riding situations.'
      }
    ]
  },
  ru: {
    heading: 'Всё из тарифа «Только курс», плюс:',
    items: [
      {
        title: 'Прямая связь с тренером',
        text: 'Личное общение на всём протяжении обратной связи.'
      },
      {
        title: 'Разбор ваших видео',
        text: 'Присылайте видео с тренировок и получайте подробный разбор техники, ошибок и того, над чем работать дальше.'
      },
      {
        title: 'Индивидуальные рекомендации',
        text: 'Понятная обратная связь с учётом вашего уровня, стиля езды и целей.'
      },
      {
        title: 'Видеозвонок один на один',
        text: 'Личный созвон: обсудим ваш прогресс и технику и ответим на вопросы.'
      },
      {
        title: 'Вопросы Владу',
        text: 'Спрашивайте о курсе, тренировках, технике или конкретных ситуациях в езде.'
      }
    ]
  },
  uk: {
    heading: 'Усе з тарифу «Лише курс», плюс:',
    items: [
      {
        title: 'Прямий зв’язок із тренером',
        text: 'Особисте спілкування протягом усього зворотного зв’язку.'
      },
      {
        title: 'Розбір ваших відео',
        text: 'Надсилайте відео з тренувань і отримуйте детальний розбір техніки, помилок і того, над чим працювати далі.'
      },
      {
        title: 'Індивідуальні рекомендації',
        text: 'Зрозумілий зворотний зв’язок з урахуванням вашого рівня, стилю їзди та цілей.'
      },
      {
        title: 'Відеодзвінок віч-на-віч',
        text: 'Особистий дзвінок: обговоримо ваш прогрес і техніку та відповімо на запитання.'
      },
      {
        title: 'Запитання Владу',
        text: 'Питайте про курс, тренування, техніку чи конкретні ситуації в їзді.'
      }
    ]
  }
};

export const salesText: Record<AppLocale, SalesText> = {
  en: {
    allCourses: 'All Courses',
    courseOnly: 'Course only',
    courseOnlyDesc: 'Videos + PDFs. Learn at your pace.',
    feedback: 'Course + Personal Feedback',
    feedbackDesc: 'Reviews of your riding videos and a call with Vlad.',
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
    feedback: 'Курс + персональная обратная связь',
    feedbackDesc: 'Разборы ваших видео и созвон с Владом.',
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
    feedback: 'Курс + персональний зворотний зв’язок',
    feedbackDesc: 'Розбори ваших відео та дзвінок із Владом.',
    guarantee: 'Миттєвий доступ · Безпечна оплата · Доступ назавжди',
    lifetime: 'Доступ назавжди. Без підписки.',
    disclaimer:
      'Я розумію, що їзда на мотоциклі пов’язана з ризиком, і сам відповідаю за безпеку під час застосування матеріалів курсу.',
    modulesTitle: 'МОДУЛІ КУРСУ',
    studentName: 'Demo Student'
  }
};
