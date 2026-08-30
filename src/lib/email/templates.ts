import type { EmailLocale, EmailMessage, PurchaseTier } from './types';

const escapeHtml = (value: string) =>
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

const emailLayout = (content: string) =>
  `<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;line-height:1.5;color:#181818">${content}</body></html>`;

const link = (url: string, label: string) =>
  `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;

export const getAppUrl = () => (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

const getLoginUrl = (locale: EmailLocale) => `${getAppUrl()}/${locale}/login`;

const getDashboardUrl = (locale: EmailLocale) => `${getAppUrl()}/${locale}/dashboard`;

const tierName = (tier: PurchaseTier, locale: EmailLocale) => {
  const names = {
    en: {
      feedback: 'Course + feedback',
      feedback_upgrade: 'Feedback upgrade',
      standard: 'Course only'
    },
    ru: {
      feedback: 'Курс + обратная связь',
      feedback_upgrade: 'Докупка обратной связи',
      standard: 'Только курс'
    }
  };

  return names[locale][tier];
};

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
      subject: 'Твои данные для входа в MotoPhD',
      text: `Привет!\n\nТвой аккаунт MotoPhD готов.\nEmail: ${to}\nПароль: ${password}\n\nВойти: ${loginUrl}\n\nПосле входа можешь сменить пароль в кабинете.`,
      html: emailLayout(
        `<p>Привет!</p><p>Твой аккаунт MotoPhD готов.</p><p>Email: <strong>${escapeHtml(to)}</strong><br>Пароль: <strong>${escapeHtml(password)}</strong></p><p>${link(loginUrl, 'Войти в кабинет')}</p><p>После входа можешь сменить пароль в кабинете.</p>`
      )
    };
  }

  return {
    to,
    subject: 'Your MotoPhD access details',
    text: `Hi!\n\nYour MotoPhD account is ready.\nEmail: ${to}\nPassword: ${password}\n\nSign in: ${loginUrl}\n\nYou can change your password in the dashboard after signing in.`,
    html: emailLayout(
      `<p>Hi!</p><p>Your MotoPhD account is ready.</p><p>Email: <strong>${escapeHtml(to)}</strong><br>Password: <strong>${escapeHtml(password)}</strong></p><p>${link(loginUrl, 'Sign in to your dashboard')}</p><p>You can change your password in the dashboard after signing in.</p>`
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
      text: `Спасибо за покупку!\n\nКурс: ${courseTitle}\nТариф: ${selectedTier}\n\nТвой кабинет: ${dashboardUrl}`,
      html: emailLayout(
        `<p>Спасибо за покупку!</p><p>Курс: <strong>${title}</strong><br>Тариф: <strong>${escapeHtml(selectedTier)}</strong></p><p>${link(dashboardUrl, 'Перейти в кабинет')}</p>`
      )
    };
  }

  return {
    to,
    subject: 'Your MotoPhD purchase is confirmed',
    text: `Thanks for your purchase!\n\nCourse: ${courseTitle}\nTier: ${selectedTier}\n\nYour dashboard: ${dashboardUrl}`,
    html: emailLayout(
      `<p>Thanks for your purchase!</p><p>Course: <strong>${title}</strong><br>Tier: <strong>${escapeHtml(selectedTier)}</strong></p><p>${link(dashboardUrl, 'Open your dashboard')}</p>`
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
  const contactUrl = process.env.FEEDBACK_CONTACT_URL || '';
  const contact = contactUrl
    ? link(
        contactUrl,
        locale === 'ru' ? 'Написать в WhatsApp / Telegram' : 'Message us on WhatsApp / Telegram'
      )
    : locale === 'ru'
      ? 'Контакт WhatsApp / Telegram скоро появится.'
      : 'The WhatsApp / Telegram contact link will be available soon.';
  const contactText =
    contactUrl || (locale === 'ru' ? 'Контакт будет добавлен скоро.' : 'Contact link coming soon.');

  if (locale === 'ru') {
    return {
      to,
      subject: 'Как получить обратную связь MotoPhD',
      text: `Спасибо, что выбрал тариф с обратной связью!\n\n1. Напиши нам в WhatsApp или Telegram: ${contactText}\n2. Пришли видео своей езды и коротко опиши, над чем хочешь поработать.\n\nВ тариф включены: 1 видео-разбор и 1 Zoom-созвон на 45 минут.`,
      html: emailLayout(
        `<p>Спасибо, что выбрал тариф с обратной связью!</p><ol><li>${contact}</li><li>Пришли видео своей езды и коротко опиши, над чем хочешь поработать.</li></ol><p>В тариф включены: <strong>1 видео-разбор + 1 Zoom-созвон на 45 минут</strong>.</p>`
      )
    };
  }

  return {
    to,
    subject: 'How to get your MotoPhD feedback',
    text: `Thanks for choosing the feedback tier!\n\n1. Message us on WhatsApp or Telegram: ${contactText}\n2. Send a video of your riding and tell us briefly what you want to work on.\n\nYour tier includes: 1 video review and 1 Zoom call (45 minutes).`,
    html: emailLayout(
      `<p>Thanks for choosing the feedback tier!</p><ol><li>${contact}</li><li>Send a video of your riding and tell us briefly what you want to work on.</li></ol><p>Your tier includes: <strong>1 video review + 1 Zoom call (45 minutes)</strong>.</p>`
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
      text: `Чтобы задать новый пароль, перейди по ссылке:\n${resetUrl}\n\nЕсли ты не запрашивал восстановление пароля, просто проигнорируй это письмо.`,
      html: emailLayout(
        `<p>Чтобы задать новый пароль, перейди по ссылке:</p><p>${link(resetUrl, 'Сбросить пароль')}</p><p>Если ты не запрашивал восстановление пароля, просто проигнорируй это письмо.</p>`
      )
    };
  }

  return {
    to,
    subject: 'Reset your MotoPhD password',
    text: `Use this link to set a new password:\n${resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
    html: emailLayout(
      `<p>Use this link to set a new password:</p><p>${link(resetUrl, 'Reset password')}</p><p>If you did not request a password reset, you can ignore this email.</p>`
    )
  };
};
