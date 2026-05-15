"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/services/authService';
import { Link } from '@/i18n/routing';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await resetPassword(email);
      setMessage({ type: 'success', text: t('successMessage') });
      setEmail('');
    } catch (error: any) {
      setMessage({ type: 'error', text: t('errorMessage') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-sm border border-sand-200">
      <h1 className="text-2xl font-bold text-brand-primary mb-2">{t('title')}</h1>
      <p className="text-sm text-brand-secondary mb-6">{t('description')}</p>
      
      {message && (
        <div className={`mb-4 p-3 text-sm rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelEmail')}</label>
          <input 
            type="email" 
            required
            value={email}
            className="w-full px-4 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-sand-400 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('submitButton')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-sand-600 hover:text-sand-700 font-medium">
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  );
}