import { useTranslations } from 'next-intl';

import type { PlayerLesson } from '@/lib/data';
import styles from './CoursePlayer.module.scss';

interface Props {
  lesson: Pick<PlayerLesson, 'title' | 'videoEmbedUrl'>;
}

export function LessonVideo({ lesson }: Props) {
  const t = useTranslations('player');

  if (!lesson.videoEmbedUrl) {
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
      src={lesson.videoEmbedUrl}
      title={lesson.title}
    />
  );
}
