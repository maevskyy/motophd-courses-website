import type { Course, Lesson } from '@/payload-types';
import { lessonOrder } from '@/lib/progress';
import type { CourseCurriculumLesson } from './courses';
import { richTextToText } from './richText';
import type {
  AppLocale,
  CourseCardCourse,
  CurriculumModule,
  DashboardContent,
  PlayerContent,
  PlayerDownload,
  PlayerLesson,
  SalesContent
} from './types';

const visualByIndex = [
  { icon: 'motorcycle' as const, imageTone: 'red' as const, image: '/course-lean.jpg' },
  { icon: 'flag' as const, imageTone: 'green' as const, image: '/course-braking.jpg' },
  { icon: 'wrench' as const, imageTone: 'blue' as const, image: undefined }
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

// Урок из URL: только положительное целое без ведущих нулей, иначе 404.
export const parseLessonOrder = (value: string): number | null =>
  /^[1-9]\d*$/.test(value) ? Number(value) : null;

export const getPlayerLesson = <L extends Pick<Lesson, 'order'>>(lessons: L[], order: number) =>
  lessons.find((lesson) => lessonOrder(lesson) === order);

const pdfFileName = (pdf: Lesson['pdf']) =>
  typeof pdf === 'object' && pdf?.filename ? pdf.filename : undefined;

// Материалы берём по наличию файла, а не по type: PDF бывает приложен и к
// видео-уроку, а раньше ссылка строилась только для type === 'pdf' и не
// появлялась никогда.
export const toPlayerDownloads = (lessons: Lesson[], locale: AppLocale): PlayerDownload[] =>
  lessons
    .filter((lesson) => Boolean(lesson.pdf))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      fileName: pdfFileName(lesson.pdf),
      url: `/api/lessons/${lesson.id}/pdf?locale=${locale}`
    }));

const lessonBody = (body: Lesson['body']): PlayerLesson['body'] =>
  body && richTextToText(body) ? body : null;

// Плеер получает все уроки курса: активный выбирает клиент (order из URL или
// следующий непройденный по прогрессу в localStorage).
export const toPlayerContent = (
  course: Course,
  lessons: Lesson[],
  locale: AppLocale,
  media: { playbackUrl: (streamVideoId: Lesson['streamVideoId']) => string | null }
): PlayerContent => {
  const sorted = [...lessons].sort((a, b) => lessonOrder(a) - lessonOrder(b));
  // Номер модуля по позиции: toCurriculumModules режет тот же отсортированный список.
  const moduleByIndex = toCurriculumModules(course, sorted, locale).flatMap((module, index) =>
    module.lessons.map(() => index + 1)
  );

  return {
    courseSlug: course.slug,
    courseTitle: course.title,
    lessons: sorted.map((lesson, index) => ({
      id: lesson.id,
      order: lessonOrder(lesson),
      title: lesson.title,
      type: lesson.type,
      module: moduleByIndex[index] ?? 1,
      body: lessonBody(lesson.body),
      videoEmbedUrl: lesson.type === 'video' ? media.playbackUrl(lesson.streamVideoId) : null,
      download: toPlayerDownloads([lesson], locale)[0] ?? null
    })),
    keyTakeaways: course.commonMistakes?.split('\n').filter(Boolean) || [],
    feel: course.whatYouShouldFeel || ''
  };
};

// Материалы всех купленных курсов и настоящие ссылки на защищённый роут:
// раньше список резался до двух штук и вёл в тост вместо файла.
export const toDashboardContent = (lessons: Lesson[], locale: AppLocale): DashboardContent => ({
  dashboard: {
    downloads: toPlayerDownloads(lessons, locale)
  }
});
