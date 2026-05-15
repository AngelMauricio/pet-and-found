"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { loginUser } from '@/services/authService';
import { useRouter } from '@/i18n/routing';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auth guard redirect
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await loginUser(formData.email, formData.password);
      // router redirect handled by onAuthStateChanged
    } catch (error: any) {
      setErrorMsg(t('errors.invalidCredentials'));
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

      {errorMsg && (
        <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelEmail')}</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-sand-400 outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-secondary mb-1">{t('labelPassword')}</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 rounded-lg border border-sand-300 focus:ring-2 focus:ring-sand-400 outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <p className="mt-2 text-center text-sm text-brand-secondary">
            <Link href="/forgot-password" className="text-sand-600 hover:text-sand-700 font-medium">
              {t('forgot-password')}
            </Link>
          </p>
        </div>

        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          {t('submitButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-secondary">
        {t('noAccountText')}{' '}
        <Link href="/register" className="text-sand-600 hover:text-sand-700 font-medium">
          {t('registerLink')}
        </Link>
      </p>
    </div>
  );
}