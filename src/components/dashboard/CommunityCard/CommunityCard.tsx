import { useTranslations } from 'next-intl';

import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/locales';
import { communityLinks } from '@/lib/community';
import styles from './CommunityCard.module.scss';

interface Props {
  locale: Locale;
}

// Сообщество студентов. Страница кабинета показывает карточку только тем,
// у кого есть хотя бы один купленный курс.
export function CommunityCard({ locale }: Props) {
  const t = useTranslations('dashboard');
  const community = communityLinks[locale];

  return (
    <article className={styles.community}>
      <div className={styles.community__body}>
        <h2 className={styles.community__title}>{t('communityTitle')}</h2>
        <p className={styles.community__text}>{t('communityText')}</p>
      </div>
      <a
        className={styles.community__link}
        href={community.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {t('communityJoin', { platform: community.platform })}
        <Icon name="arrowRight" size={16} />
      </a>
    </article>
  );
}
