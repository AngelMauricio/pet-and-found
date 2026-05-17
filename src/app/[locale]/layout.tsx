import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import "../globals.css";
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: {
      default: "Pet and Found",
      template: "%s | Pet and Found" // O %s será substituído pelo título da página específica
    },
    description: locale === 'pt'
      ? "Ajudando animais perdidos a encontrarem o caminho de casa em Curitiba."
      : "Helping lost pets find their way home in Curitiba.",
    icons: {
      icon: '/favicon.ico', // Certifique-se de ter um favicon na pasta /public
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css" />
      </head>
      <body className="flex flex-col min-h-screen bg-sand-50 text-brand-primary antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-grow w-full max-w-7xl mx-auto py-16">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}