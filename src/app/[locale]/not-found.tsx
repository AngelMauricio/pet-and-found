import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BackButton } from '@/components/ui/BackButtons';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="bg-sand-100 p-6 rounded-full mb-8">
        {/* Um ícone de pegada ou algo temático */}
        <span className="text-6xl">🐾</span>
      </div>

      <h1 className="text-4xl font-bold text-brand-primary mb-4">
        {t('title')}
      </h1>

      <p className="text-brand-secondary text-lg mb-10 max-w-md">
        {t('description')}
      </p>

      <BackButton label={t('backHome')} />
    </div>
  );
}