import type { Course, LegalPage, Lesson } from '@/payload-types';

export type AppLocale = 'en' | 'ru';

export type CourseCardCourse = {
  slug: string;
  icon: string;
  badge?: string;
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
  meta: string;
  open?: boolean;
  lessons: Array<{
    icon: string;
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
  options: Array<{ name: string; price: string; desc: string }>;
  disclaimer: string;
  guarantee: string;
  curriculumIntro: string;
  bottomTitle: string[];
  bottomAccent: string;
  bottomSub: string;
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
