import { cx } from '@/lib/classNames';
import styles from './Section.module.scss';

/*
  Один компонент секции и один компонент её шапки на весь сайт.
  Вертикальный ритм, контейнер и порядок «метка → заголовок → пояснение»
  задаются здесь, а не переписываются в каждом блоке.
*/

interface SectionProps {
  children: React.ReactNode;
  /** base — фон страницы, alt — приглушённая поверхность для чередования. */
  tone?: 'base' | 'alt';
  bordered?: boolean;
  id?: string;
  className?: string;
}

export function Section({ bordered = false, children, className, id, tone = 'base' }: SectionProps) {
  return (
    <section
      className={cx(styles.section, tone === 'alt' && styles.toneAlt, bordered && styles.bordered, className)}
      id={id}
    >
      <div className={styles.container}>{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  kicker?: string;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'start' | 'center';
  /** По умолчанию h2: h1 на странице должен быть один. */
  as?: 'h1' | 'h2';
}

export function SectionHeader({ align = 'start', as: Heading = 'h2', kicker, lead, title }: SectionHeaderProps) {
  return (
    <div className={cx(styles.header, align === 'center' && styles.headerCenter)}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      {title ? <Heading className={styles.title}>{title}</Heading> : null}
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  );
}

export { styles as sectionStyles };
