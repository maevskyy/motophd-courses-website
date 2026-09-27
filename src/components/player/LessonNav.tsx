import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import type { PlayerLesson } from '@/lib/data';
import { lessonHref } from '@/lib/progress';
import styles from './LessonContent.module.scss';

interface Props {
  courseSlug: string;
  hasNext: boolean;
  onComplete: () => void;
  prev?: PlayerLesson;
}

export function LessonNav({ courseSlug, hasNext, onComplete, prev }: Props) {
  const t = useTranslations('player');
  const prevLabel = (
    <>
      <Icon name="arrowLeft" size={16} />
      {t('prevLesson')}
    </>
  );

  return (
    <nav aria-label={t('lessonNav')} className={styles.lessonNav}>
      {prev ? (
        <Link className={styles.navPrev} href={lessonHref(courseSlug, prev)}>
          {prevLabel}
        </Link>
      ) : (
        <span aria-disabled="true" className={styles.navPrev}>
          {prevLabel}
        </span>
      )}
      <button className={styles.navNext} onClick={onComplete} type="button">
        {hasNext ? (
          <>
            {t('completeAndContinue')}
            <Icon name="arrowRight" size={16} />
          </>
        ) : (
          t('finishCourse')
        )}
      </button>
    </nav>
  );
}
