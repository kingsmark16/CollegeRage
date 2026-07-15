import { Film, LayoutDashboard, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingVariant = 'session' | 'dashboard' | 'gallery';

type LoadingExperienceProps = {
  compact?: boolean;
  variant: LoadingVariant;
};

const loadingCopy: Record<LoadingVariant, { icon: typeof ShieldCheck; label: string; message: string }> = {
  session: {
    icon: ShieldCheck,
    label: 'Private archive',
    message: 'Checking your session',
  },
  dashboard: {
    icon: LayoutDashboard,
    label: 'Admin workspace',
    message: 'Preparing your dashboard',
  },
  gallery: {
    icon: Film,
    label: 'Memory archive',
    message: 'Bringing the gallery to life',
  },
};

const LoadingExperience = ({ compact = false, variant }: LoadingExperienceProps) => {
  const copy = loadingCopy[variant];
  const Icon = copy.icon;

  return (
    <div
      aria-live="polite"
      className={cn(
        'relative isolate grid place-items-center overflow-hidden text-[#f2ede4]',
        compact ? 'min-h-72 w-full bg-transparent' : 'min-h-[100dvh] w-full bg-[#0b0f11] px-5'
      )}
    >
      {!compact ? (
        <>
          <div className="pointer-events-none absolute -left-16 top-1/4 size-48 rounded-full bg-[#c79a31]/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 size-56 rounded-full bg-[#3d8a7d]/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(199,154,49,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(199,154,49,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </>
      ) : null}

      <div className={cn('relative grid justify-items-center text-center', compact ? 'gap-3 px-5' : 'w-full max-w-sm gap-5')}>
        <div className={cn('relative grid place-items-center', compact ? 'size-20' : 'size-28')}>
          <span className="absolute inset-0 rounded-full border border-[#c79a31]/20" />
          <span className="absolute inset-2 rounded-full border border-dashed border-[#c79a31]/45 animate-[spin_8s_linear_infinite]" />
          <span className="absolute inset-5 rounded-full bg-[#c79a31]/10 shadow-[0_0_45px_rgba(199,154,49,0.18)]" />
          <Icon aria-hidden="true" className={cn('relative z-10 text-[#f3cf7a]', compact ? 'size-6' : 'size-8')} />
          <Sparkles aria-hidden="true" className="absolute right-1 top-1 size-3 text-[#d4a542] animate-pulse" />
        </div>

        <div className="grid justify-items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c79a31]">{copy.label}</p>
          <p className={cn('font-heading text-[#f5f1ea]', compact ? 'text-lg' : 'text-2xl sm:text-3xl')}>
            {copy.message}
            <span className="inline-flex w-8 justify-start text-left text-[#c79a31]">
              <span className="animate-pulse">...</span>
            </span>
          </p>
          {!compact ? <p className="max-w-xs text-sm leading-6 text-[#8f887e]">One moment while everything gets into position.</p> : null}
        </div>

        <LoaderCircle aria-hidden="true" className={cn('text-[#8f887e] animate-spin', compact ? 'size-4' : 'size-5')} />
      </div>
    </div>
  );
};

export default LoadingExperience;
