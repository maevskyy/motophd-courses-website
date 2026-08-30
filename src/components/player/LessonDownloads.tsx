import { useTranslations } from 'next-intl';

import type { PlayerContent } from '@/lib/data';
import styles from './CoursePlayer.module.scss';

interface Props {
  player: Pick<PlayerContent, 'downloads'>;
}

export function LessonDownloads({ player }: Props) {
  const t = useTranslations('player');

  if (player.downloads.length === 0) {
    return null;
  }

  return (
    <>
      {player.downloads.map((download) => (
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
            <div className={styles.pdfSize}>{t('pdfLinkDescription')}</div>
          </div>
          <span className={styles.pdfBtn}>{t('pdfLinkLabel')}</span>
        </a>
      ))}
    </>
  );
}
