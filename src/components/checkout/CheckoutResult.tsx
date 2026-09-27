import { Link } from '@/i18n/routing';
import loginStyles from '@/components/login/LoginPage.module.scss';

import styles from './CheckoutResult.module.scss';

// Экран после банка: та же карточка, что у входа, плюс одно действие —
// без него покупатель остаётся на пустой странице и не знает, куда идти.
export function CheckoutResult({
  action,
  description,
  title
}: {
  action: { href: string; label: string };
  description: string;
  title: string;
}) {
  return (
    <main className={loginStyles.loginPage}>
      <div className={loginStyles.loginCard}>
        <div className={loginStyles.loginLogo}>
          MOTO<span className={loginStyles.red}>PhD</span>
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={`${loginStyles.loginHint} ${styles.description}`}>{description}</p>
        <Link className={`${loginStyles.btnLogin} ${styles.action}`} href={action.href}>
          {action.label}
        </Link>
      </div>
    </main>
  );
}
