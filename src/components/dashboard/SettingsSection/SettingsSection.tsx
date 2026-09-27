import { useId } from 'react';
import styles from './SettingsSection.module.scss';

interface Props {
  children: React.ReactNode;
  description?: string;
  title: string;
}

// Секция настроек: заголовок h2, подпись, тело. Ширину колонки задаёт только
// она — формы внутри собственных ограничений не имеют.
export function SettingsSection({ children, description, title }: Props) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <div className={styles.section__header}>
        <h2 className={styles.section__title} id={titleId}>
          {title}
        </h2>
        {description ? <p className={styles.section__description}>{description}</p> : null}
      </div>
      <div className={styles.section__body}>{children}</div>
    </section>
  );
}
