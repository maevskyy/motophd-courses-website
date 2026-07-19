import type { Course, Lesson } from '@/payload-types';
import { richTextToText } from './richText';
import type {
  AppLocale,
  CourseCardCourse,
  CurriculumModule,
  DashboardContent,
  PlayerContent,
  SalesContent
} from './types';

const visualByIndex = [
  { icon: '🏍️', imageTone: 'red' as const },
  { icon: '⚡', imageTone: 'green' as const },
  { icon: '🛑', imageTone: 'blue' as const }
];

const localized = {
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
    curriculumIntro: 'Theory + practice lessons. Each lesson has a clear, measurable outcome.',
    ready: 'Ready to ride',
    withoutFear: 'with more confidence?',
    bottomSub: 'One course. One transformation. Lifetime access.',
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
    curriculumIntro: 'Теория + практика. У каждого урока понятный результат.',
    ready: 'Готов ехать',
    withoutFear: 'увереннее?',
    bottomSub: 'Один курс. Одна трансформация. Доступ навсегда.',
    studentName: 'Demo Student'
  }
};

export const toCourseCardCourse = (
  course: Course,
  index = Number(course.order || 1) - 1,
  locale: AppLocale = 'en'
): CourseCardCourse => {
  const visual = visualByIndex[index % visualByIndex.length] || visualByIndex[0];
  const includes = course.outcomes?.map(({ text }) => text).filter(Boolean) || [];

  return {
    slug: course.slug,
    icon: visual.icon,
    badge: index === 0 ? (locale === 'ru' ? 'Флагман' : 'Flagship') : undefined,
    imageTone: visual.imageTone,
    featured: index === 0,
    pain: course.pain || '',
    title: course.title,
    description: course.description || '',
    includes,
    priceStandard: course.priceStandard,
    priceFeedback: course.priceFeedback,
    currency: course.currency
  };
};

export const toSalesContent = (course: Course, locale: AppLocale): SalesContent => {
  const text = localized[locale];
  const outcomes = course.outcomes?.map(({ text: outcome }) => outcome).filter(Boolean) || [];

  return {
    breadcrumb: text.allCourses,
    tag: course.pain || course.title,
    title: [course.title],
    pain: course.description || course.pain || '',
    outcomes,
    priceNote: text.lifetime,
    options: [
      {
        name: text.courseOnly,
        price: `€${course.priceStandard}`,
        desc: text.courseOnlyDesc
      },
      {
        name: text.feedback,
        price: `€${course.priceFeedback}`,
        desc: text.feedbackDesc
      }
    ],
    disclaimer: text.disclaimer,
    guarantee: text.guarantee,
    curriculumIntro: text.curriculumIntro,
    bottomTitle: [text.ready],
    bottomAccent: text.withoutFear,
    bottomSub: text.bottomSub
  };
};

const lessonDuration = (lesson: Lesson) => {
  if (lesson.durationSec) {
    return `${Math.round(lesson.durationSec / 60)} min`;
  }

  return lesson.type === 'pdf' ? 'PDF' : 'Reading';
};

const lessonIcon = (lesson: Lesson) => {
  if (lesson.type === 'pdf') {
    return '📄';
  }

  return lesson.type === 'video' ? '🎥' : '📝';
};

const getModuleTitle = (lesson: Lesson, fallback: string) =>
  richTextToText(lesson.body).split('\n').find(Boolean) || fallback;

export const toCurriculumModules = (course: Course, lessons: Lesson[]): CurriculumModule[] => {
  const modules = new Map<string, Lesson[]>();

  for (const lesson of lessons) {
    const moduleTitle = getModuleTitle(lesson, course.title);
    modules.set(moduleTitle, [...(modules.get(moduleTitle) || []), lesson]);
  }

  return Array.from(modules.entries()).map(([title, moduleLessons], index) => ({
    number: String(index + 1),
    title,
    meta: `${moduleLessons.length} lessons`,
    open: index === 0,
    lessons: moduleLessons.map((lesson) => ({
      icon: lessonIcon(lesson),
      name: lesson.title,
      duration: lessonDuration(lesson)
    }))
  }));
};

export const toPlayerContent = (course: Course, lessons: Lesson[]): PlayerContent => {
  const currentLesson = lessons.find((lesson) => lesson.type === 'video') || lessons[0];
  const notes = course.commonMistakes?.split('\n').filter(Boolean) || [];

  return {
    title: currentLesson?.title || course.title,
    subtitle: course.keyPoint || course.description || '',
    videoMeta: currentLesson?.durationSec ? `${Math.round(currentLesson.durationSec / 60)}:00 · MotoPhD Online` : 'MotoPhD Online',
    notes,
    feel: course.whatYouShouldFeel || '',
    overviewTitle: course.title,
    overviewCopy: course.description || '',
    moduleOutcome: course.outcomes?.map(({ text }) => text).filter(Boolean) || [],
    sidebarTitle: course.title
  };
};

export const toDashboardContent = (lessons: Lesson[], locale: AppLocale): DashboardContent => ({
  dashboard: {
    studentName: localized[locale].studentName,
    downloads: lessons
      .filter((lesson) => lesson.type === 'pdf')
      .slice(0, 2)
      .map((lesson) => ({
        name: lesson.title,
        size: 'PDF'
      }))
  }
});
