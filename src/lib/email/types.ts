export type EmailLocale = 'en' | 'ru';

export type PurchaseTier = 'standard' | 'feedback' | 'feedback_upgrade';

export interface EmailMessage {
  html: string;
  subject: string;
  text: string;
  to: string;
}
