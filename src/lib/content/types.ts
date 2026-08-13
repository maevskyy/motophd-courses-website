import type { Locale } from '@/i18n/routing';

export type HomeContent = {
  heroBadge: string;
  heroTitle: string[];
  heroRed: string;
  heroAfterRed: string;
  heroSub: string;
  stats: Array<{
    value: string;
    accent?: string;
    label: string;
    note?: string;
    noteAccent?: string;
    href?: string;
  }>;
  coursesLabel: string;
  coursesTitle: string[];
  coursesSub: string;
  methodLabel: string;
  methodTitle: string;
  methodSub: string;
  method: Array<{ icon: string; num: string; title: string; desc: string }>;
  testimonialsLabel: string;
  testimonialsTitle: string[];
  testimonials: Array<{ initial: string; name: string; quote: string }>;
  howLabel: string;
  howTitle: string[];
  steps: Array<{ num: string; title: string; desc: string }>;
  instructorLabel: string;
  instructorTitle: string[];
  instructorCopy: string[];
  instructorName: string;
  instructorRole: string;
  instructorCredentials?: string[];
  faqLabel: string;
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string[];
  ctaAccent: string;
  ctaSub: string;
};

export type LocalizedContent<T> = Record<Locale, T>;
