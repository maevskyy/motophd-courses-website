import { useTranslations } from 'next-intl';
import { useToast } from '@/components/providers/ToastProvider';
import type { CourseCardCourse, DashboardContent } from '@/lib/data';
import { AccountProfileForm } from './AccountProfileForm';
import { DashStat, LockedDashCourse, PurchasedDashCourse } from './DashboardCards';
import styles from './Dashboard.module.scss';

interface PanelProps {
  availableCourses?: CourseCardCourse[];
  content: DashboardContent;
  courses: CourseCardCourse[];
  email: string;
  name: string;
}

export function OverviewPanel({ courses, name }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2>{t('dashboard.welcomeTitle', { name })} 👋</h2>
        <p>{t('dashboard.welcomeSub')}</p>
      </div>
      <div className={styles.dashStats}>
        <DashStat label={t('dashboard.purchasedCourses')} value={String(courses.length)} />
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.myCourses')}</div>
      <div className={styles.dashCourses}>
        {courses.map((course) => (
          <PurchasedDashCourse course={course} key={course.slug} />
        ))}
      </div>
    </>
  );
}

export function CoursesPanel({ availableCourses = [], courses }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2>{t('dashboard.myCourses')}</h2>
        <p>{t('dashboard.purchasedContent')}</p>
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.activeEnrollments')}</div>
      <div className={styles.dashCourses}>
        {courses.map((course) => (
          <PurchasedDashCourse course={course} key={course.slug} />
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
        <h2>{t('dashboard.downloads')}</h2>
        <p>{t('dashboard.downloadsSub')}</p>
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
          <div aria-hidden className={styles.pdfIcon}>
            📄
          </div>
          <div className={styles.pdfInfo}>
            <div className={styles.pdfName}>{download.title}</div>
          </div>
          <span className={styles.pdfBtn}>{t('actions.download')}</span>
        </a>
      ))}
    </>
  );
}

export function ProfilePanel({ email, name }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2>{t('dashboard.profileSettings')}</h2>
      </div>
      <AccountProfileForm email={email} name={name} />
    </>
  );
}
