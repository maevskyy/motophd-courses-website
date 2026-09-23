import { connection } from 'next/server';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { getFeedbackUpgradeCourseSlugs } from '@/lib/access/feedbackUpgrade';
import { requireUser } from '@/lib/auth';
import { getPurchaseHistory } from '@/lib/data';
import { requireLocale } from '@/i18n/requireLocale';

export const dynamic = 'force-dynamic';

// Экран «Настройки»: профиль, безопасность, тариф и покупки, опасная зона.
export default async function DashboardSettingsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();

  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/dashboard/settings`)}`
  );
  const purchases = await getPurchaseHistory(safeLocale, user);
  const feedbackUpgradeSlugs = getFeedbackUpgradeCourseSlugs(purchases);

  // В форму профиля пустое имя, а не email: иначе первое же сохранение
  // записывало email покупателя в поле «Имя» навсегда.
  return (
    <SettingsPage
      email={user.email}
      feedbackUpgradeSlugs={feedbackUpgradeSlugs}
      name={user.name || ''}
      purchases={purchases}
    />
  );
}
