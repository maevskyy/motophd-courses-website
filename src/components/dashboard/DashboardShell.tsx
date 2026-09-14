import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AppNavLink, AppShell, AppSidebar } from '@/components/app/AppShell';
import { Icon } from '@/components/ui/Icon';
import { logoutAction } from '@/lib/auth/actions';
import type { AppLocale } from '@/lib/data';
import styles from './Dashboard.module.scss';

interface DashboardShellProps {
  children: React.ReactNode;
  /** Сколько курсов куплено: от этого зависит подпись «Мой курс» / «Мои курсы». */
  courseCount: number;
  /** Что показываем в шапке сайдбара: имя либо email. */
  displayName: string;
  email: string;
  locale: AppLocale;
}

export function DashboardShell({
  children,
  courseCount,
  displayName,
  email,
  locale
}: DashboardShellProps) {
  const t = useTranslations();

  const header = (
    <>
      <div className={styles.dashAvatar}>{displayName.slice(0, 1).toUpperCase()}</div>
      <div className={styles.dashName}>{displayName}</div>
      <div className={styles.dashEmail}>{email}</div>
    </>
  );

  const footer = (
    <>
      <Link className={styles.dashSidebarLink} href="/">
        <Icon name="arrowLeft" size={16} />
        {t('actions.backToWebsite')}
      </Link>
      <form action={logoutAction}>
        <input name="locale" type="hidden" value={locale} />
        <button className={styles.dashSidebarLink} type="submit">
          {t('actions.signOut')}
        </button>
      </form>
    </>
  );

  return (
    <AppShell
      sidebar={
        <AppSidebar footer={footer} header={header} navLabel={t('nav.dashboard')}>
          <AppNavLink href="/dashboard" icon="library">
            {t(courseCount > 1 ? 'dashboard.myCourses' : 'dashboard.myCourse')}
          </AppNavLink>
          <AppNavLink href="/dashboard/settings" icon="user">
            {t('dashboard.settings')}
          </AppNavLink>
        </AppSidebar>
      }
    >
      <div className={styles.dashboardMain}>{children}</div>
    </AppShell>
  );
}
