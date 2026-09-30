import type { PurchaseTier } from './types';

// Все письма — на английском, в одной обёртке: тёмная шапка с логотипом (он
// белый), белое поле с текстом, кнопка в цвет сайта, подпись. Вёрстка
// таблицами и инлайн-стилями: так письмо одинаково выглядит в Gmail, Outlook
// и на телефоне.

const BRAND = '#e32823';
const DARK = '#141412';
const TEXT = '#1b1b19';
const MUTED = '#6b6b66';
const LINE = '#e6e6e1';

export const SUPPORT_EMAIL = 'support@motophd.com';

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

export const getDashboardUrl = () => `${getAppUrl()}/en/dashboard`;

export const button = (url: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:${BRAND};border-radius:8px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-weight:600;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;

export const heading = (text: string) =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${TEXT}">${escapeHtml(text)}</h1>`;

export const paragraph = (html: string) => `<p style="margin:0 0 16px">${html}</p>`;

export const note = (html: string) =>
  `<p style="margin:0 0 16px;color:${MUTED};font-size:13px">${html}</p>`;

// «Ключ — значение»: курс и тариф, почта и пароль. Значения экранируются.
export const details = (rows: Array<[string, string]>) => {
  const cell = (index: number) =>
    `padding:10px 14px;${index ? `border-top:1px solid ${LINE};` : ''}`;
  const body = rows
    .map(
      ([label, value], index) =>
        `<tr><td style="${cell(index)}color:${MUTED};width:110px">${escapeHtml(label)}</td><td style="${cell(index)}font-weight:600">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;border:1px solid ${LINE};border-radius:8px;border-collapse:separate">${body}</table>`;
};

export const emailLayout = (content: string) => {
  const appUrl = escapeHtml(getAppUrl());

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f4f4f1"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f1;padding:24px 12px"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:${TEXT}"><tr><td style="background:${DARK};padding:20px 28px;border-radius:12px 12px 0 0"><a href="${appUrl}"><img src="${appUrl}/logo.png" alt="MotoPhD" width="144" height="40" style="display:block;border:0;color:#ffffff;font-weight:700"></a></td></tr><tr><td style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px">${content}</td></tr><tr><td style="padding:16px 28px;color:${MUTED};font-size:12px;text-align:center">MotoPhD · <a href="${appUrl}" style="color:${MUTED}">motophd.com</a><br>Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED}">${SUPPORT_EMAIL}</a></td></tr></table></td></tr></table></body></html>`;
};

export const signatureText = () =>
  `\n\n—\nMotoPhD · ${getAppUrl()}\nQuestions? Reply to this email or write to ${SUPPORT_EMAIL}`;

export const tierName = (tier: PurchaseTier) =>
  ({
    feedback: 'Course + feedback',
    feedback_upgrade: 'Feedback add-on',
    standard: 'Course only'
  })[tier];
