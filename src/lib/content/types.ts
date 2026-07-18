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

export type HomeContent = {
  heroBadge: string;
  heroTitle: string[];
  heroRed: string;
  heroAfterRed: string;
  heroSub: string;
  stats: Array<{ value: string; accent?: string; label: string }>;
  coursesLabel: string;
  coursesTitle: string[];
  coursesSub: string;
  methodLabel: string;
  methodTitle: string;
  methodSub: string;
  method: Array<{ icon: string; num: string; title: string; desc: string }>;
  testimonialsLabel: string;
  testimonialsTitle: string[];
  testimonials: Array<{ initial: string; name: string; country: string; quote: string }>;
  howLabel: string;
  howTitle: string[];
  steps: Array<{ num: string; title: string; desc: string }>;
  instructorLabel: string;
  instructorTitle: string[];
  instructorCopy: string[];
  instructorName: string;
  instructorRole: string;
  faqLabel: string;
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string[];
  ctaAccent: string;
  ctaSub: string;
};

export type PrototypeContent = {
  home: HomeContent;
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
  dashboard: {
    studentName: string;
    studentEmail: string;
    downloads: Array<{ name: string; size: string }>;
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
