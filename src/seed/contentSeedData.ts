import type { Lesson } from '@/payload-types';
import { salesContent } from './fixtures/coursePages';
import { localizedCourses } from './fixtures/courses';
import { getCurriculumForCourse } from './fixtures/curriculum';
import { playerContent } from './fixtures/player';
import type { Course } from './fixtures/types';

export type Locale = 'en' | 'ru';

export type CourseSeed = {
  en: Course;
  ru: Course;
};

export type LegalPageSeed = {
  slug: 'privacy' | 'terms' | 'refund' | 'contact';
  en: {
    title: string;
    body: string;
  };
  ru: {
    title: string;
    body: string;
  };
};

export const locales: Locale[] = ['en', 'ru'];

export const legalPageSeeds: LegalPageSeed[] = [
  {
    slug: 'privacy',
    en: {
      title: 'Privacy Policy',
      body: 'MotoPhD collects only the data required to provide course access, student support, and purchase records. Full legal text will be finalized before production launch.'
    },
    ru: {
      title: 'Политика конфиденциальности',
      body: 'MotoPhD собирает только данные, необходимые для доступа к курсам, поддержки студентов и истории покупок. Полный юридический текст будет финализирован перед запуском.'
    }
  },
  {
    slug: 'terms',
    en: {
      title: 'Terms & Conditions',
      body: 'MotoPhD courses are educational materials. Riding a motorcycle involves risk, and each rider is responsible for their own safety when applying course material.'
    },
    ru: {
      title: 'Условия использования',
      body: 'Курсы MotoPhD являются образовательными материалами. Езда на мотоцикле связана с риском, и каждый райдер сам отвечает за свою безопасность при применении материалов курса.'
    }
  },
  {
    slug: 'refund',
    en: {
      title: 'Refund Policy',
      body: 'Digital course access is provided immediately after purchase. Refund terms and the explicit EU digital-content waiver will be finalized before production checkout.'
    },
    ru: {
      title: 'Политика возврата',
      body: 'Доступ к цифровому курсу предоставляется сразу после покупки. Условия возврата и явный отказ от права возврата для цифрового контента ЕС будут финализированы перед production checkout.'
    }
  },
  {
    slug: 'contact',
    en: {
      title: 'Contact',
      body: 'For questions about MotoPhD courses, payments, or access, contact the MotoPhD team. Production contact details will be added before launch.'
    },
    ru: {
      title: 'Контакты',
      body: 'По вопросам курсов MotoPhD, оплаты или доступа свяжитесь с командой MotoPhD. Production-контакты будут добавлены перед запуском.'
    }
  }
];

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

export const getFlatLessons = (courseSlug: string, locale: Locale) =>
  getCurriculumForCourse(courseSlug)[locale].flatMap((module) =>
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
