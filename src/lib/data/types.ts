import type { IconName } from '@/components/ui/Icon';
import type { Course, LegalPage, Lesson } from '@/payload-types';

export type AppLocale = 'en' | 'ru';

export type CourseCardCourse = {
  slug: string;
  icon: IconName;
  image?: string;
  imageTone: 'red' | 'green' | 'blue';
  featured?: boolean;
  pain: string;
  title: string;
  description: string;
  includes: string[];
  priceStandard: number;
  priceFeedback: number;
  currency: Course['currency'];
};

export type CurriculumModule = {
  number: string;
  title: string;
  open?: boolean;
  lessons: Array<{
    name: string;
    duration: string;
  }>;
};

export type SalesContent = {
  breadcrumb: string;
  tag: string;
  title: string[];
  pain: string;
  outcomes: string[];
  priceNote: string;
  options: Array<{ name: string; price: string; desc: string; tier: 'feedback' | 'standard' }>;
  disclaimer: string;
  guarantee: string;
  modulesTitle: string;
  enrollCta: string;
};

export type DashboardContent = {
  dashboard: {
    downloads: PlayerDownload[];
  };
};

export type PlayerLesson = {
  id: number;
  order: number;
  title: string;
  type: Lesson['type'];
  // Номер модуля (с 1) по toCurriculumModules — для «Модуль k · Урок j из n».
  module: number;
  // Lexical-тело урока; null, если в CMS пусто.
  body: NonNullable<Lesson['body']> | null;
  videoEmbedUrl: string | null;
  download: PlayerDownload | null;
};

export type PlayerContent = {
  courseSlug: string;
  courseTitle: string;
  // Все уроки курса по order: активный выбирает клиент (URL или прогресс).
  lessons: PlayerLesson[];
  keyTakeaways: string[];
  feel: string;
};

export type PlayerDownload = {
  id: number;
  title: string;
  fileName?: string;
  url: string;
};

export type PublishedCourse = Course;
export type PublishedLesson = Lesson;
export type PublishedLegalPage = LegalPage;
