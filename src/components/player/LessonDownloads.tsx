import { useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/Icon';
import type { PlayerDownload } from '@/lib/data';
import styles from './LessonContent.module.scss';

interface Props {
  download: PlayerDownload | null;
}

// Только PDF текущего урока: подпись «PDF к уроку» и имя файла, не название урока.
export function LessonDownloads({ download }: Props) {
  const t = useTranslations('player');

  if (!download) {
    return null;
  }

  return (
    <section className={styles.materials}>
      <h2 className={styles.sectionTitle}>{t('downloads')}</h2>
      <a className={styles.pdfDownloadCard} href={download.url} rel="noopener" target="_blank">
        <span className={styles.pdfIcon}>
          <Icon name="document" size={22} />
        </span>
        <div className={styles.pdfInfo}>
          <div className={styles.pdfName}>{t('pdfForLesson')}</div>
          {download.fileName ? <div className={styles.pdfFile}>{download.fileName}</div> : null}
        </div>
        <span className={styles.pdfBtn}>{t('pdfLinkLabel')}</span>
      </a>
    </section>
  );
}
