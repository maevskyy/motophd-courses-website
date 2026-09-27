import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { lessonHref, type ProgressSummary } from '@/lib/progress';
import type { MyCourseData, MyCourseLesson } from './MyCourse.types';
import styles from './MyCourse.module.scss';

export interface NextLesson {
  lesson: MyCourseLesson;
  // Номера для подписи кнопки: модуль по порядку и урок внутри модуля.
  lessonNumber: number;
  moduleNumber: number;
}

interface Props {
  course: MyCourseData;
  next?: NextLesson;
  // Пустой прогресс — «Начать курс», иначе «Продолжить: …».
  started: boolean;
  summary: ProgressSummary;
}

export function ResumeCard({ course, next, started, summary }: Props) {
  const t = useTranslations('dashboard');
  const href = next ? lessonHref(course.slug, next.lesson) : undefined;
  const minutesLeft = Math.ceil(summary.remainingSec / 60);
  const lessonsLine = t('lessonsDone', { done: summary.done, total: summary.total });

  return (
    <article className={styles.resume}>
      <div className={styles.resume__cover}>
        <Icon name={course.icon} size={40} />
      </div>
      <div className={styles.resume__body}>
        <h2 className={styles.resume__title} id={`course-${course.slug}`}>
          {href ? (
            <Link className={styles.resume__titleLink} href={href}>
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </h2>
        <progress
          aria-label={lessonsLine}
          className={styles.resume__bar}
          max={Math.max(summary.total, 1)}
          value={summary.done}
        />
        <p className={styles.resume__meta}>
          {lessonsLine}
          {minutesLeft > 0 ? ` · ${t('timeLeft', { minutes: minutesLeft })}` : null}
        </p>
        {href && next ? (
          <Link className={styles.resume__cta} href={href}>
            {started
              ? t('resumeLesson', {
                  lesson: next.lessonNumber,
                  module: next.moduleNumber,
                  title: next.lesson.title
                })
              : t('startCourse')}
            <Icon name="arrowRight" size={16} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
