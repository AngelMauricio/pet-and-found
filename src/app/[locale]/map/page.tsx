import { getTranslations } from 'next-intl/server';
import MapWrapper from '@/components/map/MapWrapper';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Map' });
    return { title: t('title') };
}

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Map' });

    return (
        <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
            <h1 className="text-2xl font-bold text-brand-primary mb-4">{t('title')}</h1>

            <div className="flex-grow bg-white rounded-xl shadow-sm border border-sand-200 p-2 relative z-0">
                <MapWrapper />
            </div>
            <a
                className="text-brand-secondary text-xs self-end mt-2 hover:underline"
                href="https://www.flaticon.com/free-icons/pet-care"
                title="pet care icons"
            >
                Pet care icons created by Flat Icons - Flaticon
            </a>

            <Link
                href="/report"
                className="px-10 py-4 text-lg rounded-full font-medium transition-all duration-200 flex items-center justify-center shadow-sm bg-sand-400 text-brand-primary hover:bg-sand-500 active:scale-95 w-full sm:w-auto"
            >
                {t('reportButton')}
            </Link>
        </div>
    );
}