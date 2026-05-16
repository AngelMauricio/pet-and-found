import { getTranslations } from 'next-intl/server';
import { ReportForm } from '@/components/report/ReportForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ReportForm' });
    return { title: t('title') };
}

export default function ReportPage() {
    return (
        <div>
            <ReportForm />
        </div>
    );
}