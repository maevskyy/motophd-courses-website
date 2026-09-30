// Название мессенджера по ссылке FEEDBACK_CONTACT_URL — для подписи кнопки
// «Написать в …». Ссылку меняют в .env сервера, кнопку править не нужно.
const platforms: Array<[RegExp, string]> = [
  [/(^|\.)(instagram\.com|ig\.me)$/, 'Instagram'],
  [/(^|\.)(t\.me|telegram\.me)$/, 'Telegram'],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, 'WhatsApp']
];

export const contactPlatform = (url: null | string | undefined) => {
  if (!url) {
    return null;
  }

  try {
    const host = new URL(url).hostname.toLowerCase();

    return platforms.find(([pattern]) => pattern.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
};
