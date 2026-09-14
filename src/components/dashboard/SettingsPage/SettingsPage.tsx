import { useTranslations } from 'next-intl';
import type { PurchaseHistoryItem } from '@/lib/data';
import { AccountProfileForm } from '@/components/dashboard/AccountProfileForm';
import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm';
import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection';
import { PurchaseHistory } from '@/components/dashboard/PurchaseHistory';
import { SettingsSection } from '@/components/dashboard/SettingsSection';
import { CourseTiers } from './CourseTiers';
import styles from './SettingsPage.module.scss';

interface Props {
  email: string;
  feedbackUpgradeSlugs: string[];
  name: string;
  purchases: PurchaseHistoryItem[];
}

// Экран «Настройки»: одна колонка, секции одной ширины в каноническом порядке
// Профиль → Безопасность → Тариф и покупки → Опасная зона.
export function SettingsPage({ email, feedbackUpgradeSlugs, name, purchases }: Props) {
  const t = useTranslations('dashboard');

  return (
    <div className={styles.settings}>
      <h1 className={styles.settings__title}>{t('settings')}</h1>
      <SettingsSection description={t('profileSub')} title={t('profile')}>
        <AccountProfileForm email={email} name={name} />
      </SettingsSection>
      <SettingsSection description={t('securitySub')} title={t('security')}>
        <ChangePasswordForm />
      </SettingsSection>
      <SettingsSection description={t('billingSub')} title={t('billing')}>
        <CourseTiers feedbackUpgradeSlugs={feedbackUpgradeSlugs} purchases={purchases} />
        <PurchaseHistory purchases={purchases} />
      </SettingsSection>
      <SettingsSection description={t('dangerZoneSub')} title={t('dangerZone')}>
        <DeleteAccountSection />
      </SettingsSection>
    </div>
  );
}
