import type { Locale } from '@/i18n/locales';

export type CommunityLink = { platform: 'Facebook' | 'Telegram'; url: string };

// Сообщество студентов в кабинете купившего: русско- и украиноязычным —
// чат в Telegram, англоязычным — группа в Facebook (Влад, 12.10.2026).
// Выбор по языку сайта: язык у курса не хранится, видео общие.
export const communityLinks: Record<Locale, CommunityLink> = {
  en: { platform: 'Facebook', url: 'https://www.facebook.com/groups/1650061726661261/' },
  ru: { platform: 'Telegram', url: 'https://t.me/+eQkRWmxpVdo0OTM0' },
  uk: { platform: 'Telegram', url: 'https://t.me/+eQkRWmxpVdo0OTM0' }
};
