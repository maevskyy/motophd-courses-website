import { redirect } from 'next/navigation';
import { FeedbackContent } from '@/components/feedback/FeedbackContent';
import { hasFeedbackAccess } from '@/lib/access/hasFeedbackAccess';
import { requireUser } from '@/lib/auth';
import { toAppLocale } from '@/lib/data';
import { getPayloadClient } from '@/lib/data/payload';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = toAppLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/feedback`)}`
  );
  const payload = await getPayloadClient();

  if (!(await hasFeedbackAccess(payload, user))) {
    redirect(`/${safeLocale}/dashboard`);
  }

  // Ссылка на чат — env сервера; в клиент уезжает готовым пропом.
  return <FeedbackContent contactUrl={process.env.FEEDBACK_CONTACT_URL?.trim() || null} />;
}
