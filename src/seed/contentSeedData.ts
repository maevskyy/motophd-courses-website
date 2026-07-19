import { salesContent } from '@/lib/content/coursePages';
import { localizedCourses } from '@/lib/content/courses';
import { curriculum } from '@/lib/content/curriculum';
import { playerContent } from '@/lib/content/player';
import type { Course } from '@/lib/content/types';
import type { Lesson } from '@/payload-types';

export type Locale = 'en' | 'ru';

export type CourseSeed = {
  en: Course;
  ru: Course;
};

export const locales: Locale[] = ['en', 'ru'];

export const toRichText = (text: string): NonNullable<Lesson['body']> => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1
      }
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1
  }
});

export const getCourseSeeds = (): CourseSeed[] =>
  localizedCourses.en.slice(0, 2).map((course) => {
    const ruCourse = localizedCourses.ru.find(({ slug }) => slug === course.slug);

    if (!ruCourse) {
      throw new Error(`Missing RU fixture for course "${course.slug}"`);
    }

    return {
      en: course,
      ru: ruCourse
    };
  });

export const getOutcomes = (course: Course, locale: Locale) =>
  course.slug === 'lean'
    ? salesContent[locale].outcomes.map((text) => ({ text }))
    : course.includes.map((text) => ({ text }));

export const getDurationSec = (duration: string) => {
  const minutesMatch = duration.match(/(\d+)\s*min/i);

  if (minutesMatch?.[1]) {
    return Number(minutesMatch[1]) * 60;
  }

  return undefined;
};

export const getLessonType = (lesson: { icon: string; name: string }) => {
  const text = `${lesson.icon} ${lesson.name}`.toLowerCase();

  if (text.includes('pdf') || text.includes('📄')) {
    return 'pdf' as const;
  }

  if (text.includes('video') || text.includes('drill') || text.includes('🎥')) {
    return 'video' as const;
  }

  return 'text' as const;
};

export const getFlatLessons = () =>
  curriculum.flatMap((module) =>
    module.lessons.map((lesson) => ({
      moduleTitle: module.title,
      ...lesson
    }))
  );

export const getKeyPoint = (course: Course) =>
  course.slug === 'lean' ? playerContent.overviewCopy : course.includes[0] || course.description;

export const getCommonMistakes = (course: Course) =>
  course.slug === 'lean' ? playerContent.notes.join('\n') : course.includes.slice(1).join('\n');

export const getWhatYouShouldFeel = (course: Course) =>
  course.slug === 'lean' ? playerContent.feel : course.description;
