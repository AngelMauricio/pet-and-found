"use client";

import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logout } from '@/services/authService';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header = () => {
    const t = useTranslations('Header');
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await logout();      // Desloga no Firebase
        router.push('/');    // Redireciona o usuário
    };

    return (
        <header className="w-full py-4 px-6 bg-white border-b border-sand-200 shadow-sm">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-brand-primary">
                    {t('title-1')} <span className="text-sand-600">{t('title-2')}</span>
                </Link>

                <div className="space-x-6 flex items-center text-sm font-medium">
                    <Link href="/map" className="text-brand-secondary hover:text-sand-700 transition-colors">
                        {t('browse-map')}
                    </Link>

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-6">
                                    <Link href="/my-reports" className="text-brand-secondary hover:text-sand-700 transition-colors">
                                        {t('my-reports')}
                                    </Link>
                                    <span className="text-brand-muted">|</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-brand-primary font-semibold">
                                            <Link href="/settings" className="text-brand-primary transition-colors">
                                                {user.displayName || t('user-anonymous')}
                                            </Link>
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            title={t('logout')}
                                            aria-label={t('logout')}
                                            className="text-sand-700 hover:text-sand-900 transition-colors cursor-pointer"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="text-brand-primary hover:text-sand-600 transition-colors">
                                        {t('sign-in')}
                                    </Link>
                                    <Link href="/register" className="px-5 py-2 bg-sand-400 text-brand-primary rounded-full hover:bg-sand-500 transition-all shadow-sm">
                                        {t('register')}
                                    </Link>
                                </>
                            )}
                        </>
                    )}

                    <span className="text-sand-300">|</span>

                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
};