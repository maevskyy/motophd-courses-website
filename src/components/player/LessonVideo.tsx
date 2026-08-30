import { useTranslations } from 'next-intl';

import type { PlayerContent } from '@/lib/data';
import styles from './CoursePlayer.module.scss';

interface Props {
  player: Pick<PlayerContent, 'title' | 'videoEmbedUrl'>;
}

export function LessonVideo({ player }: Props) {
  const t = useTranslations('player');

  if (!player.videoEmbedUrl) {
    return (
      <div className={styles.videoPlaceholder}>
        <p>{t('videoUnavailable')}</p>
        <p className={styles.videoMetaSmall}>{t('refreshAfterTokenExpiry')}</p>
      </div>
    );
  }

  return (
    <iframe
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
      allowFullScreen
      className={styles.videoFrame}
      src={player.videoEmbedUrl}
      title={player.title}
    />
  );
}
