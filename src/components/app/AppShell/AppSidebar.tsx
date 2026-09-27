import styles from './AppShell.module.scss';

export interface AppSidebarProps {
  /** Навигация — произвольное дерево (пункты кабинета, оглавление курса). */
  children: React.ReactNode;
  /** Низ колонки: «На сайт», «Выйти», прогресс курса. */
  footer?: React.ReactNode;
  /** Верх колонки: блок пользователя либо ссылка «← Мой курс» с названием. */
  header?: React.ReactNode;
  /** Подпись `<nav>` для скринридера — на странице есть ещё шапка сайта. */
  navLabel?: string;
}

export function AppSidebar({ children, footer, header, navLabel }: AppSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {header ? <div className={styles.header}>{header}</div> : null}
      <nav aria-label={navLabel} className={styles.nav}>
        {children}
      </nav>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </aside>
  );
}
