import { Resend } from 'resend';
import type { EmailMessage } from './types';

export type SendEmailResult = { status: 'sent' | 'skipped' | 'failed' };

export const sendEmail = async (message: EmailMessage): Promise<SendEmailResult> => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    // Тело письма не логируем: там пароль открытым текстом и ссылка сброса,
    // а stdout контейнера уезжает в Loki на недели.
    const summary = `to=${message.to} subject=${message.subject}`;

    if (process.env.NODE_ENV === 'production') {
      console.error('Email delivery is not configured; email was NOT sent:', summary);
    } else {
      console.log('Email delivery is disabled; outgoing email:', summary);
    }

    return { status: 'skipped' };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      html: message.html,
      subject: message.subject,
      text: message.text,
      to: message.to
    });

    if (error) {
      // Письмо не должно ронять вызывающий поток: вебхук оплаты обязан
      // ответить провайдеру 200, иначе тот ретраит уже оплаченный заказ.
      console.error('Email delivery failed:', message.to, error.message);
      return { status: 'failed' };
    }
  } catch (error) {
    console.error('Email delivery threw:', message.to, error);
    return { status: 'failed' };
  }

  return { status: 'sent' };
};
