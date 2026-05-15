"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { reauthenticateAndDelete } from '@/services/authService';
import { useRouter } from '@/i18n/routing';

export const DeleteAccountSection = () => {
  const t = useTranslations('Settings');
  const router = useRouter();
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await reauthenticateAndDelete(password);
      
      router.replace('/'); 
    } catch (error: any) {
      if (error.message === 'auth/wrong-password' || error.message === 'auth/invalid-credential') {
        setErrorMsg(t('errors.wrongPassword'));
      } else {
        setErrorMsg(error.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <section className="p-6 bg-red-50 rounded-2xl border border-red-200">
      <h2 className="text-xl font-semibold text-red-700 mb-2">{t('dangerZone')}</h2>
      <p className="text-sm text-red-600 mb-6">{t('deleteWarning')}</p>
      
      {!isConfirming ? (
        <Button 
          type="button" 
          variant="outline" 
          className="border-red-600 text-red-600 hover:bg-red-100 hover:text-red-700"
          onClick={() => setIsConfirming(true)}
        >
          {t('deleteAccountButton')}
        </Button>
      ) : (
        <form onSubmit={handleDelete} className="w-full space-y-4 mt-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
          <p className="text-sm font-medium text-brand-primary">
            {t('confirmPasswordPrompt')}
          </p>
          
          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

          <input 
            type="password" 
            required
            placeholder={t('passwordPlaceholder')}
            className="w-full px-4 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setIsConfirming(false);
                setPassword('');
                setErrorMsg(null);
              }}
              disabled={isLoading}
            >
              {t('cancelButton')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              isLoading={isLoading}
            >
              {t('confirmDeleteButton')}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};