'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { localizedCourses, prototypeContent } from '@/lib/content/prototype';
import type { Locale } from '@/i18n/routing';
import { cx } from '@/lib/classNames';
import styles from '@/components/prototype/Prototype.module.scss';

type DashboardTab = 'overview' | 'courses' | 'downloads' | 'profile';

export default function DashboardPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const { email, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const content = prototypeContent[locale];
  const courses = localizedCourses[locale];
  const purchasedCourse = courses[0];

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
        {tab === 'overview' ? (
          <>
            <div className={styles.dashGreeting}>
              <h2>{t('dashboard.welcomeTitle')} 👋</h2>
              <p>{t('dashboard.welcomeSub')}</p>
            </div>
            <div className={styles.dashStats}>
              <DashStat label={t('dashboard.coursePurchased')} value="1" />
              <DashStat label={t('dashboard.courseProgress')} suffix="%" value="40" />
              <DashStat label={t('dashboard.pdfsAvailable')} value="2" />
            </div>
            <div className={styles.dashSectionTitle}>{t('dashboard.myCourses')}</div>
            <div className={styles.dashCourses}>
              <PurchasedDashCourse courseTitle={purchasedCourse.title} />
              {courses.slice(1).map((course) => (
                <LockedDashCourse course={course} key={course.slug} />
              ))}
            </div>
          </>
        ) : null}

        {tab === 'courses' ? (
          <>
            <div className={styles.dashGreeting}>
              <h2>{t('dashboard.myCourses')}</h2>
              <p>{t('dashboard.purchasedContent')}</p>
            </div>
            <div className={styles.dashSectionTitle}>{t('dashboard.activeEnrollments')}</div>
            <div className={styles.dashCourses}>
              <PurchasedDashCourse courseTitle={purchasedCourse.title} compact />
            </div>
            <div className={styles.dashSectionTitle}>{t('dashboard.availableToPurchase')}</div>
            <div className={styles.dashCourses}>
              {courses.slice(1).map((course) => (
                <LockedDashCourse course={course} key={course.slug} />
              ))}
            </div>
          </>
        ) : null}

        {tab === 'downloads' ? (
          <>
            <div className={styles.dashGreeting}>
              <h2>{t('dashboard.downloads')}</h2>
              <p>{t('dashboard.downloadsSub')}</p>
            </div>
            <div className={styles.dashSectionTitle}>{t('dashboard.availablePdfs')}</div>
            {content.dashboard.downloads.map((download) => (
              <button
                className={styles.pdfDownloadCard}
                key={download.name}
                onClick={() => showToast(t('toast.pdfDownloaded', { name: download.name }))}
                type="button"
              >
                <div className={styles.pdfIcon}>📄</div>
                <div className={styles.pdfInfo}>
                  <div className={styles.pdfName}>{download.name}</div>
                  <div className={styles.pdfSize}>{download.size}</div>
                </div>
                <span className={styles.pdfBtn}>{t('actions.download')}</span>
              </button>
            ))}
            <div className={styles.notice}>🔒 {t('dashboard.morePdfs')}</div>
          </>
        ) : null}

        {tab === 'profile' ? (
          <>
            <div className={styles.dashGreeting}>
              <h2>{t('dashboard.profileSettings')}</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="profile-name">
                  {t('dashboard.fullName')}
                </label>
                <input className={styles.formInput} id="profile-name" defaultValue="Demo Student" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="profile-email">
                  {t('login.email')}
                </label>
                <input className={styles.formInput} id="profile-email" defaultValue={email} type="email" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="profile-password">
                  {t('dashboard.newPassword')}
                </label>
                <input
                  className={styles.formInput}
                  id="profile-password"
                  placeholder={t('dashboard.keepPassword')}
                  type="password"
                />
              </div>
              <button className={styles.button} onClick={() => showToast(t('toast.profileSaved'))} type="button">
                {t('actions.saveChanges')}
              </button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function DashStat({ label, suffix = '', value }: { label: string; suffix?: string; value: string }) {
  return (
    <div className={styles.dashStat}>
      <div className={styles.dashStatNum}>
        <span className={styles.red}>{value}</span>
        {suffix}
      </div>
      <div className={styles.dashStatLabel}>{label}</div>
    </div>
  );
}

function PurchasedDashCourse({ compact, courseTitle }: { compact?: boolean; courseTitle: string }) {
  const t = useTranslations();

  return (
    <Link className={styles.dashCourseCard} href="/learn/lean">
      <div className={`${styles.dashCourseThumb} ${styles.dashCourseThumbRed}`}>🏍️</div>
      <div className={styles.dashCourseBody}>
        <div className={styles.dashCourseTitle}>{courseTitle}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
        <div className={styles.dashCourseMeta}>
          <span>{t('dashboard.moduleProgress')}</span>
          <span>{compact ? '40%' : t('dashboard.percentComplete')}</span>
        </div>
        <div className={styles.dashCourseAction}>
          <span className={styles.btnContinue}>
            {compact ? t('actions.continue') : t('actions.continueLearning')} →
          </span>
        </div>
      </div>
    </Link>
  );
}

function LockedDashCourse({ course }: { course: { icon: string; imageTone: string; title: string } }) {
  const t = useTranslations();

  return (
    <Link className={`${styles.dashCourseCard} ${styles.dashCourseCardLocked}`} href="/courses/lean">
      <div
        className={cx(
          styles.dashCourseThumb,
          course.imageTone === 'green' && styles.dashCourseThumbGreen,
          course.imageTone === 'blue' && styles.dashCourseThumbBlue
        )}
      >
        {course.icon}
        <div className={styles.dashLockOverlay}>🔒</div>
      </div>
      <div className={styles.dashCourseBody}>
        <div className={styles.dashCourseTitle}>{course.title}</div>
        <div className={styles.dashCourseMeta}>
          <span>{t('dashboard.notPurchased')}</span>
        </div>
        <div className={styles.dashCourseAction}>
          <span className={styles.btnUnlock}>{t('actions.unlockCourse')} — €29</span>
        </div>
      </div>
    </Link>
  );
}
