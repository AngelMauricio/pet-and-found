import { getTranslations } from 'next-intl/server';
import { MyReportsTable } from '@/components/report/MyReportsTable';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Link } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'MyReports' });
    return { title: t('title') };
}

export default async function MyReportsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'MyReports' });

    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto p-6 min-h-screen space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-brand-primary">
                        {t('title')}
                    </h1>
                    <Link 
                        href="/report" 
                        className="inline-block px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors shadow-sm"
                    >
                        {t('createReport')}
                    </Link>
                </div>

                {/* Container da Tabela Isolado */}
                <div>
                    <MyReportsTable />
                </div>
                
            </div>
        </AuthGuard>
    );
}