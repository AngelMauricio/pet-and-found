import { getTranslations } from 'next-intl/server';
import { ReportForm } from '@/components/report/ReportForm';
import { AuthGuard } from '@/components/shared/AuthGuard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ReportForm' });
    return { title: t('title') };
}

export default function ReportPage() {
    return (
        <AuthGuard>
            <ReportForm />
        </AuthGuard>
    );
}