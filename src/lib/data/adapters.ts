import type { Course, Lesson } from '@/payload-types';
import type { CourseCurriculumLesson } from './courses';
import type {
  AppLocale,
  CourseCardCourse,
  CurriculumModule,
  DashboardContent,
  PlayerContent,
  PlayerDownload,
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
    bottomSub: 'One course. One transformation. Lifetime access.'
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
    bottomSub: 'Один курс. Одна трансформация. Доступ навсегда.'
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

const lessonDuration = (lesson: CourseCurriculumLesson) => {
  if (lesson.durationSec) {
    return `${Math.round(lesson.durationSec / 60)} min`;
  }

  return lesson.type === 'pdf' ? 'PDF' : 'Reading';
};

const lessonIcon = (lesson: CourseCurriculumLesson) => {
  if (lesson.type === 'pdf') {
    return '📄';
  }

  return lesson.type === 'video' ? '🎥' : '📝';
};

export const toCurriculumModules = (
  course: Course,
  lessons: CourseCurriculumLesson[]
): CurriculumModule[] => {
  if (lessons.length === 0) {
    return [];
  }

  return [
    {
      number: '1',
      title: course.title,
      meta: `${lessons.length} lessons`,
      open: true,
      lessons: lessons.map((lesson) => ({
        icon: lessonIcon(lesson),
        name: lesson.title,
        duration: lessonDuration(lesson)
      }))
    }
  ];
};

export const getPlayerLesson = (lessons: Lesson[]) =>
  lessons.find((lesson) => lesson.type === 'video') || lessons[0];

// Материалы берём по наличию файла, а не по type: PDF бывает приложен и к
// видео-уроку, а раньше ссылка строилась только для type === 'pdf' и не
// появлялась никогда.
export const toPlayerDownloads = (lessons: Lesson[], locale: AppLocale): PlayerDownload[] =>
  lessons
    .filter((lesson) => Boolean(lesson.pdf))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      url: `/api/lessons/${lesson.id}/pdf?locale=${locale}`
    }));

export const toPlayerContent = (
  course: Course,
  lessons: Lesson[],
  media: Pick<PlayerContent, 'downloads' | 'videoEmbedUrl'>
): PlayerContent => {
  const currentLesson = getPlayerLesson(lessons);
  const notes = course.commonMistakes?.split('\n').filter(Boolean) || [];

  return {
    title: currentLesson?.title || course.title,
    subtitle: course.keyPoint || course.description || '',
    videoMeta: currentLesson?.durationSec
      ? `${Math.round(currentLesson.durationSec / 60)}:00 · MotoPhD Online`
      : 'MotoPhD Online',
    notes,
    feel: course.whatYouShouldFeel || '',
    overviewTitle: course.title,
    overviewCopy: course.description || '',
    moduleOutcome: course.outcomes?.map(({ text }) => text).filter(Boolean) || [],
    sidebarTitle: course.title,
    ...media
  };
};

// Материалы всех купленных курсов и настоящие ссылки на защищённый роут:
// раньше список резался до двух штук и вёл в тост вместо файла.
export const toDashboardContent = (lessons: Lesson[], locale: AppLocale): DashboardContent => ({
  dashboard: {
    downloads: toPlayerDownloads(lessons, locale)
  }
});
