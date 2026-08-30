import { Resend } from 'resend';
import type { EmailMessage } from './types';

export const sendEmail = async (message: EmailMessage) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log('Email delivery is disabled; outgoing email:', message);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: message.to
  });

  if (error) {
    throw new Error(error.message);
  }
};
