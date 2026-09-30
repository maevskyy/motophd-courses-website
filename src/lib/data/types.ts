import type { IconName } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/locales';
import type { Course, LegalPage, Lesson } from '@/payload-types';

export type AppLocale = Locale;

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
  // Строки региональных цен: цену для страны выбирает браузер (CoursePrice).
  regionalPrices: Course['regionalPrices'];
};

export type CurriculumModule = {
  number: string;
  title: string;
  open?: boolean;
  lessons: Array<{
    name: string;
    order?: number;
  }>;
};

export type SalesContent = {
  breadcrumb: string;
  tag: string;
  title: string[];
  pain: string;
  outcomes: string[];
  priceNote: string;
  options: Array<{ name: string; desc: string; tier: 'feedback' | 'standard' }>;
  // Цены по умолчанию и по регионам: страница одна на всех (кэш), сумму для
  // страны посетителя считает браузер.
  pricing: Pick<Course, 'priceFeedback' | 'priceStandard' | 'regionalPrices'>;
  // Что входит в тариф с обратной связью — под тарифами, когда он выбран.
  feedbackIncludes: { heading: string; items: Array<{ text: string; title: string }> };
  disclaimer: string;
  guarantee: string;
  modulesTitle: string;
};

export type DashboardContent = {
  dashboard: {
    downloads: PlayerDownload[];
  };
};

export type PlayerContent = {
  courseSlug: string;
  courseTitle: string;
  lessons: PlayerLesson[];
  // Текущий урок: order для подсветки в боковой панели, номер и общее число —
  // для подписи «УРОК N ИЗ M». Прогресса прохождения нет (ADR-9).
  currentLessonOrder?: number | null;
  lessonNumber?: number;
  lessonCount?: number;
  videoEmbedUrl?: string | null;
  downloads?: PlayerDownload[];
};

export type PlayerDownload = {
  id: number;
  title: string;
  url: string;
  fileName?: string | null;
};

export type PlayerLesson = {
  download: PlayerDownload | null;
  durationSec?: number | null;
  id: number;
  module: number;
  order: number;
  // Видео есть, когда в уроке указан Stream video ID; PDF — через download.
  hasVideo: boolean;
  title: string;
  videoEmbedUrl: string | null;
};

export type PublishedCourse = Course;
export type PublishedLesson = Lesson;
export type PublishedLegalPage = LegalPage;
