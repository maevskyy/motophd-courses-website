import type { EmailLocale, PurchaseTier } from './types';

export const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };

    return entities[character];
  });

export const getAppUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

export const getLoginUrl = (locale: EmailLocale) => `${getAppUrl()}/${locale}/login`;

export const getDashboardUrl = (locale: EmailLocale) => `${getAppUrl()}/${locale}/dashboard`;

export const link = (url: string, label: string) =>
  `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;

const signatureHtml = (locale: EmailLocale) => {
  const help =
    locale === 'ru'
      ? 'Ответь на это письмо, если нужна помощь.'
      : 'Reply to this email if you need help.';

  return `<p style="color:#666;font-size:13px;margin-top:24px">MotoPhD Online · ${link(getAppUrl(), 'motophd.com')}<br>${help}</p>`;
};

export const signatureText = (locale: EmailLocale) =>
  locale === 'ru'
    ? `\n\n—\nMotoPhD Online · ${getAppUrl()}\nОтветь на это письмо, если нужна помощь.`
    : `\n\n—\nMotoPhD Online · ${getAppUrl()}\nReply to this email if you need help.`;

// Письмо без отправителя и контакта читается как фишинг и хуже доставляется,
// поэтому подпись добавляется здесь, а не в каждом шаблоне.
export const emailLayout = (content: string, locale: EmailLocale) =>
  `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;line-height:1.5;color:#181818">${content}${signatureHtml(locale)}</body></html>`;

export const tierName = (tier: PurchaseTier, locale: EmailLocale) => {
  const names = {
    en: {
      feedback: 'Course + feedback',
      feedback_upgrade: 'Feedback added to your course',
      standard: 'Course only'
    },
    ru: {
      feedback: 'Курс + обратная связь',
      feedback_upgrade: 'Обратная связь к курсу',
      standard: 'Только курс'
    }
  };

  return names[locale][tier];
};
