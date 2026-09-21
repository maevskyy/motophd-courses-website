import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './PlayerSidebar.module.scss';

interface Props {
  active: boolean;
  done: boolean;
  href: string;
  label: string;
  // У урока есть PDF — показываем иконку документа.
  pdf: boolean;
}

export function SidebarLessonLink({ active, done, href, label, pdf }: Props) {
  const t = useTranslations('player');

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cx(styles.lesson, active && styles.lessonActive)}
      href={href}
    >
      <span className={cx(styles.lessonMark, done && styles.lessonMarkDone)}>
        {done ? (
          <Icon name="check" size={12} title={t('lessonDone')} />
        ) : active ? (
          <Icon name="play" size={10} />
        ) : null}
      </span>
      <span className={styles.lessonLabel}>{label}</span>
      {pdf ? <Icon className={styles.lessonDoc} name="document" size={16} title={t('pdf')} /> : null}
    </Link>
  );
}
