import { defaultLocale, getFallbackLocale, toLocale, type Locale } from '@/i18n/locales';
import { sendEmail } from './sendEmail';
import {
  createAccountCredentialsEmail,
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';
import { emailLocales, type EmailLocale, type PurchaseTier } from './types';

// Данные приходят из платёжного вебхука, то есть снаружи: неизвестная локаль
// раньше роняла шаблон на names[locale][tier], а чужой tier печатался как undefined.
const tiers: PurchaseTier[] = ['standard', 'feedback', 'feedback_upgrade'];

const isEmailLocale = (value: unknown): value is EmailLocale =>
  (emailLocales as readonly unknown[]).includes(value);

// Локаль сайта → язык письма: у uk своих шаблонов нет, письмо уходит на
// языке фолбэка (ru); всё незнакомое — по-английски.
export const toEmailLocale = (locale: unknown): EmailLocale => {
  const siteLocale = toLocale(locale);
  const candidates = [siteLocale, getFallbackLocale(siteLocale), defaultLocale];

  return candidates.find(isEmailLocale) ?? emailLocales[0];
};

const toPurchaseTier = (tier: unknown): PurchaseTier =>
  tiers.includes(tier as PurchaseTier) ? (tier as PurchaseTier) : 'standard';

export const sendAccountCredentials = ({
  to,
  password,
  locale
}: {
  to: string;
  password: string;
  locale: Locale;
}) => sendEmail(createAccountCredentialsEmail({ to, password, locale: toEmailLocale(locale) }));

export const sendPurchaseConfirmation = ({
  to,
  courseTitle,
  tier,
  locale
}: {
  to: string;
  courseTitle: string;
  tier: PurchaseTier;
  locale: Locale;
}) =>
  sendEmail(
    createPurchaseConfirmationEmail({
      to,
      courseTitle,
      tier: toPurchaseTier(tier),
      locale: toEmailLocale(locale)
    })
  );

export const sendFeedbackInstructions = ({ to, locale }: { to: string; locale: Locale }) =>
  sendEmail(createFeedbackInstructionsEmail({ to, locale: toEmailLocale(locale) }));

export const sendPasswordReset = ({
  to,
  resetUrl,
  locale
}: {
  to: string;
  resetUrl: string;
  locale: Locale;
}) => sendEmail(createPasswordResetEmail({ to, resetUrl, locale: toEmailLocale(locale) }));
