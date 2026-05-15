import { useTranslations } from 'next-intl';
import { ProfileSettingsSection } from '@/components/auth/ProfileSettingsSection';
import { DeleteAccountSection } from '@/components/auth/DeleteAccountSection';

export default function SettingsPage() {
  const t = useTranslations('Settings');

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      <h1 className="text-3xl font-bold text-brand-primary">{t('title')}</h1>
      <ProfileSettingsSection />
      <DeleteAccountSection />
    </div>
  );
}