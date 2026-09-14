'use client';

import { Link, usePathname } from '@/i18n/routing';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './AppShell.module.scss';

export interface AppNavLinkProps {
  children: React.ReactNode;
  /** Путь без локали — как у `usePathname`. */
  href: string;
  icon?: IconName;
}

export function AppNavLink({ children, href, icon }: AppNavLinkProps) {
  const active = usePathname() === href;

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cx(styles.navItem, active && styles.navItemActive)}
      href={href}
    >
      {icon ? <Icon className={styles.navIcon} name={icon} size={18} /> : null}
      <span>{children}</span>
    </Link>
  );
}
