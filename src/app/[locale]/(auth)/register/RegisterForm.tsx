"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { registerUser } from '@/services/authService';
import { useRouter, Link } from '@/i18n/routing';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
    const t = useTranslations('Register');
    const router = useRouter();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/');
            } else {
                setIsCheckingAuth(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) newErrors.name = t('errors.nameRequired');

        if (!emailRegex.test(formData.email)) {
            newErrors.email = t('errors.emailInvalid');
        }

        if (!passwordRegex.test(formData.password)) {
            newErrors.password = t('errors.passwordTooWeak');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            await registerUser(formData.email, formData.password, formData.name);
            router.push('/map');
        } catch (error: any) {
            setErrors({ form: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sand-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-sand-200">
            <h1 className="text-2xl font-bold text-brand-primary mb-6">{t('title')}</h1>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelName')}</label>
                    <input
                        type="text"
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.name ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelEmail')}</label>
                    <input
                        type="email"
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.email ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelPassword')}</label>
                    <input
                        type="password"
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.password ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {errors.form && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{t(`errors.${errors.form}`) || errors.form}</p>}

                <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                    {t('submitButton')}
                </Button>

                <p className="mt-6 text-center text-sm text-brand-secondary">
                    {t('alreadyAccountText')}{' '}
                    <Link href="/login" className="text-sand-600 hover:text-sand-700 font-medium">
                        {t('loginLink')}
                    </Link>
                </p>
            </form>
        </div>
    );
}