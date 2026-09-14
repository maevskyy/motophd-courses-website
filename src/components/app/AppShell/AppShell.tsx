import styles from './AppShell.module.scss';

export interface AppShellProps {
  /** Рабочая область: сама страница задаёт свои отступы и ширину. */
  children: React.ReactNode;
  /** Левая колонка — обычно `<AppSidebar>`. */
  sidebar: React.ReactNode;
}

export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {sidebar}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
