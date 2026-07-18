'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { localizedCourses, prototypeContent } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import { cx } from '@/lib/classNames';
import { CoursesPanel, DownloadsPanel, OverviewPanel, ProfilePanel } from './DashboardPanels';
import styles from './Dashboard.module.scss';

type DashboardTab = 'overview' | 'courses' | 'downloads' | 'profile';

export function DashboardClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const { email, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const content = prototypeContent[locale];
  const courses = localizedCourses[locale];

  function signOut() {
    logout();
    showToast(t('toast.logout'));
    setTimeout(() => router.push('/'), 600);
  }

  return (
    <main className={styles.dashboardLayout}>
      <aside className={styles.dashboardSidebar}>
        <div className={styles.dashUser}>
          <div className={styles.dashAvatar}>D</div>
          <div className={styles.dashName}>{content.dashboard.studentName}</div>
          <div className={styles.dashEmail}>{email}</div>
        </div>
        <nav className={styles.dashNav}>
          {[
            ['overview', '🏠', t('dashboard.overview')],
            ['courses', '📚', t('dashboard.myCourses')],
            ['downloads', '📄', t('dashboard.downloads')],
            ['profile', '👤', t('dashboard.profile')]
          ].map(([id, icon, label]) => (
            <button
              className={cx(styles.dashNavItem, tab === id && styles.dashNavItemActive)}
              key={id}
              onClick={() => setTab(id as DashboardTab)}
              type="button"
            >
              <span className={styles.dashNavIcon}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.dashSidebarFooter}>
          <Link className={styles.dashSidebarLink} href="/">
            ← {t('actions.backToWebsite')}
          </Link>
          <button className={styles.dashSidebarLink} onClick={signOut} type="button">
            {t('actions.signOut')}
          </button>
        </div>
      </aside>
      <section className={styles.dashboardMain}>
        {tab === 'overview' ? <OverviewPanel content={content} courses={courses} email={email} /> : null}
        {tab === 'courses' ? <CoursesPanel content={content} courses={courses} email={email} /> : null}
        {tab === 'downloads' ? <DownloadsPanel content={content} courses={courses} email={email} /> : null}
        {tab === 'profile' ? <ProfilePanel content={content} courses={courses} email={email} /> : null}
      </section>
    </main>
  );
}
