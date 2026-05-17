"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ReportForm } from '@/components/report/ReportForm';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { useTranslations } from 'next-intl';

export default function EditReportPage() {
    const params = useParams();
    const id = params.id as string;
    const t = useTranslations('MyReports');
    
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const docRef = doc(db, 'reports', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInitialData(docSnap.data());
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Erro ao buscar relatório", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id]);

    return (
        <AuthGuard>
            <div className="min-h-screen py-10 bg-sand-50">
                <div className="max-w-4xl mx-auto px-6 mb-6">
                    <h1 className="text-2xl font-bold text-brand-primary">
                        Editar Alerta
                    </h1>
                </div>

                {loading && (
                    <div className="text-center py-20 text-sand-600">
                        Carregando informações...
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500">
                        Alerta não encontrado ou você não tem permissão para editá-lo.
                    </div>
                )}

                {!loading && !error && initialData && (
                    <ReportForm initialData={initialData} reportId={id} />
                )}
            </div>
        </AuthGuard>
    );
}