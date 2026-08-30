import {
  emailLayout,
  escapeHtml,
  getDashboardUrl,
  getLoginUrl,
  link,
  signatureText,
  tierName
} from './emailLayout';
import type { EmailLocale, EmailMessage, PurchaseTier } from './types';

export { getAppUrl } from './emailLayout';

const RESET_LINK_TTL = { en: '1 hour', ru: '1 час' };

export const createAccountCredentialsEmail = ({
  to,
  password,
  locale
}: {
  to: string;
  password: string;
  locale: EmailLocale;
}): EmailMessage => {
  const loginUrl = getLoginUrl(locale);

  if (locale === 'ru') {
    return {
      to,
      subject: 'Данные для входа в MotoPhD',
      text: `Привет!\n\nАккаунт MotoPhD готов.\nEmail: ${to}\nПароль: ${password}\n\nВойти: ${loginUrl}\n\nПароль прислан открытым текстом — рекомендуем сменить его в кабинете после входа.${signatureText(locale)}`,
      html: emailLayout(
        `<p>Привет!</p><p>Аккаунт MotoPhD готов.</p><p>Email: <strong>${escapeHtml(to)}</strong><br>Пароль: <strong>${escapeHtml(password)}</strong></p><p>${link(loginUrl, 'Войти в кабинет')}</p><p>Пароль прислан открытым текстом — рекомендуем сменить его в кабинете после входа.</p>`,
        locale
      )
    };
  }

  return {
    to,
    subject: 'Your MotoPhD access details',
    text: `Hi!\n\nYour MotoPhD account is ready.\nEmail: ${to}\nPassword: ${password}\n\nSign in: ${loginUrl}\n\nThis password was sent in plain text — we recommend changing it in your dashboard.${signatureText(locale)}`,
    html: emailLayout(
      `<p>Hi!</p><p>Your MotoPhD account is ready.</p><p>Email: <strong>${escapeHtml(to)}</strong><br>Password: <strong>${escapeHtml(password)}</strong></p><p>${link(loginUrl, 'Sign in to your dashboard')}</p><p>This password was sent in plain text — we recommend changing it in your dashboard.</p>`,
      locale
    )
  };
};

export const createPurchaseConfirmationEmail = ({
  to,
  courseTitle,
  tier,
  locale
}: {
  to: string;
  courseTitle: string;
  tier: PurchaseTier;
  locale: EmailLocale;
}): EmailMessage => {
  const dashboardUrl = getDashboardUrl(locale);
  const title = escapeHtml(courseTitle);
  const selectedTier = tierName(tier, locale);

  if (locale === 'ru') {
    return {
      to,
      subject: 'Покупка MotoPhD подтверждена',
      text: `Спасибо за покупку!\n\nКурс: ${courseTitle}\nТариф: ${selectedTier}\n\nКабинет: ${dashboardUrl}${signatureText(locale)}`,
      html: emailLayout(
        `<p>Спасибо за покупку!</p><p>Курс: <strong>${title}</strong><br>Тариф: <strong>${escapeHtml(selectedTier)}</strong></p><p>${link(dashboardUrl, 'Перейти в кабинет')}</p>`,
        locale
      )
    };
  }

  return {
    to,
    subject: 'Your MotoPhD purchase is confirmed',
    text: `Thanks for your purchase!\n\nCourse: ${courseTitle}\nTier: ${selectedTier}\n\nYour dashboard: ${dashboardUrl}${signatureText(locale)}`,
    html: emailLayout(
      `<p>Thanks for your purchase!</p><p>Course: <strong>${title}</strong><br>Tier: <strong>${escapeHtml(selectedTier)}</strong></p><p>${link(dashboardUrl, 'Open your dashboard')}</p>`,
      locale
    )
  };
};

