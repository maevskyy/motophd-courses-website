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
  { icon: '🏍️', imageTone: 'red' as const, image: '/course-lean.jpg' },
  { icon: '⚡', imageTone: 'green' as const, image: '/course-braking.jpg' },
  { icon: '🛑', imageTone: 'blue' as const, image: undefined }
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
    modulesTitle: 'COURSE MODULES',
    enrollCta: 'ENROLL FOR TRAINING',
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
    enrollCta: 'ЗАПИСАТЬСЯ НА ОБУЧЕНИЕ',
    studentName: 'Demo Student'
  }
};

export const toCourseCardCourse = (
  course: Course,
  index = Number(course.order || 1) - 1
): CourseCardCourse => {
  const visual = visualByIndex[index % visualByIndex.length] || visualByIndex[0];
  const includes = course.outcomes?.map(({ text }) => text).filter(Boolean) || [];

  return {
    slug: course.slug,
    icon: visual.icon,
    image: visual.image,
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
        desc: text.courseOnlyDesc,
        tier: 'standard'
      },
      {
        name: text.feedback,
        price: `€${course.priceFeedback}`,
        desc: text.feedbackDesc,
        tier: 'feedback'
      }
    ],
    disclaimer: text.disclaimer,
    guarantee: text.guarantee,
    modulesTitle: text.modulesTitle,
    enrollCta: text.enrollCta
  };
};

const lessonDuration = (lesson: CourseCurriculumLesson, locale: AppLocale) => {
  if (lesson.type === 'video' || lesson.type === 'pdf') {
    return '';
  }

  return locale === 'ru' ? 'Чтение' : 'Reading';
};

const curriculumLevelsByCourse: Record<string, Record<AppLocale, Array<{ title: string; count: number }>>> = {
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
    ]
  }
};

export const toCurriculumModules = (
  course: Course,
  lessons: CourseCurriculumLesson[],
  locale: AppLocale
): CurriculumModule[] => {
  if (lessons.length === 0) {
    return [];
  }

  const levels = curriculumLevelsByCourse[course.slug]?.[locale];
  const totalLevelLessons = levels?.reduce((sum, level) => sum + level.count, 0);

  if (!levels || totalLevelLessons !== lessons.length) {
    return [
      {
        number: '1',
        title: course.title,
        open: true,
        lessons: lessons.map((lesson) => ({
          name: lesson.title,
          duration: lessonDuration(lesson, locale)
        }))
      }
    ];
  }

  let cursor = 0;

  return levels.map((level, levelIndex) => {
    const levelLessons = lessons.slice(cursor, cursor + level.count);
    cursor += level.count;

    return {
      number: String(levelIndex + 1).padStart(2, '0'),
      title: level.title,
      open: levelIndex === 0,
      lessons: levelLessons.map((lesson) => ({
        name: lesson.title,
        duration: lessonDuration(lesson, locale)
      }))
    };
  });
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
