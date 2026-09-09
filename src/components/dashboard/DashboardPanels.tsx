import { useTranslations } from 'next-intl';
import type { CourseCardCourse, DashboardContent, PurchaseHistoryItem } from '@/lib/data';
import { AccountProfileForm } from './AccountProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { DeleteAccountSection } from './DeleteAccountSection';
import { PurchaseHistory } from './PurchaseHistory';
import { Icon } from '@/components/ui/Icon';
import { DashStat, LockedDashCourse, PurchasedDashCourse } from './DashboardCards';
import styles from './Dashboard.module.scss';

interface PanelProps {
  availableCourses?: CourseCardCourse[];
  content: DashboardContent;
  courses: CourseCardCourse[];
  email: string;
  // Slug'и курсов, у которых можно докупить обратную связь — считает сервер.
  feedbackUpgradeSlugs?: string[];
  name: string;
  purchases?: PurchaseHistoryItem[];
}

export function OverviewPanel({ courses, feedbackUpgradeSlugs = [], name }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h1 className={styles.dashGreetingTitle}>{t('dashboard.welcomeTitle', { name })}</h1>
        <p className={styles.dashGreetingText}>{t('dashboard.welcomeSub')}</p>
      </div>
      <div className={styles.dashStats}>
        <DashStat label={t('dashboard.purchasedCourses')} value={String(courses.length)} />
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.myCourses')}</div>
      <div className={styles.dashCourses}>
        {courses.map((course) => (
          <PurchasedDashCourse
            course={course}
            feedbackUpgrade={feedbackUpgradeSlugs.includes(course.slug)}
            key={course.slug}
          />
        ))}
      </div>
    </>
  );
}

export function CoursesPanel({ availableCourses = [], courses, feedbackUpgradeSlugs = [] }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h1 className={styles.dashGreetingTitle}>{t('dashboard.myCourses')}</h1>
        <p className={styles.dashGreetingText}>{t('dashboard.purchasedContent')}</p>
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.activeEnrollments')}</div>
      <div className={styles.dashCourses}>
        {courses.map((course) => (
          <PurchasedDashCourse
            course={course}
            feedbackUpgrade={feedbackUpgradeSlugs.includes(course.slug)}
            key={course.slug}
          />
        ))}
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.availableToPurchase')}</div>
      <div className={styles.dashCourses}>
        {availableCourses.map((course) => (
          <LockedDashCourse course={course} key={course.slug} />
        ))}
      </div>
    </>
  );
}

export function DownloadsPanel({ content }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h1 className={styles.dashGreetingTitle}>{t('dashboard.downloads')}</h1>
        <p className={styles.dashGreetingText}>{t('dashboard.downloadsSub')}</p>
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.availablePdfs')}</div>
      {content.dashboard.downloads.map((download) => (
        <a
          className={styles.pdfDownloadCard}
          href={download.url}
          key={download.id}
          rel="noopener"
          target="_blank"
        >
          <span className={styles.pdfIcon}>
            <Icon name="document" size={22} />
          </span>
          <div className={styles.pdfInfo}>
            <div className={styles.pdfName}>{download.title}</div>
          </div>
          <span className={styles.pdfBtn}>{t('actions.download')}</span>
        </a>
      ))}
    </>
  );
}

export function ProfilePanel({ email, name, purchases = [] }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h1 className={styles.dashGreetingTitle}>{t('dashboard.profileSettings')}</h1>
      </div>
      <AccountProfileForm email={email} name={name} />
      <ChangePasswordForm />
      <PurchaseHistory purchases={purchases} />
      <DeleteAccountSection />
    </>
  );
}
