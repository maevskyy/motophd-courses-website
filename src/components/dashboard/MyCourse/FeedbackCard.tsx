import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { FeedbackUpgradeButton } from '../FeedbackUpgradeButton';
import type { FeedbackStatus, MyCourseData } from './MyCourse.types';
import styles from './MyCourse.module.scss';

interface Props {
  course: Pick<MyCourseData, 'currency' | 'slug' | 'upgradePrice'>;
  // Якорь `#upgrade` из настроек — только у первой карточки на странице.
  id?: string;
  status: FeedbackStatus;
}

// Апсейл после основного действия: одна карточка на курс, после покупки
// становится статусом «Подключена» со ссылкой на отправку видео.
export function FeedbackCard({ course, id, status }: Props) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const price = new Intl.NumberFormat(locale, {
    currency: course.currency,
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(course.upgradePrice);

  return (
    <article className={styles.feedback} id={id}>
      <div className={styles.feedback__body}>
        <h3 className={styles.feedback__title}>{t('feedbackTitle')}</h3>
        <p className={styles.feedback__text}>{t('feedbackText')}</p>
        {status === 'upgrade' ? (
          <p className={styles.feedback__price}>{t('feedbackPrice', { price })}</p>
        ) : null}
      </div>
      <div className={styles.feedback__aside}>
        {status === 'upgrade' ? (
          <FeedbackUpgradeButton courseSlug={course.slug} />
        ) : (
          <>
            <span className={styles.feedback__status}>
              <Icon name="check" size={14} />
              {t('feedbackConnected')}
            </span>
            <Link className={styles.feedback__link} href="/feedback">
              {t('feedbackSend')}
              <Icon name="arrowRight" size={16} />
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
