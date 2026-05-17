import { BackButton } from '@/components/ui/BackButtons';
import { getTranslations } from 'next-intl/server';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Privacy' });
    
    return {
        title: `${t('title')} | Pet & Found`,
        description: t('description'),
    };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Privacy' });

    return (
        <div className="max-w-3xl mx-auto p-6 py-12">
            <BackButton label={t('back')} />
            
            <h1 className="text-3xl font-bold text-brand-primary mb-8">
                {t('title')}
            </h1>
            
            <div className="space-y-8 text-sand-700 leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold text-brand-primary mb-3">
                        {t('sections.dataCollection.title')}
                    </h2>
                    <p>{t('sections.dataCollection.content')}</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-brand-primary mb-3">
                        {t('sections.location.title')}
                    </h2>
                    <p>{t('sections.location.content')}</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-brand-primary mb-3">
                        {t('sections.storage.title')}
                    </h2>
                    <p>{t('sections.storage.content')}</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-brand-primary mb-3">
                        {t('sections.contact.title')}
                    </h2>
                    <p>{t('sections.contact.content')}</p>
                </section>
                
                <div className="pt-8 border-t border-sand-200 text-sm text-sand-500">
                    <p>{t('lastUpdated')}: 17 de Maio de 2026</p>
                </div>
            </div>
        </div>
    );
}