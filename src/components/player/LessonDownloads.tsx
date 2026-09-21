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
    <a className={styles.pdfDownloadCard} href={download.url} rel="noopener" target="_blank">
      <Icon name="document" size={18} />
      {t('pdfLinkLabel')}
    </a>
  );
}
