'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { logoutAction } from '@/lib/auth/actions';
import type { CourseCardCourse, DashboardContent, PurchaseHistoryItem } from '@/lib/data';
import { cx } from '@/lib/classNames';
import { CoursesPanel, DownloadsPanel, OverviewPanel, ProfilePanel } from './DashboardPanels';
import styles from './Dashboard.module.scss';

type DashboardTab = 'overview' | 'courses' | 'downloads' | 'profile';

export function DashboardClient({
  content,
  courses,
  displayName,
  email,
  locale,
  name,
  availableCourses,
  purchases
}: {
  availableCourses: CourseCardCourse[];
  content: DashboardContent;
  courses: CourseCardCourse[];
  // displayName — что показываем в шапке (имя либо email), name — что лежит в
  // поле профиля (пустое, пока человек его не заполнил).
  displayName: string;
  email: string;
  locale: 'en' | 'ru';
  name: string;
  purchases: PurchaseHistoryItem[];
}) {
  const t = useTranslations();
  const [tab, setTab] = useState<DashboardTab>('overview');

  return (
    <main className={styles.dashboardLayout}>
      <aside className={styles.dashboardSidebar}>
        <div className={styles.dashUser}>
          <div className={styles.dashAvatar}>{displayName.slice(0, 1).toUpperCase()}</div>
          <div className={styles.dashName}>{displayName}</div>
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
          <form action={logoutAction}>
            <input name="locale" type="hidden" value={locale} />
            <button className={styles.dashSidebarLink} type="submit">
              {t('actions.signOut')}
            </button>
          </form>
        </div>
      </aside>
      <section className={styles.dashboardMain}>
        {tab === 'overview' ? (
          <OverviewPanel content={content} courses={courses} email={email} name={displayName} />
        ) : null}
        {tab === 'courses' ? (
          <CoursesPanel
            availableCourses={availableCourses}
            content={content}
            courses={courses}
            email={email}
            name={displayName}
          />
        ) : null}
        {tab === 'downloads' ? (
          <DownloadsPanel content={content} courses={courses} email={email} name={displayName} />
        ) : null}
        {tab === 'profile' ? (
          <ProfilePanel content={content} courses={courses} email={email} name={name} purchases={purchases} />
        ) : null}
      </section>
    </main>
  );
}
