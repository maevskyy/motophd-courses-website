'use client';

import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './AppShell.module.scss';

export interface AppNavButtonProps {
  active: boolean;
  children: React.ReactNode;
  icon?: IconName;
  onClick: () => void;
}

// Пункт навигации-вкладка (без смены адреса): тот же вид, что у AppNavLink,
// но <button> с aria-current для активной вкладки.
export function AppNavButton({ active, children, icon, onClick }: AppNavButtonProps) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      className={cx(styles.navItem, active && styles.navItemActive)}
      onClick={onClick}
      type="button"
    >
      {icon ? <Icon className={styles.navIcon} name={icon} size={18} /> : null}
      <span>{children}</span>
    </button>
  );
}
