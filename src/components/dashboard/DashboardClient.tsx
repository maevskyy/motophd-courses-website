'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { AppNavButton, AppShell, AppSidebar } from '@/components/app/AppShell';
import { Icon, type IconName } from '@/components/ui/Icon';
import { logoutAction } from '@/lib/auth/actions';
import type { CourseCardCourse, DashboardContent, PurchaseHistoryItem } from '@/lib/data';
import { CoursesPanel, DownloadsPanel, OverviewPanel, ProfilePanel } from './DashboardPanels';
import styles from './Dashboard.module.scss';

type DashboardTab = 'overview' | 'courses' | 'downloads' | 'profile';

const tabs: Array<[DashboardTab, IconName, string]> = [
  ['overview', 'grid', 'dashboard.overview'],
  ['courses', 'library', 'dashboard.myCourses'],
  ['downloads', 'document', 'dashboard.downloads'],
  ['profile', 'user', 'dashboard.profile']
];

interface Props {
  availableCourses: CourseCardCourse[];
  content: DashboardContent;
  courses: CourseCardCourse[];
  // displayName — что показываем в шапке (имя либо email), name — что лежит в
  // поле профиля (пустое, пока человек его не заполнил).
  displayName: string;
  email: string;
  feedbackUpgradeSlugs: string[];
  locale: 'en' | 'ru';
  name: string;
  purchases: PurchaseHistoryItem[];
}

// Кабинет — как в main: четыре вкладки (обзор, курсы, материалы, профиль) на
// общей оболочке AppShell с сайдбаром.
export function DashboardClient({
  content,
  courses,
  displayName,
  email,
  feedbackUpgradeSlugs,
  locale,
  name,
  availableCourses,
  purchases
}: Props) {
  const t = useTranslations();
  const [tab, setTab] = useState<DashboardTab>('overview');

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
          {tabs.map(([id, icon, label]) => (
            <AppNavButton active={tab === id} icon={icon} key={id} onClick={() => setTab(id)}>
              {t(label)}
            </AppNavButton>
          ))}
        </AppSidebar>
      }
    >
      <div className={styles.dashboardMain}>
        {tab === 'overview' ? (
          <OverviewPanel
            content={content}
            courses={courses}
            email={email}
            feedbackUpgradeSlugs={feedbackUpgradeSlugs}
            name={displayName}
          />
        ) : null}
        {tab === 'courses' ? (
          <CoursesPanel
            availableCourses={availableCourses}
            content={content}
            courses={courses}
            email={email}
            feedbackUpgradeSlugs={feedbackUpgradeSlugs}
            name={displayName}
          />
        ) : null}
        {tab === 'downloads' ? (
          <DownloadsPanel content={content} courses={courses} email={email} name={displayName} />
        ) : null}
        {tab === 'profile' ? (
          <ProfilePanel
            content={content}
            courses={courses}
            email={email}
            name={name}
            purchases={purchases}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
