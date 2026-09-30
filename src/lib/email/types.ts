// Письма всегда на английском, независимо от языка сайта: так решил
// заказчик 30.09 — один язык проще поддерживать и проверять.

export type PurchaseTier = 'standard' | 'feedback' | 'feedback_upgrade';

export interface EmailMessage {
  html: string;
  subject: string;
  text: string;
  to: string;
}
