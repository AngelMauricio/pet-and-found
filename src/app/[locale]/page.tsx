import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { AnimatedName } from '@/components/home/AnimatedName';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <section className="relative h-[70vh] flex items-center justify-center">
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sand-100/80 blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-sand-200/50 blur-3xl" />
      </div> */}

      <div className="relative text-center max-w-3xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight text-brand-primary">
          {t('title-1')} <AnimatedName /> {t('title-2')}
        </h1>
        
        <p className="mt-6 text-lg text-brand-secondary leading-relaxed">
          {t('description')}
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/report-pet"
            className="px-10 py-4 text-lg rounded-full font-medium transition-all duration-200 flex items-center justify-center shadow-sm bg-sand-400 text-brand-primary hover:bg-sand-500 active:scale-95 w-full sm:w-auto"
          >
            {t('buttonReport')}
          </Link>
          
          <Link 
            href="/map"
            className="px-10 py-4 text-lg rounded-full font-medium transition-all duration-200 flex items-center justify-center shadow-sm border-2 border-sand-400 text-brand-primary hover:bg-sand-50 w-full sm:w-auto"
          >
            {t('buttonMap')}
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-sand-200 flex justify-center gap-12">
          <div className="text-center">
            <span className="block text-2xl font-bold text-brand-primary">150+</span>
            <span className="text-xs text-brand-muted uppercase tracking-wider">{t('statsReunited')}</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-brand-primary">Curitiba</span>
            <span className="text-xs text-brand-muted uppercase tracking-wider">{t('statsRegion')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}