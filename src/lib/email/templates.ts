import {
  button,
  details,
  emailLayout,
  escapeHtml,
  getDashboardUrl,
  heading,
  note,
  paragraph,
  signatureText,
  SUPPORT_EMAIL,
  tierName
} from './emailLayout';
import type { EmailMessage, PurchaseTier } from './types';

export { getAppUrl } from './emailLayout';

const RESET_LINK_TTL = '1 hour';

// Покупка. password есть, только если это первая оплата аккаунта: аккаунт
// создан при оформлении заказа, и пароля покупатель ещё не знает.
export const createPurchaseConfirmationEmail = ({
  courseTitle,
  password,
  tier,
  to
}: {
  courseTitle: string;
  password?: string;
  tier: PurchaseTier;
  to: string;
}): EmailMessage => {
  const dashboardUrl = getDashboardUrl();
  const plan = tierName(tier);
  const loginHtml = password
    ? paragraph('<strong>Your sign-in details</strong>') +
      details([
        ['Email', to],
        ['Password', password]
      ]) +
      note('You can change the password in your account settings after signing in.')
    : '';
  const loginText = password
    ? `\n\nYour sign-in details\nEmail: ${to}\nPassword: ${password}\nYou can change the password in your account settings after signing in.`
    : '';

  return {
    to,
    subject: `Your MotoPhD course is ready: ${courseTitle}`,
    text: `Thanks for your purchase!\n\nCourse: ${courseTitle}\nPlan: ${plan}${loginText}\n\nStart learning: ${dashboardUrl}${signatureText()}`,
    html: emailLayout(
      heading('Your course is ready') +
        paragraph('Thanks for your purchase!') +
        details([
          ['Course', courseTitle],
          ['Plan', plan]
        ]) +
        loginHtml +
        button(dashboardUrl, 'Start learning')
    )
  };
};

export const createFeedbackInstructionsEmail = ({ to }: { to: string }): EmailMessage => {
  const contactUrl = process.env.FEEDBACK_CONTACT_URL?.trim();

  if (!contactUrl) {
    // Оплаченный тариф без канала связи — инцидент: иначе покупатель за €129
    // не может забрать услугу.
    console.error('FEEDBACK_CONTACT_URL is not set; feedback email falls back to replies:', to);
  }

  const stepOneHtml = contactUrl
    ? 'Message us using the button below.'
    : `Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.`;
  const stepOneText = contactUrl
    ? `Message us: ${contactUrl}`
    : `Reply to this email or write to ${SUPPORT_EMAIL}`;

  return {
    to,
    subject: 'How to get your riding feedback',
    text: `Your plan includes 1 video review and 1 Zoom call (45 minutes).\n\n1. ${stepOneText}\n2. Send a video of your riding and tell us what you want to improve.${signatureText()}`,
    html: emailLayout(
      heading('How to get your feedback') +
        paragraph(
          'Your plan includes <strong>1 video review</strong> and <strong>1 Zoom call (45 minutes)</strong>.'
        ) +
        `<ol style="margin:0 0 16px;padding-left:20px"><li style="margin-bottom:8px">${stepOneHtml}</li><li>Send a video of your riding and tell us what you want to improve.</li></ol>` +
        (contactUrl ? button(contactUrl, 'Message us') : '')
    )
  };
};

export const createPasswordResetEmail = ({
  resetUrl,
  to
}: {
  resetUrl: string;
  to: string;
}): EmailMessage => ({
  to,
  subject: 'Reset your MotoPhD password',
  text: `Set a new password here:\n${resetUrl}\n\nThe link is valid for ${RESET_LINK_TTL}. If you didn't ask for this, ignore this email.${signatureText()}`,
  html: emailLayout(
    heading('Reset your password') +
      paragraph('Use the button below to set a new password.') +
      button(resetUrl, 'Set a new password') +
      note(
        `The link is valid for ${RESET_LINK_TTL}. If you didn't ask for this, ignore this email.<br>Button not working? Open this link: ${escapeHtml(resetUrl)}`
      )
  )
});
