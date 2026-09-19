import type { Locale } from '@/i18n/locales';

// Шаблоны писем написаны только на en и ru. Остальные локали сайта уходят
// на язык своего фолбэка (uk → ru), как и контент курсов — см. toEmailLocale.
export const emailLocales = ['en', 'ru'] as const satisfies readonly Locale[];

export type EmailLocale = (typeof emailLocales)[number];

export type PurchaseTier = 'standard' | 'feedback' | 'feedback_upgrade';

export interface EmailMessage {
  html: string;
  subject: string;
  text: string;
  to: string;
}
