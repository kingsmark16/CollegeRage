import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

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
  const pointerStartRef = useRef(0);
  const pointerLastRef = useRef(0);
  const isDraggingRef = useRef(false);
  const wasDraggedRef = useRef(false);

  const cardSlotWidth = CARD_WIDTH + CARD_GAP;
  const totalWidth = useMemo(() => Math.max(items.length * cardSlotWidth, 1), [items.length, cardSlotWidth]);

  const handleItemClick = (item: CircularGalleryItem, index: number) => {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }

    const currentPosition = wrapPosition(index * cardSlotWidth + scrollOffset, totalWidth);

    if (Math.abs(currentPosition) > CENTER_CLICK_THRESHOLD) {
      setScrollOffset(-index * cardSlotWidth);
      return;
    }

    setScrollOffset(-index * cardSlotWidth);
    onItemSelect?.(item);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pointerStartRef.current = event.clientX;
    pointerLastRef.current = event.clientX;
    wasDraggedRef.current = false;
    if (event.pointerType !== 'mouse') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    const distance = (event.clientX - pointerLastRef.current) * SWIPE_SENSITIVITY;
    if (Math.abs(event.clientX - pointerStartRef.current) >= DRAG_THRESHOLD) {
      wasDraggedRef.current = true;
    }
    setScrollOffset((currentOffset) => currentOffset + distance);
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
      className={`relative h-full w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={(event) => {
        event.preventDefault();
        setScrollOffset((currentOffset) => currentOffset - event.deltaY * 0.8);
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,154,49,0.09),transparent_48%)]" />

      {items.map((item, index) => {
        const position = wrapPosition(index * cardSlotWidth + scrollOffset, totalWidth);
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
              <span className="grid size-12 place-items-center rounded-full border border-white/35 bg-black/45 pl-0.5 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
