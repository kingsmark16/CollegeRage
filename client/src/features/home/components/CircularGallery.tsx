import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export type CircularGalleryItem = {
  id: string;
  image: string;
};

type CircularGalleryProps = {
  items: CircularGalleryItem[];
  pauseImageLoading?: boolean;
  className?: string;
  onItemSelect?: (item: CircularGalleryItem) => void;
};

const CARD_WIDTH = 360;
const CARD_GAP = 24;
const DRAG_THRESHOLD = 8;
const SWIPE_SENSITIVITY = 1.8;
const MOBILE_SWIPE_SENSITIVITY = 3.4;
const CENTER_CLICK_THRESHOLD = CARD_WIDTH * 0.5;
const ARC_RADIUS = 500;
const MAX_ARC_ANGLE = 1.4;

const wrapPosition = (position: number, totalWidth: number) => {
  const halfWidth = totalWidth / 2;
  return ((((position + halfWidth) % totalWidth) + totalWidth) % totalWidth) - halfWidth;
};

const RETRY_INTERVAL_MS = 5000;

const RetryingThumbnail = ({ source, pauseLoading = false }: { source: string; pauseLoading?: boolean }) => {
  const [retryNumber, setRetryNumber] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (pauseLoading || !hasFailed) {
      return;
    }

    const retryTimer = window.setTimeout(() => {
      setRetryNumber((currentNumber) => currentNumber + 1);
    }, RETRY_INTERVAL_MS);

    return () => window.clearTimeout(retryTimer);
  }, [hasFailed, pauseLoading, retryNumber]);

  if (pauseLoading && !hasLoaded) {
    return <span className="block size-full bg-[#252b2a]" aria-hidden="true" />;
  }

  return (
    <img
      key={`${source}-${retryNumber}`}
      alt=""
      className="size-full object-cover"
      draggable={false}
      decoding="async"
      src={source}
      onError={() => setHasFailed(true)}
      onLoad={() => {
        setHasFailed(false);
        setHasLoaded(true);
      }}
    />
  );
};

const CircularGallery = ({ items, pauseImageLoading = false, className = '', onItemSelect }: CircularGalleryProps) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollOffsetRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const pointerStartRef = useRef(0);
  const pointerLastRef = useRef(0);
  const isTouchPointerRef = useRef(false);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);

  const cardSlotWidth = CARD_WIDTH + CARD_GAP;
  const totalWidth = useMemo(() => Math.max(items.length * cardSlotWidth, 1), [items.length, cardSlotWidth]);

  const scheduleScrollOffset = (nextOffset: number) => {
    scrollOffsetRef.current = nextOffset;

    if (scrollFrameRef.current !== null) {
      return;
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      setScrollOffset(scrollOffsetRef.current);
    });
  };

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  const handleItemClick = (item: CircularGalleryItem, index: number) => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }

    const currentPosition = wrapPosition(index * cardSlotWidth + scrollOffsetRef.current, totalWidth);

    if (Math.abs(currentPosition) > CENTER_CLICK_THRESHOLD) {
      scheduleScrollOffset(-index * cardSlotWidth);
      return;
    }

    scheduleScrollOffset(-index * cardSlotWidth);
    onItemSelect?.(item);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pointerStartRef.current = event.clientX;
    pointerLastRef.current = event.clientX;
    isTouchPointerRef.current = event.pointerType !== 'mouse';
    wasDraggedRef.current = false;
    if (event.pointerType !== 'mouse') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    const sensitivity = isTouchPointerRef.current ? MOBILE_SWIPE_SENSITIVITY : SWIPE_SENSITIVITY;
    const distance = (event.clientX - pointerLastRef.current) * sensitivity;
    if (Math.abs(event.clientX - pointerStartRef.current) >= DRAG_THRESHOLD) {
      wasDraggedRef.current = true;
    }
    scheduleScrollOffset(scrollOffsetRef.current + distance);
    pointerLastRef.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={`relative h-full w-full cursor-grab touch-pan-y overscroll-contain overflow-hidden active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={(event) => {
        event.preventDefault();
        scheduleScrollOffset(scrollOffsetRef.current - event.deltaY * 0.8);
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,154,49,0.09),transparent_48%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[120] flex justify-center sm:bottom-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#101212]/75 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#beb7af] shadow-lg backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2 sm:text-[10px]">
          <ArrowLeft aria-hidden="true" className="size-3 text-[#c79a31] sm:size-3.5" />
          <span className="sm:hidden">Swipe to explore</span>
          <span className="hidden sm:inline">Drag to explore</span>
          <ArrowRight aria-hidden="true" className="size-3 text-[#c79a31] sm:size-3.5" />
        </div>
      </div>

      {items.map((item, index) => {
        const position = wrapPosition(index * cardSlotWidth + scrollOffset, totalWidth);
        const isCentered = Math.abs(position) <= CENTER_CLICK_THRESHOLD;
        const normalizedPosition = position / (totalWidth / 2 || 1);
        const arcAngle = normalizedPosition * MAX_ARC_ANGLE;
        const depth = Math.abs(normalizedPosition);
        const translateX = Math.sin(arcAngle) * ARC_RADIUS;
        const translateY = (1 - Math.cos(arcAngle)) * ARC_RADIUS * 0.55;
        const rotation = (arcAngle * 180) / Math.PI;
        const scale = 1 - depth * 0.22;

        return (
          <button
            key={item.id}
            aria-label="Play video"
            className="group absolute h-[calc(min(50vw,360px)*0.5625)] w-[min(50vw,360px)] overflow-hidden border border-white/15 bg-[#252b2a] shadow-[0_24px_44px_rgba(0,0,0,0.42)] transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79a31]"
            style={{
              left: `calc(50% + ${translateX}px)`,
              top: `calc(50% + ${translateY}px)`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex: Math.round((1 - depth) * 100),
            }}
            type="button"
            onClick={() => handleItemClick(item, index)}
          >
            <RetryingThumbnail source={item.image} pauseLoading={pauseImageLoading} />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className={`grid size-12 place-items-center rounded-full border border-white/35 bg-black/45 pl-0.5 text-sm text-white transition-opacity duration-200 ${isCentered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                ▶
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CircularGallery;
