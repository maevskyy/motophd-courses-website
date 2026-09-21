import type { Course, Lesson } from '@/payload-types';
import type { CourseCurriculumLesson } from './courses';
import { curriculumLevelsByCourse, readingLabels, salesText } from './localizedText';
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
  { icon: 'motorcycle' as const, imageTone: 'red' as const, image: '/course-lean.jpg' },
  { icon: 'flag' as const, imageTone: 'green' as const, image: '/course-braking.jpg' },
  { icon: 'wrench' as const, imageTone: 'blue' as const, image: undefined }
];

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
  const text = salesText[locale];
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
    enrollCta: text.enrollCta,
    teaserTitle: text.teaserTitle
  };
};

const lessonDuration = (lesson: CourseCurriculumLesson, locale: AppLocale) => {
  if (lesson.type === 'video' || lesson.type === 'pdf') {
    return '';
  }

  return readingLabels[locale];
};

const toCurriculumLesson = (lesson: CourseCurriculumLesson, locale: AppLocale) => ({
  name: lesson.title,
  order: lesson.order ?? 0,
  duration: lessonDuration(lesson, locale)
});

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
        lessons: lessons.map((lesson) => toCurriculumLesson(lesson, locale))
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
      lessons: levelLessons.map((lesson) => toCurriculumLesson(lesson, locale))
    };
  });
};

const sortLessonsByOrder = <T extends Pick<Lesson, 'order'>>(lessons: T[]) =>
  [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// ?lesson=2 → 2. Мусор, пустая строка или массив → undefined: плеер откроет
// первый урок, а не упадёт и не покажет «урок 0».
export const parseLessonOrder = (value: string | string[] | undefined) =>
  typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : undefined;

// Урок для плеера: тот, чей order запросили в адресе; без параметра или с
// неизвестным order — первый по порядку. Раньше всегда играл первый video-урок.
export const getPlayerLesson = <T extends Pick<Lesson, 'order'>>(
  lessons: T[],
  requestedOrder?: number
): T | undefined => {
  const sorted = sortLessonsByOrder(lessons);
  const requested =
    requestedOrder === undefined
      ? undefined
      : sorted.find((lesson) => lesson.order === requestedOrder);

  return requested ?? sorted[0];
};

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
  {
    currentLesson,
    ...media
  }: Pick<PlayerContent, 'downloads' | 'videoEmbedUrl'> & { currentLesson: Lesson | undefined }
): PlayerContent => {
  const notes = course.commonMistakes?.split('\n').filter(Boolean) || [];
  const position = currentLesson ? sortLessonsByOrder(lessons).indexOf(currentLesson) : -1;

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
    currentLessonOrder: currentLesson?.order ?? null,
    lessonNumber: position + 1,
    lessonCount: lessons.length,
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
