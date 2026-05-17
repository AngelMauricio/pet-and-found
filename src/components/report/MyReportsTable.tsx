"use client";

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter, endBefore, limitToLast, DocumentData, QueryDocumentSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ChevronLeft, ChevronRight, Eye, Trash2, Pencil } from 'lucide-react';

const PAGE_SIZE = 5;

export const MyReportsTable = () => {
    const t = useTranslations('MyReports');

    const [reports, setReports] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isLastPage, setIsLastPage] = useState(false);

    const fetchReports = async (moveDirection?: 'next' | 'prev') => {
        if (!auth.currentUser) return;

        setLoading(true);
        try {
            let q = query(
                collection(db, 'reports'),
                where('userId', '==', auth.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            if (moveDirection === 'next' && lastVisible) {
                q = query(q, startAfter(lastVisible), limit(PAGE_SIZE));
            } else if (moveDirection === 'prev' && firstVisible) {
                q = query(q, endBefore(firstVisible), limitToLast(PAGE_SIZE));
            } else {
                q = query(q, limit(PAGE_SIZE));
            }

            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReports(docs);

                setFirstVisible(snapshot.docs[0]);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

                setIsLastPage(snapshot.docs.length < PAGE_SIZE);
            } else {
                if (moveDirection === 'next') setIsLastPage(true);
                if (!moveDirection) setReports([]);
            }
        } catch (error) {
            console.error("Error fetching user reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleNext = () => {
        if (isLastPage) return;
        setPage(prev => prev + 1);
        fetchReports('next');
    };

    const handlePrev = () => {
        if (page === 1) return;
        setIsLastPage(false);
        setPage(prev => prev - 1);
        fetchReports('prev');
    };

    const handleDelete = async (reportId: string) => {
        if (!window.confirm(t('confirmDelete'))) return;

        try {
            if (!auth.currentUser) return;

            const idToken = await auth.currentUser.getIdToken();

            const response = await fetch(`/api/report/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete report on server');
            }

            setReports(prev => prev.filter(r => r.id !== reportId));

        } catch (error) {
            console.error("Error deleting report:", error);
            alert(t('errorDelete'));
        }
    };

    if (loading && page === 1) {
        return <div className="text-center py-10 text-sand-600">{t('loading')}</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-sand-200">
                <p className="text-sand-600 mb-4">{t('noReports')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-sand-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-sand-50 border-b border-sand-200 text-brand-secondary text-xs font-semibold uppercase tracking-wider">
                            <th className="px-6 py-4">{t('thPet')}</th>
                            <th className="px-6 py-4">{t('thStatus')}</th>
                            <th className="px-6 py-4">{t('thDate')}</th>
                            <th className="px-6 py-4 text-right">{t('thActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100 text-sm text-brand-primary">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-sand-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    {report.images?.[0] && (
                                        <img
                                            src={report.images[0]}
                                            alt={report.title}
                                            className="w-10 h-10 rounded-lg object-cover border border-sand-200"
                                        />
                                    )}
                                    <span>{report.title}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.type === 'lost' ? 'bg-red-50 text-red-700' :
                                        report.type === 'seen' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                                        }`}>
                                        {t(`types.${report.type}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sand-600">
                                    {report.createdAt?.toDate().toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/pet/${report.id}`}
                                            className="text-sand-500 hover:text-brand-primary transition-colors"
                                            title={t('view')}
                                        >
                                            <Eye size={18} />
                                        </Link>
                                        <Link
                                            href={`/edit/${report.id}`}
                                            className="text-sand-500 hover:text-blue-500 transition-colors"
                                            title={t('edit')}
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <Link
                                            href={`/delete/${report.id}`}
                                            className="text-sand-500 hover:text-red-500 transition-colors cursor-pointer"
                                            title={t('delete')}
                                        >
                                            <Trash2 size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-sand-200 flex items-center justify-between bg-sand-50/50">
                <span className="text-xs text-sand-500">
                    {t('page')} {page}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={page === 1 || loading}
                        className="p-1.5 rounded-lg border border-sand-300 bg-white hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isLastPage || loading}
                        className="p-1.5 rounded-lg border border-sand-300 bg-white hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};