export const createFeedbackInstructionsEmail = ({
  to,
  locale
}: {
  to: string;
  locale: EmailLocale;
}): EmailMessage => {
  const contactUrl = process.env.FEEDBACK_CONTACT_URL?.trim();

  if (!contactUrl) {
    // Оплаченный тариф без канала связи — инцидент: иначе покупатель за €129
    // получает письмо «контакт скоро появится» и не может забрать услугу.
    console.error('FEEDBACK_CONTACT_URL is not set; feedback email falls back to replies:', to);
  }

  const contactHtml = contactUrl
    ? link(
        contactUrl,
        locale === 'ru' ? 'Написать в WhatsApp / Telegram' : 'Message us on WhatsApp / Telegram'
      )
    : locale === 'ru'
      ? 'Просто ответь на это письмо — пришлём ссылку на чат.'
      : 'Just reply to this email and we will send you the chat link.';
  const contactPlain = contactUrl
    ? contactUrl
    : locale === 'ru'
      ? 'ответь на это письмо, и мы пришлём ссылку на чат'
      : 'reply to this email and we will send you the chat link';

  if (locale === 'ru') {
    return {
      to,
      subject: 'Как получить обратную связь MotoPhD',
      text: `Спасибо за выбор тарифа с обратной связью!\n\n1. Свяжись с нами: ${contactPlain}\n2. Пришли видео своей езды и коротко опиши, над чем хочешь поработать.\n\nВ тариф включены: 1 видео-разбор и 1 Zoom-созвон на 45 минут.${signatureText(locale)}`,
      html: emailLayout(
        `<p>Спасибо за выбор тарифа с обратной связью!</p><ol><li>${contactHtml}</li><li>Пришли видео своей езды и коротко опиши, над чем хочешь поработать.</li></ol><p>В тариф включены: <strong>1 видео-разбор + 1 Zoom-созвон на 45 минут</strong>.</p>`,
        locale
      )
    };
  }

  return {
    to,
    subject: 'How to get your MotoPhD feedback',
    text: `Thanks for choosing the feedback tier!\n\n1. Get in touch: ${contactPlain}\n2. Send a video of your riding and tell us briefly what you want to work on.\n\nYour tier includes: 1 video review and 1 Zoom call (45 minutes).${signatureText(locale)}`,
    html: emailLayout(
      `<p>Thanks for choosing the feedback tier!</p><ol><li>${contactHtml}</li><li>Send a video of your riding and tell us briefly what you want to work on.</li></ol><p>Your tier includes: <strong>1 video review + 1 Zoom call (45 minutes)</strong>.</p>`,
      locale
    )
  };
};

export const createPasswordResetEmail = ({
  to,
  resetUrl,
  locale
}: {
  to: string;
  resetUrl: string;
  locale: EmailLocale;
}): EmailMessage => {
  if (locale === 'ru') {
    return {
      to,
      subject: 'Восстановление пароля MotoPhD',
      text: `Чтобы задать новый пароль, перейди по ссылке:\n${resetUrl}\n\nСсылка действует ${RESET_LINK_TTL.ru}.\nЕсли запрос был не от тебя, просто проигнорируй это письмо.${signatureText(locale)}`,
      html: emailLayout(
        `<p>Чтобы задать новый пароль, перейди по ссылке:</p><p>${link(resetUrl, 'Сбросить пароль')}</p><p>Ссылка действует ${RESET_LINK_TTL.ru}. Если запрос был не от тебя, просто проигнорируй это письмо.</p>`,
        locale
      )
    };
  }

  return {
    to,
    subject: 'Reset your MotoPhD password',
    text: `Use this link to set a new password:\n${resetUrl}\n\nThe link is valid for ${RESET_LINK_TTL.en}.\nIf this request was not from you, you can ignore this email.${signatureText(locale)}`,
    html: emailLayout(
      `<p>Use this link to set a new password:</p><p>${link(resetUrl, 'Reset password')}</p><p>The link is valid for ${RESET_LINK_TTL.en}. If this request was not from you, you can ignore this email.</p>`,
      locale
    )
  };
};
