import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const getRetryDelay = (attempt: number) => Math.min(1200 + attempt * 600, 5000);

type RetryingMediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  iconClassName?: string;
  imgClassName?: string;
  overlayClassName?: string;
  wrapperClassName?: string;
};

const RetryingMediaImage = ({
  alt,
  iconClassName,
  imgClassName,
  overlayClassName,
  src,
  wrapperClassName,
  ...imgProps
}: RetryingMediaImageProps) => {
  const retryTimerRef = useRef<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWaitingToRetry, setIsWaitingToRetry] = useState(false);

  const resolvedSrc = src
    ? `${src}${src.includes('?') ? '&' : '?'}mediaRetry=${attempt}`
    : '';

  useEffect(
    () => () => {
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
      }
    },
    []
  );

  const handleLoad = () => {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    setIsLoaded(true);
    setIsWaitingToRetry(false);
  };

  const handleError = () => {
    if (!src || retryTimerRef.current) {
      return;
    }

    setIsLoaded(false);
    setIsWaitingToRetry(true);

    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null;
      setAttempt((currentAttempt) => currentAttempt + 1);
      setIsWaitingToRetry(false);
    }, getRetryDelay(attempt));
  };

  if (!src) {
    return (
      <div className={cn('relative overflow-hidden bg-[#0f1212]', wrapperClassName)}>
        <div className="grid h-full w-full place-items-center text-[#6f6a63]">
          <ImageOff className={cn('size-10', iconClassName)} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-[#0f1212]', wrapperClassName)}>
      <img
        {...imgProps}
        alt={alt}
        className={cn(
          'h-full w-full transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
        src={resolvedSrc}
        onError={handleError}
        onLoad={handleLoad}
      />

      {!isLoaded ? (
        <div
          className={cn(
            'absolute inset-0 bg-[#101414]/90 backdrop-blur-[1px]',
            overlayClassName
          )}
        >
          <Skeleton
            className={cn(
              'absolute inset-0 h-full w-full bg-white/5',
              isWaitingToRetry ? 'opacity-80' : 'opacity-100'
            )}
          />
        </div>
      ) : null}
    </div>
  );
};

export default RetryingMediaImage;
