"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import dynamic from 'next/dynamic';
import { auth, db } from '@/lib/firebase';
import { updateDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from '@/i18n/routing';
import { geohashForLocation } from 'geofire-common';

interface ReportFormProps {
    initialData?: any;
    reportId?: string;
}

const LocationPicker = dynamic(() => import('./LocationPickerMap'), {
    ssr: false,
    loading: () => (
        <div className="h-72 w-full flex items-center justify-center bg-sand-100 rounded-xl border border-sand-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sand-600"></div>
        </div>
    )
});

type ReportType = 'lost' | 'seen' | 'sheltered' | '';

export const ReportForm = ({ initialData, reportId }: ReportFormProps) => {
    const t = useTranslations('ReportForm');
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [type, setType] = useState<ReportType>('');
    const [observations, setObservations] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [geohash, setGeohash] = useState<string | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);


    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setObservations(initialData.observations);
            setType(initialData.type);
            setLocation(initialData.location);
            setGeohash(initialData.geohash);
            if (initialData.images) {
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);

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
            const originalImages = initialData?.images || [];
            const imagesToDelete = originalImages.filter((img: string) => !existingImages.includes(img));
            const uploadedImageUrls: string[] = [];

            for (const imgUrl of imagesToDelete) {
                try {
                    const url = new URL(imgUrl);
                    const fileKey = url.pathname.substring(1);

                    await fetch('/api/delete-upload', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ fileKey })
                    });
                } catch (err) {
                    console.error("Failed to delete image from R2:", err);
                }
            }

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

            const payload = {
                title,
                type,
                observations,
                location,
                geohash,
                images: [...existingImages, ...uploadedImageUrls],
                createdAt: initialData?.createdAt || serverTimestamp(),
                userId: auth.currentUser?.uid,
                updatedAt: serverTimestamp(),
            };

            if (reportId) {
                const reportRef = doc(db, 'reports', reportId);
                await updateDoc(reportRef, payload);

                fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: reportId })
                }).catch(console.error);
            } else {
                await addDoc(collection(db, 'reports'), payload);
            }

            setShowSecurityModal(false);
            router.push('/my-reports');

        } catch (error) {
            console.error(error);
            alert("Error saving report.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveExistingImage = (urlToRemove: string) => {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove));
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

                {/* 3. Imagens */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-3">
                        {t('labelImages') || 'Fotos do animal'}
                    </label>

                    {/* Exibe imagens já existentes (Modo Edição) */}
                    {existingImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-sand-500 mb-2">Fotos atuais (clique no X para remover):</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {existingImages.map((imgUrl) => {
                                    const fullUrl = imgUrl.startsWith('http')
                                        ? imgUrl
                                        : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${imgUrl}`;

                                    return (
                                        <div key={imgUrl} className="relative group rounded-lg overflow-hidden border border-sand-200">
                                            <img
                                                src={fullUrl}
                                                alt="Existing upload"
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(imgUrl)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remover foto"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Uploader para adicionar novas fotos */}
                    <p className="text-sm text-sand-500 mb-2">
                        {existingImages.length > 0 ? 'Adicionar novas fotos:' : 'Faça o upload de até 4 fotos:'}
                    </p>
                    <ImageUploader
                        // O maxImages calcula dinamicamente o limite restante
                        maxImages={4 - existingImages.length}
                        onImagesChange={(newImages) => setImages(newImages)}
                    />
                </div>

                {/* 4. Mapa */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">
                        {t('labelLocation')} <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-sand-500 mb-3">{t('helperLocation')}</p>

                    <LocationPicker
                        initialLocation={location}
                        onLocationSelect={(coords) => {
                            setLocation(coords);
                            setGeohash(geohashForLocation([coords.lat, coords.lng]));
                        }}
                    />

                    {!location && (
                        <p className="text-sm text-red-500 mt-2">{t('errorLocation')}</p>
                    )}
                </div>

                {/* 5. Observações */}
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