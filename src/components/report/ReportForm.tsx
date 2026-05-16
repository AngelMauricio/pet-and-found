"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import dynamic from 'next/dynamic';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';

const LocationPicker = dynamic(() => import('./LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-72 w-full flex items-center justify-center bg-sand-100 rounded-xl border border-sand-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sand-600"></div>
        </div>
    )
});

type ReportType = 'lost' | 'seen' | 'sheltered' | '';

export const ReportForm = () => {
    const t = useTranslations('ReportForm');
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [type, setType] = useState<ReportType>('');
    const [observations, setObservations] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Abre o modal de segurança em vez de enviar direto
    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validações básicas antes do modal
        if (!title.trim() || !type) return;

        setShowSecurityModal(true);
    };

    const handleFinalSubmit = async () => {
        if (!auth.currentUser) {
            alert(t('errorNotLoggedIn'));
            return;
        }

        setIsLoading(true);
        try {
            const idToken = await auth.currentUser.getIdToken(true);
            const uploadedImageUrls: string[] = [];

            for (const file of images) {
                const res = await fetch('/api/upload-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type
                    })
                });

                if (!res.ok) throw new Error('Failed to get presigned URL');

                const { uploadUrl, fileKey } = await res.json();

                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type
                    }
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file to R2');

                const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`;
                uploadedImageUrls.push(publicUrl);
            }

            // 2. Save document to Firestore
            await addDoc(collection(db, 'reports'), {
                userId: auth.currentUser.uid,
                title,
                type,
                observations,
                location,
                images: uploadedImageUrls,
                status: 'active',
                createdAt: serverTimestamp(),
            });

            setShowSecurityModal(false);

            // TODO: Replace with Next.js router.push('/map')
            router.push('/my-reports');

        } catch (error) {
            console.error(error);
            alert("Error saving report.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-sand-200">
            <h2 className="text-2xl font-bold text-brand-primary mb-6">{t('title')}</h2>

            <form onSubmit={handleInitialSubmit} className="space-y-6">

                {/* 1. Nome + Descrição */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">
                        {t('labelTitle')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder={t('placeholderTitle')}
                        className="w-full px-4 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-sand-400 outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* 2. Tipo de Alerta (Radio Buttons) */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-3">
                        {t('labelType')} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['lost', 'seen', 'sheltered'] as ReportType[]).map((option) => (
                            <label
                                key={option}
                                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${type === option
                                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                                    : 'border-sand-200 hover:border-sand-300 text-sand-600'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="reportType"
                                    value={option}
                                    checked={type === option}
                                    onChange={() => setType(option)}
                                    className="sr-only"
                                />
                                <span className="font-medium text-sm">{t(`types.${option}`)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 3. Imagens (Placeholder para o próximo passo) */}
                <ImageUploader
                    maxImages={3}
                    onImagesChange={(newImages) => setImages(newImages)}
                />

                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">
                        {t('labelLocation')} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-sand-500 mb-3">{t('helperLocation')}</p>

                    <LocationPicker
                        onLocationSelect={(coords) => setLocation(coords)}
                    />

                    {!location && (
                        <p className="text-sm text-red-500 mt-2">{t('errorLocation')}</p>
                    )}
                </div>

                {/* 4. Observações */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1 flex justify-between">
                        <span>{t('labelObs')}</span>
                        <span className="text-xs text-sand-400">{observations.length}/500</span>
                    </label>
                    <textarea
                        maxLength={500}
                        rows={4}
                        placeholder={t('placeholderObs')}
                        className="w-full px-4 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-sand-400 outline-none resize-none"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={!title || !type || !location}>
                    {t('continueButton')}
                </Button>
            </form>

            {/* MODAL DE SEGURANÇA */}
            {showSecurityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">

                        <button
                            onClick={() => setShowSecurityModal(false)}
                            className="absolute top-4 right-4 text-sand-400 hover:text-sand-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-4 text-orange-500">
                            <AlertTriangle size={28} />
                            <h3 className="text-xl font-bold text-brand-primary">{t('security.title')}</h3>
                        </div>

                        <p className="text-sm text-brand-secondary mb-4">
                            {t('security.description')}
                        </p>

                        <ul className="space-y-3 mb-8 bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <li className="flex items-start gap-2 text-sm text-orange-800">
                                <CheckCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                <span>{t('security.tip1')}</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-orange-800">
                                <CheckCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                <span>{t('security.tip2')}</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-orange-800">
                                <CheckCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                <span>{t('security.tip3')}</span>
                            </li>
                        </ul>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowSecurityModal(false)}
                            >
                                {t('security.cancel')}
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                isLoading={isLoading}
                                onClick={handleFinalSubmit}
                            >
                                {t('security.confirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};