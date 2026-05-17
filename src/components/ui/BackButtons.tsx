"use client";

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    label: string;
}

export const BackButton = ({ label }: BackButtonProps) => {
    const router = useRouter();

    return (
        <button 
            onClick={() => router.back()} 
            className="text-brand-primary hover:underline mb-6 inline-block cursor-pointer"
        >
            &larr; {label}
        </button>
    );
};