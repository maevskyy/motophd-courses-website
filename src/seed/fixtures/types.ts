import type { Locale } from '@/i18n/routing';

export type Course = {
  slug: string;
  icon: string;
  badge?: string;
  imageTone: 'red' | 'green' | 'blue';
  featured?: boolean;
  pain: string;
  title: string;
  description: string;
  includes: string[];
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

export type PrototypeContent = {
  courses: {
    label: string;
    title: string;
    sub: string;
  };
  sales: {
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
  player: {
    title: string;
    subtitle: string;
    videoMeta: string;
    notes: string[];
    feel: string;
    overviewTitle: string;
    overviewCopy: string;
    moduleOutcome: string[];
    sidebarTitle: string;
  };
};

export type LocalizedContent<T> = Record<Locale, T>;
