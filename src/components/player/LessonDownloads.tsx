import { useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/Icon';
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
          <span className={styles.pdfIcon}>
            <Icon name="document" size={22} />
          </span>
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
