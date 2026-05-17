import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-white border-t border-sand-200 py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
                <p className="text-brand-secondary">
                    © {new Date().getFullYear()} Pet and Found. Open source impact project.
                </p>
                <div className="mt-4 md:mt-0 flex gap-6 text-brand-secondary">
                    <Link href="/privacy" className="hover:text-brand-primary transition-colors">
                        {t('Privacy Policy')}
                    </Link>
                    <span>
                        Made by <a href="https://www.angelpereira.com.br/" className="hover:text-sand-700 underline underline-offset-4 decoration-sand-300 transition-colors" target="_blank" rel="noopener noreferrer">Angel Pereira</a>
                    </span>
                </div>
            </div>
        </footer>
    );
};