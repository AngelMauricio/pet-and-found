"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { updateUserProfile, updateUserPassword } from '@/services/authService';
import { auth } from '@/lib/firebase';

export const ProfileSettingsSection = () => {
    const t = useTranslations('Settings');

    const [formData, setFormData] = useState({
        name: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Load current name on mount
    useEffect(() => {
        if (auth.currentUser?.displayName) {
            setFormData(prev => ({ ...prev, name: auth.currentUser!.displayName || '' }));
        }
    }, []);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) newErrors.name = t('errors.nameRequired');

        const isChangingPassword = formData.newPassword || formData.currentPassword || formData.confirmPassword;

        if (isChangingPassword) {
            if (!formData.currentPassword) newErrors.currentPassword = t('errors.currentPasswordRequired');
            if (!passwordRegex.test(formData.newPassword)) newErrors.newPassword = t('errors.passwordTooWeak');
            if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = t('errors.passwordsDoNotMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg(null);
        setErrors({});

        if (!validate()) return;

        setIsLoading(true);
        try {
            await updateUserProfile(formData.name);
            if (formData.currentPassword && formData.newPassword) {
                await updateUserPassword(formData.currentPassword, formData.newPassword);
            }

            setSuccessMsg(t('profileUpdated'));

            // Clear password fields on success
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error: any) {
            if (error.message === 'auth/wrong-password' || error.message === 'auth/invalid-credential') {
                setErrors({ form: t('errors.wrongPassword') });
            } else {
                setErrors({ form: t('errors.' + error.message) });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="p-6 bg-white rounded-2xl shadow-sm border border-sand-200">
            <h2 className="text-xl font-semibold mb-6">{t('profileTitle')}</h2>

            {successMsg && (
                <div className="mb-4 p-3 text-sm bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {successMsg}
                </div>
            )}

            {errors.form && (
                <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {errors.form}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm" noValidate>
                <div>
                    <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelName')}</label>
                    <input
                        type="text"
                        className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.name ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="pt-4 mt-4 border-t border-sand-100">
                    <p className="text-sm font-medium text-brand-primary mb-4">{t('changePasswordOptional')}</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">{t('currentPassword')}</label>
                            <input
                                type="password"
                                className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.currentPassword ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            />
                            {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">{t('newPassword')}</label>
                            <input
                                type="password"
                                className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.newPassword ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            />
                            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-secondary mb-1">{t('confirmPassword')}</label>
                            <input
                                type="password"
                                className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-sand-300 focus:ring-2 focus:ring-sand-400'}`}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                    {t('saveChangesButton')}
                </Button>
            </form>
        </section>
    );
};