// src/app/[locale]/(auth)/register/page.tsx
import { getTranslations } from 'next-intl/server';
import RegisterForm from './RegisterForm';

// O Next.js permite gerar metadados aqui porque este é um Server Component
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Register' });

  return {
    title: t('title'),
  };
}

export default function RegisterPage() {
  return <RegisterForm />;
}