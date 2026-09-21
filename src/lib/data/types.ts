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
  currency: Course['currency'];
};

export type CurriculumModule = {
  number: string;
  title: string;
  open?: boolean;
  lessons: Array<{
    name: string;
    order: number;
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
};

export type DashboardContent = {
  dashboard: {
    downloads: PlayerDownload[];
  };
};

export type PlayerContent = {
  title: string;
  subtitle: string;
  videoMeta: string;
  notes: string[];
  feel: string;
  overviewTitle: string;
  overviewCopy: string;
  moduleOutcome: string[];
  sidebarTitle: string;
  // Текущий урок: order для подсветки в боковой панели, номер и общее число —
  // для подписи «УРОК N ИЗ M». Прогресса прохождения нет (ADR-9).
  currentLessonOrder: number | null;
  lessonNumber: number;
  lessonCount: number;
  videoEmbedUrl: string | null;
  downloads: PlayerDownload[];
};

export type PlayerDownload = {
  id: number;
  title: string;
  url: string;
};

export type PublishedCourse = Course;
export type PublishedLesson = Lesson;
export type PublishedLegalPage = LegalPage;
