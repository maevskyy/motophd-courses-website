import { useTranslations } from 'next-intl';

import type { PlayerContent } from '@/lib/data';
import styles from './CoursePlayer.module.scss';

interface Props {
  player: Pick<PlayerContent, 'pdfUrl' | 'title'>;
}

export function LessonDownloads({ player }: Props) {
  const t = useTranslations('player');

  if (!player.pdfUrl) {
    return null;
  }

  return (
    <a className={styles.pdfDownloadCard} href={player.pdfUrl}>
      <div className={styles.pdfIcon}>📄</div>
      <div className={styles.pdfInfo}>
        <div className={styles.pdfName}>{player.title}</div>
        <div className={styles.pdfSize}>{t('pdfLinkDescription')}</div>
      </div>
      <span className={styles.pdfBtn}>{t('pdfLinkLabel')}</span>
    </a>
  );
}
