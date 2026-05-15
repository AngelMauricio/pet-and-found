import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export const Header = () => {
    const t = useTranslations('Header');

    return (
        <header className="w-full py-4 px-6 bg-white border-b border-sand-200 shadow-sm">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-brand-primary">
                    {t('title-1')} <span className="text-sand-600">{t('title-2')}</span>
                </Link>

                <div className="space-x-6 flex items-center text-sm font-medium">
                    <Link href="/map" className="text-brand-secondary hover:text-sand-700 transition-colors">
                        {t('browse-map')}
                    </Link>
                    <Link href="/login" className="text-brand-primary hover:text-sand-600 transition-colors">
                        {t('Sign In')}
                    </Link>
                    <Link href="/register" className="px-5 py-2 bg-sand-400 text-brand-primary rounded-full hover:bg-sand-500 transition-all shadow-sm">
                        {t('Register')}
                    </Link>
                </div>
            </nav>
        </header>
    );
};