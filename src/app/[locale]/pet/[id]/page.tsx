import { cache } from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BackButton } from '@/components/ui/BackButtons';

const getPet = cache(async (id: string) => {
    const docSnap = await adminDb.collection('reports').doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as PetReport;
});

interface PetReport {
    id: string;
    title: string;
    type: string;
    observations: string;
    images: string[];
    createdAt: { _seconds: number; _nanoseconds: number };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const pet = await getPet(id);

    if (!pet) return { title: 'Not Found' };

    const imageUrl = pet.images?.[0]
        ? (pet.images[0].startsWith('http') ? pet.images[0] : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${pet.images[0]}`)
        : 'URL_DE_UMA_IMAGEM_PADRAO_DO_SEU_SISTEMA';

    return {
        title: `${pet.title} | Pet & Found`,
        description: pet.observations,
        openGraph: {
            title: pet.title,
            description: pet.observations,
            images: [imageUrl],
        },
    };
}

export default async function PetDetailsPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const pet = await getPet(id);
    const t = await getTranslations({ locale, namespace: 'PetDetails' });

    if (!pet) notFound();

    return (
        <div className="max-w-3xl mx-auto">
            <BackButton label={t('back')} />

            <div className="bg-white rounded-xl shadow-sm border border-sand-200 overflow-hidden">
                {pet.images && pet.images.length > 0 && (
                    <div className={`grid gap-2 bg-sand-100 ${pet.images.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                        }`}>
                        {pet.images.map((imgUrl, index) => {
                            const fullUrl = imgUrl.startsWith('http')
                                ? imgUrl
                                : `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${imgUrl}`;

                            return (
                                <img
                                    key={index}
                                    src={fullUrl}
                                    alt={`${pet.title} - ${index + 1}`}
                                    className="w-full h-96 object-cover"
                                />
                            );
                        })}
                    </div>
                )}

                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-brand-primary mb-2">
                                {pet.title}
                            </h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${pet.type === 'lost' ? 'bg-red-50 text-red-700' :
                                    pet.type === 'seen' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                                }`}>
                                {t(`types.${pet.type}`)}
                            </span>
                        </div>
                        <div className="text-right text-sm text-sand-500">
                            <p>{t('postedOn')}</p>
                            {/* O Firebase Admin retorna Timestamp de forma diferente do SDK Client. Precisamos converter. */}
                            <p className="font-medium text-sand-700">
                                {new Date(pet.createdAt._seconds * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {pet.observations && (
                        <div>
                            <h2 className="text-lg font-semibold text-brand-primary mb-2">{t('observations')}</h2>
                            <p className="text-sand-700 whitespace-pre-wrap">{pet.observations}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}