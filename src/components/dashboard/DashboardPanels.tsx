import { useTranslations } from 'next-intl';
import { useToast } from '@/components/providers/ToastProvider';
import type { Course, PrototypeContent } from '@/lib/content';
import { DashStat, LockedDashCourse, PurchasedDashCourse } from './DashboardCards';
import styles from './Dashboard.module.scss';

interface PanelProps {
  content: PrototypeContent;
  courses: Course[];
  email: string;
}

export function OverviewPanel({ courses }: PanelProps) {
  const t = useTranslations();
  const purchasedCourse = courses[0];

  return (
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
  );
}

export function CoursesPanel({ courses }: PanelProps) {
  const t = useTranslations();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2>{t('dashboard.myCourses')}</h2>
        <p>{t('dashboard.purchasedContent')}</p>
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.activeEnrollments')}</div>
      <div className={styles.dashCourses}>
        <PurchasedDashCourse compact courseTitle={courses[0].title} />
      </div>
      <div className={styles.dashSectionTitle}>{t('dashboard.availableToPurchase')}</div>
      <div className={styles.dashCourses}>
        {courses.slice(1).map((course) => (
          <LockedDashCourse course={course} key={course.slug} />
        ))}
      </div>
    </>
  );
}

export function DownloadsPanel({ content }: PanelProps) {
  const t = useTranslations();
  const { showToast } = useToast();

  return (
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
  );
}

export function ProfilePanel({ email }: PanelProps) {
  const t = useTranslations();
  const { showToast } = useToast();

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2>{t('dashboard.profileSettings')}</h2>
      </div>
      <div className={styles.formGrid}>
        <Field defaultValue="Demo Student" id="profile-name" label={t('dashboard.fullName')} />
        <Field defaultValue={email} id="profile-email" label={t('login.email')} type="email" />
        <Field id="profile-password" label={t('dashboard.newPassword')} placeholder={t('dashboard.keepPassword')} type="password" />
        <button className={styles.button} onClick={() => showToast(t('toast.profileSaved'))} type="button">
          {t('actions.saveChanges')}
        </button>
      </div>
    </>
  );
}

function Field({
  defaultValue,
  id,
  label,
  placeholder,
  type
}: {
  defaultValue?: string;
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel} htmlFor={id}>
        {label}
      </label>
      <input
        className={styles.formInput}
        defaultValue={defaultValue}
        id={id}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}
