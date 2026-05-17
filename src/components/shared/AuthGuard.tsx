"use client";

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setLoading(false);
            } else {
                // Se não estiver logado, manda para o login
                router.push('/login'); 
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    // Retorna null por segurança para não "piscar" o conteúdo da tela protegida
    if (!isAuthenticated) return null; 

    return <>{children}</>;
};