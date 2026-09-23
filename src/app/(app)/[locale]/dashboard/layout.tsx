import { connection } from 'next/server';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireUser } from '@/lib/auth';
import { getDashboardCourses } from '@/lib/data';
import { requireLocale } from '@/i18n/requireLocale';

export const dynamic = 'force-dynamic';

// Общая оболочка кабинета: сайдбар с пользователем и навигацией живёт здесь,
// чтобы не перерисовываться при переходах между экранами кабинета.
export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await connection();

  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const user = await requireUser(
    `/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/dashboard`)}`
  );
  const courses = await getDashboardCourses(safeLocale, user);

  return (
    <DashboardShell
      courseCount={courses.length}
      displayName={user.name || user.email}
      email={user.email}
      locale={safeLocale}
    >
      {children}
    </DashboardShell>
  );
}
