import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useGesture } from '@use-gesture/react';

type ImageItem = string | { src: string; alt?: string };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  maxPad?: number;
  verticalStageOffset?: string;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

type DomeLayout = {
  items: ItemDef[];
  effectiveSegments: number;
  rowsPerColumn: number;
  columnCount: number;
};

type CustomStyle = CSSProperties & Record<`--${string}`, string | number>;
type PointerKind = 'mouse' | 'pen' | 'touch';

const customStyle = (style: CustomStyle) => style;

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  },
  {
    src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large',
    alt: 'Social media image'
  }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};
const getPointerKind = (pointerType: string): PointerKind => {
  if (pointerType === 'mouse' || pointerType === 'pen' || pointerType === 'touch') {
    return pointerType;
  }

  return 'mouse';
};

const getAspectFitRect = (maxWidth: number, maxHeight: number, aspect: number) => {
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return { width: maxWidth, height: maxHeight };
  }

  const frameAspect = maxWidth / maxHeight;

  if (frameAspect > aspect) {
    const height = maxHeight;
    return { width: height * aspect, height };
  }

  const width = maxWidth;
  return { width, height: width / aspect };
};

const getImageRetryDelay = (attempt: number) => {
  return Math.min(750 * 2 ** Math.min(attempt, 5), 20000);
};

const INITIAL_ACTIVE_IMAGE_COUNT = 56;
const ACTIVE_IMAGE_BATCH_SIZE = 16;
const ACTIVE_IMAGE_BATCH_INTERVAL_MS = 120;
const RETRY_BLINK_DURATION_MS = 220;

const getRowsPerColumn = (imageCount: number) => {
  if (imageCount <= 40) return 6;
  if (imageCount <= 140) return 7;
  if (imageCount <= 280) return 8;
  return 9;
};

const getMinimumColumnCount = (imageCount: number, preferredSegments: number) => {
  if (imageCount <= 0) return preferredSegments;
  if (imageCount <= 20) return clamp(Math.ceil(imageCount / 2), 8, preferredSegments);
  if (imageCount <= 60) return Math.min(preferredSegments, 16);

  return 1;
};

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const shuffleWithSeed = <T,>(items: T[], seed: number) => {
  const shuffledItems = [...items];
  const random = createSeededRandom(seed);

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }

  return shuffledItems;
};

function buildLayout(pool: ImageItem[], preferredSegments: number, layoutSeed: number): DomeLayout {
  const normalizedImages = pool.reduce<{ src: string; alt: string }[]>((images, image) => {
    const nextImage =
      typeof image === 'string'
        ? { src: image, alt: '' }
        : { src: image.src || '', alt: image.alt || '' };

    if (nextImage.src.length === 0 || images.some((existingImage) => existingImage.src === nextImage.src)) {
      return images;
    }

    return [...images, nextImage];
  }, []);

  if (normalizedImages.length === 0) {
    return {
      items: [],
      effectiveSegments: preferredSegments,
      rowsPerColumn: 0,
      columnCount: 0
    };
  }

  const rowsPerColumn = getRowsPerColumn(normalizedImages.length);
  const minimumColumnCount = getMinimumColumnCount(normalizedImages.length, preferredSegments);
  const columnCount = Math.max(minimumColumnCount, Math.ceil(normalizedImages.length / rowsPerColumn));
  const xStart = -(columnCount - 1);
  const xCols = Array.from({ length: columnCount }, (_, i) => xStart + i * 2);
  const yStart = -(rowsPerColumn - 1);
  const evenYs = Array.from({ length: rowsPerColumn }, (_, i) => yStart + i * 2);
  const oddYs = evenYs.map(y => y + 1);

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const scoredCoords = coords
    .map((coord) => {
      const { rotateX, rotateY } = computeItemBaseRotation(coord.x, coord.y, coord.sizeX, coord.sizeY, columnCount);
      const normalizedY = wrapAngleSigned(rotateY);
      const horizontalVisibility = Math.max(0, Math.cos((normalizedY * Math.PI) / 180));
      const verticalVisibility = Math.max(0, Math.cos((rotateX * Math.PI) / 180));
      const lowerBias = coord.y;

      return {
        coord,
        score: horizontalVisibility * 0.78 + verticalVisibility * 0.22 - lowerBias * 0.015
      };
    })
    .sort((leftItem, rightItem) => rightItem.score - leftItem.score);
  const slottedCoords = scoredCoords.slice(0, normalizedImages.length).map((item) => item.coord);
  const shuffledImages = shuffleWithSeed(
    normalizedImages,
    hashString(`${layoutSeed}:${normalizedImages.map(image => image.src).join('|')}`)
  );

  return {
    items: shuffledImages.map((image, i) => ({
      ...slottedCoords[i],
      src: image.src,
      alt: image.alt
    })),
    effectiveSegments: columnCount,
    rowsPerColumn,
    columnCount
  };
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

const getInitialVisibilityScore = (item: ItemDef, segments: number) => {
  const baseRotation = computeItemBaseRotation(item.x, item.y, item.sizeX, item.sizeY, segments);
  const normalizedY = wrapAngleSigned(baseRotation.rotateY);
  const normalizedX = baseRotation.rotateX;
  const horizontalVisibility = Math.max(0, Math.cos((normalizedY * Math.PI) / 180));
  const verticalVisibility = Math.max(0, Math.cos((normalizedX * Math.PI) / 180));

  return horizontalVisibility * 0.78 + verticalVisibility * 0.22;
};

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  maxPad = 96,
  verticalStageOffset = '0px',
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth,
  openedImageHeight,
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>('mouse');
  const tapTargetRef = useRef<HTMLElement | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const retryTimersRef = useRef<Map<string, number>>(new Map());
  const retryBlinkTimersRef = useRef<Map<string, number>>(new Map());
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());
  const sessionLayoutSeedRef = useRef<number>(Math.floor(Math.random() * 0x100000000));
  const [imageRetryKeys, setImageRetryKeys] = useState<Record<string, number>>({});
  const [loadedImageSources, setLoadedImageSources] = useState<Record<string, boolean>>({});
  const [retryBlinkSources, setRetryBlinkSources] = useState<Record<string, boolean>>({});

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const layout = useMemo(
    () => buildLayout(images, segments, sessionLayoutSeedRef.current),
    [images, segments]
  );
  const { items } = layout;
  const effectiveSegments = layout.effectiveSegments;
  const prioritizedItems = useMemo(
    () =>
      [...items].sort(
        (leftItem, rightItem) =>
          getInitialVisibilityScore(rightItem, effectiveSegments) - getInitialVisibilityScore(leftItem, effectiveSegments)
      ),
    [effectiveSegments, items]
  );
  const imageSources = useMemo(
    () => Array.from(new Set(prioritizedItems.map(item => item.src).filter(Boolean))),
    [prioritizedItems]
  );
  const imageSourcesKey = useMemo(() => imageSources.join('\n'), [imageSources]);
  const imageSourcePriority = useMemo(
    () =>
      imageSources.reduce<Record<string, number>>((priorityMap, src, index) => {
        priorityMap[src] = index;
        return priorityMap;
      }, {}),
    [imageSources]
  );
  const [activeImageState, setActiveImageState] = useState({ imageSourcesKey: '', count: 0 });
  const activeImageCount =
    activeImageState.imageSourcesKey === imageSourcesKey
      ? activeImageState.count
      : Math.min(INITIAL_ACTIVE_IMAGE_COUNT, imageSources.length);
  const activeImageSources = useMemo(
    () => new Set(imageSources.slice(0, activeImageCount)),
    [activeImageCount, imageSources]
  );

  const clearImageRetryTimer = useCallback((src: string) => {
    const timer = retryTimersRef.current.get(src);
    if (timer === undefined) return;

    window.clearTimeout(timer);
    retryTimersRef.current.delete(src);
  }, []);

  const clearImageRetryBlinkTimer = useCallback((src: string) => {
    const timer = retryBlinkTimersRef.current.get(src);
    if (timer === undefined) return;

    window.clearTimeout(timer);
    retryBlinkTimersRef.current.delete(src);
  }, []);

  const markImageLoaded = useCallback(
    (src: string) => {
      clearImageRetryTimer(src);
      clearImageRetryBlinkTimer(src);
      retryAttemptsRef.current.delete(src);
      setRetryBlinkSources(currentSources => {
        if (!currentSources[src]) return currentSources;

        const nextSources = { ...currentSources };
        delete nextSources[src];
        return nextSources;
      });
      setLoadedImageSources(currentSources => {
        if (currentSources[src]) return currentSources;

        return {
          ...currentSources,
          [src]: true
        };
      });
    },
    [clearImageRetryBlinkTimer, clearImageRetryTimer]
  );

  const scheduleImageRetry = useCallback(
    (src: string) => {
      if (src.length === 0 || retryTimersRef.current.has(src)) return;

      const attempt = retryAttemptsRef.current.get(src) ?? 0;
      const retryDelay = getImageRetryDelay(attempt);
      const blinkDelay = Math.max(retryDelay - RETRY_BLINK_DURATION_MS, 0);

      clearImageRetryBlinkTimer(src);
      setLoadedImageSources(currentSources => {
        if (!(src in currentSources)) return currentSources;

        const nextSources = { ...currentSources };
        delete nextSources[src];
        return nextSources;
      });

      const blinkTimer = window.setTimeout(() => {
        retryBlinkTimersRef.current.delete(src);
        setRetryBlinkSources(currentSources => ({
          ...currentSources,
          [src]: true
        }));
      }, blinkDelay);

      const timer = window.setTimeout(() => {
        retryTimersRef.current.delete(src);
        clearImageRetryBlinkTimer(src);
        retryAttemptsRef.current.set(src, attempt + 1);
        setRetryBlinkSources(currentSources => {
          if (!currentSources[src]) return currentSources;

          const nextSources = { ...currentSources };
          delete nextSources[src];
          return nextSources;
        });
        setImageRetryKeys(currentKeys => ({
          ...currentKeys,
          [src]: (currentKeys[src] ?? 0) + 1
        }));
      }, retryDelay);

      retryBlinkTimersRef.current.set(src, blinkTimer);
      retryTimersRef.current.set(src, timer);
    },
    [clearImageRetryBlinkTimer]
  );

  useEffect(() => {
    if (activeImageCount >= imageSources.length) return;

    const timer = window.setTimeout(() => {
      setActiveImageState(currentState => {
        const currentCount = currentState.imageSourcesKey === imageSourcesKey ? currentState.count : activeImageCount;

        return {
          imageSourcesKey,
          count: Math.min(currentCount + ACTIVE_IMAGE_BATCH_SIZE, imageSources.length)
        };
      });
    }, ACTIVE_IMAGE_BATCH_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [activeImageCount, imageSources.length, imageSourcesKey]);

  useEffect(() => {
    const retryAttempts = retryAttemptsRef.current;
    const retryBlinkTimers = retryBlinkTimersRef.current;
    const retryTimers = retryTimersRef.current;

    return () => {
      retryAttempts.clear();
      retryBlinkTimers.forEach(timer => window.clearTimeout(timer));
      retryBlinkTimers.clear();
      retryTimers.forEach(timer => window.clearTimeout(timer));
      retryTimers.clear();
    };
  }, [imageSources]);

  useEffect(() => {
    const nextImageSources = new Set(imageSources);

    setLoadedImageSources(currentSources =>
      Object.fromEntries(Object.entries(currentSources).filter(([src]) => nextImageSources.has(src)))
    );
    setRetryBlinkSources(currentSources =>
      Object.fromEntries(Object.entries(currentSources).filter(([src]) => nextImageSources.has(src)))
    );
  }, [imageSources]);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      const responsiveFit = aspect < 0.75 ? Math.max(fit, 0.72) : fit;
      const responsiveMinRadius = aspect < 0.75 ? Math.min(minRadius, Math.round(w * 0.74)) : minRadius;
      let radius = basis * responsiveFit;
      const heightGuard = h * (aspect < 0.75 ? 1.72 : 1.35);
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, responsiveMinRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = clamp(Math.round(minDim * padFactor), 0, maxPad);
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      root.style.setProperty('--stage-y', aspect < 0.75 ? verticalStageOffset : '0px');
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();
        const imageAspect = Number.parseFloat(enlargedOverlay.dataset.aspect ?? '');

        const hasCustomSize = openedImageWidth && openedImageHeight;
        if (hasCustomSize) {
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else if (Number.isFinite(imageAspect) && imageAspect > 0) {
          const fitted = getAspectFitRect(frameR.width, frameR.height, imageAspect);
          const centeredLeft = frameR.left - mainR.left + (frameR.width - fitted.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - fitted.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
          enlargedOverlay.style.width = `${fitted.width}px`;
          enlargedOverlay.style.height = `${fitted.height}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    maxPad,
    verticalStageOffset,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();

        const evt = event as PointerEvent;
        pointerTypeRef.current = getPointerKind(evt.pointerType);
        if (pointerTypeRef.current === 'touch') evt.preventDefault();
        if (pointerTypeRef.current === 'touch') lockScroll();
        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
        const potential = (evt.target as Element).closest?.('.item__image') as HTMLElement | null;
        tapTargetRef.current = potential || null;
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

        const evt = event as PointerEvent;
        if (pointerTypeRef.current === 'touch') evt.preventDefault();

        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }

        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

        const cur = rotationRef.current;
        if (cur.x !== nextX || cur.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          let isTap = false;

          if (startPosRef.current) {
            const dx = evt.clientX - startPosRef.current.x;
            const dy = evt.clientY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 10 : 6;
            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) {
              isTap = true;
            }
          }

          const [vMagX, vMagY] = velArr;
          const [dirX, dirY] = dirArr;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = (mx / dragSensitivity) * 0.02;
            vy = (my / dragSensitivity) * 0.02;
          }

          if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
            startInertia(vx, vy);
          }
          startPosRef.current = null;
          cancelTapRef.current = !isTap;

          if (isTap && tapTargetRef.current && !focusedElRef.current) {
            openItemFromElement(tapTargetRef.current);
          }
          tapTargetRef.current = null;

          if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
          if (pointerTypeRef.current === 'touch') unlockScroll();
          if (movedRef.current) lastDragEndAt.current = evt.timeStamp;
          movedRef.current = false;
        }
      }
    },
    { target: mainRef, eventOptions: { passive: false } }
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const close = () => {
      if (Date.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement;
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (!overlay) return;

      const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;

      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', `0deg`);
        parent.style.setProperty('--rot-x-delta', `0deg`);
        el.style.visibility = '';
        el.style.zIndex = '0';
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current!.getBoundingClientRect();

      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height
      };

      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };

      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `
        position: absolute;
        left: ${overlayRelativeToRoot.left}px;
        top: ${overlayRelativeToRoot.top}px;
        width: ${overlayRelativeToRoot.width}px;
        height: ${overlayRelativeToRoot.height}px;
        z-index: 9999;
        border-radius: ${openedImageBorderRadius};
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.35);
        transition: all ${enlargeTransitionMs}ms ease-out;
        pointer-events: none;
        margin: 0;
        transform: none;
        filter: ${grayscale ? 'grayscale(1)' : 'none'};
      `;

      const originalImg = overlay.querySelector('img');
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #050606;';
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      rootRef.current!.appendChild(animatingOverlay);

      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
        animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
        animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
        animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
        animatingOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;

        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';

        parent.style.setProperty('--rot-y-delta', `0deg`);
        parent.style.setProperty('--rot-x-delta', `0deg`);

        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = '0';
          focusedElRef.current = null;
          rootRef.current?.removeAttribute('data-enlarging');

          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';

            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true') {
                  document.body.classList.remove('dg-scroll-lock');
                }
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener('transitionend', cleanup, {
        once: true
      });
    };

    scrim.addEventListener('click', close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale]);

  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = Date.now();
    lockScroll();
    const parent = el.parentElement as HTMLElement;
    focusedElRef.current = el;
    el.setAttribute('data-focused', 'true');
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, effectiveSegments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference opacity-0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);

    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef.current = {
      left: tileR.left,
      top: tileR.top,
      width: tileR.width,
      height: tileR.height
    };
    el.style.visibility = 'hidden';
    el.style.zIndex = '0';
    const sourceImage = el.querySelector('img') as HTMLImageElement | null;
    const rawSrc = parent.dataset.src || sourceImage?.src || '';
    const rawAlt = parent.dataset.alt || sourceImage?.alt || '';
    const img = document.createElement('img');
    img.alt = rawAlt;
    img.style.cssText = `width:100%; height:100%; object-fit:contain; background:#050606; filter:${grayscale ? 'grayscale(1)' : 'none'};`;
    const imageAspect =
      sourceImage && sourceImage.naturalWidth > 0 && sourceImage.naturalHeight > 0
        ? sourceImage.naturalWidth / sourceImage.naturalHeight
        : tileR.width / tileR.height;
    const targetSize = getAspectFitRect(frameR.width, frameR.height, imageAspect);
    const targetLeft = frameR.left - mainR.left + (frameR.width - targetSize.width) / 2;
    const targetTop = frameR.top - mainR.top + (frameR.height - targetSize.height) / 2;
    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.dataset.aspect = String(imageAspect);
    overlay.style.cssText = `position:absolute; left:${targetLeft}px; top:${targetTop}px; width:${targetSize.width}px; height:${targetSize.height}px; opacity:0; z-index:30; will-change:transform,opacity; transform-origin:top left; transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease; border-radius:${openedImageBorderRadius}; overflow:hidden; background:#050606; box-shadow:0 10px 30px rgba(0,0,0,.35);`;
    img.addEventListener('load', () => {
      if (img.naturalWidth <= 0 || img.naturalHeight <= 0 || !overlay.parentElement) return;
      const loadedAspect = img.naturalWidth / img.naturalHeight;
      const currentAspect = Number.parseFloat(overlay.dataset.aspect ?? '');
      if (Math.abs(loadedAspect - currentAspect) < 0.01) return;

      const fitted = getAspectFitRect(frameR.width, frameR.height, loadedAspect);
      overlay.dataset.aspect = String(loadedAspect);
      overlay.style.left = `${frameR.left - mainR.left + (frameR.width - fitted.width) / 2}px`;
      overlay.style.top = `${frameR.top - mainR.top + (frameR.height - fitted.height) / 2}px`;
      overlay.style.width = `${fitted.width}px`;
      overlay.style.height = `${fitted.height}px`;
    });
    img.src = rawSrc;
    overlay.appendChild(img);
    viewerRef.current!.appendChild(overlay);
    const tx0 = tileR.left - mainR.left - targetLeft;
    const ty0 = tileR.top - mainR.top - targetTop;
    const sx0 = tileR.width / targetSize.width;
    const sy0 = tileR.height / targetSize.height;

    const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;
    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);
    const wantsResize = openedImageWidth || openedImageHeight;
    if (wantsResize) {
      const onFirstEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== 'transform') return;
        overlay.removeEventListener('transitionend', onFirstEnd);
        const prevTransition = overlay.style.transition;
        overlay.style.transition = 'none';
        const tempWidth = openedImageWidth || `${frameR.width}px`;
        const tempHeight = openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tempWidth;
        overlay.style.height = tempHeight;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = frameR.width + 'px';
        overlay.style.height = frameR.height + 'px';
        void overlay.offsetWidth;
        overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
        const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;
        requestAnimationFrame(() => {
          overlay.style.left = `${centeredLeft}px`;
          overlay.style.top = `${centeredTop}px`;
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
        });
        const cleanupSecond = () => {
          overlay.removeEventListener('transitionend', cleanupSecond);
          overlay.style.transition = prevTransition;
        };
        overlay.addEventListener('transitionend', cleanupSecond, {
          once: true
        });
      };
      overlay.addEventListener('transitionend', onFirstEnd);
    }
  };

  useEffect(() => {
    const retryBlinkTimers = retryBlinkTimersRef.current;
    const retryTimers = retryTimersRef.current;

    return () => {
      document.body.classList.remove('dg-scroll-lock');
      retryBlinkTimers.forEach(timer => window.clearTimeout(timer));
      retryBlinkTimers.clear();
      retryTimers.forEach(timer => window.clearTimeout(timer));
      retryTimers.clear();
    };
  }, []);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
      transform: translateY(var(--stage-y, 0px));
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      contain: layout paint style;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    
    @media (max-aspect-ratio: 1/1) {
      .viewer-frame {
        height: 100% !important;
        width: 100% !important;
      }
    }
    
    // body.dg-scroll-lock {
    //   position: fixed !important;
    //   top: 0;
    //   left: 0;
    //   width: 100% !important;
    //   height: 100% !important;
    //   overflow: hidden !important;
    //   touch-action: none !important;
    //   overscroll-behavior: contain !important;
    // }
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      isolation: isolate;
      contain: paint;
      background:
        linear-gradient(145deg, rgba(14, 16, 16, 0.94), rgba(24, 28, 28, 0.88)),
        linear-gradient(135deg, rgba(242, 237, 228, 0.04), rgba(199, 154, 49, 0.05));
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    }
    .item__image::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        135deg,
        rgba(255, 105, 180, 0.8),
        rgba(255, 194, 92, 0.88),
        rgba(118, 255, 214, 0.82),
        rgba(108, 162, 255, 0.82),
        rgba(255, 105, 180, 0.8)
      );
      background-size: 220% 220%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 180ms ease;
      pointer-events: none;
    }
    .item__image::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        linear-gradient(135deg, rgba(255, 99, 171, 0.08), transparent 34%),
        linear-gradient(315deg, rgba(103, 224, 255, 0.08), transparent 40%);
      opacity: 0;
      transition: opacity 180ms ease;
      pointer-events: none;
    }
    .item__image[data-loading='true']::before,
    .item__image[data-loading='true']::after {
      opacity: 1;
    }
    .item__image[data-loading-animated='true']::before {
      animation: dg-border-spectrum 3200ms linear infinite;
      will-change: background-position;
    }
    .item__image[data-loading='true'] {
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.08),
        0 0 12px rgba(255, 110, 199, 0.08),
        0 0 18px rgba(93, 176, 255, 0.06);
    }
    .item__image[data-loading-animated='true'] {
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.09),
        0 0 16px rgba(255, 110, 199, 0.1),
        0 0 22px rgba(255, 194, 92, 0.08),
        0 0 28px rgba(93, 176, 255, 0.08);
    }
    .item__image[data-retrying='true']::before,
    .item__image[data-retrying='true']::after {
      animation-duration: 900ms;
      opacity: 1;
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
    .item__media {
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: opacity 220ms ease;
    }
    .item__loading-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      background:
        radial-gradient(circle at 22% 18%, rgba(255, 121, 198, 0.16), transparent 30%),
        radial-gradient(circle at 80% 24%, rgba(255, 201, 102, 0.14), transparent 32%),
        radial-gradient(circle at 54% 82%, rgba(90, 218, 255, 0.12), transparent 34%),
        linear-gradient(140deg, rgba(36, 18, 48, 0.28), rgba(31, 49, 72, 0.22) 44%, rgba(16, 18, 18, 0.16));
      opacity: 0;
      transition: opacity 180ms ease, filter 180ms ease;
    }
    .item__loading-overlay::before {
      content: '';
      position: absolute;
      inset: -35%;
      background:
        linear-gradient(
          112deg,
          transparent 16%,
          rgba(255, 107, 183, 0.04) 30%,
          rgba(255, 211, 97, 0.34) 45%,
          rgba(97, 236, 255, 0.26) 56%,
          rgba(120, 165, 255, 0.08) 65%,
          transparent 80%
        );
      transform: translateX(-62%) rotate(8deg);
    }
    .item__loading-overlay::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 30%, rgba(0, 0, 0, 0.12));
      opacity: 0.9;
    }
    .item__loading-overlay[data-visible='true'] {
      opacity: 1;
    }
    .item__loading-overlay[data-animated='true']::before {
      animation: dg-tile-sheen 1700ms ease-in-out infinite;
      will-change: transform;
    }
    .item__loading-overlay[data-retrying='true'] {
      animation: dg-retry-blink 220ms steps(2, end) 1;
      filter: saturate(1.15);
    }
    @keyframes dg-tile-sheen {
      0% {
        transform: translateX(-62%) rotate(8deg);
      }
      100% {
        transform: translateX(62%) rotate(8deg);
      }
    }
    @keyframes dg-retry-blink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.22;
      }
    }
    @keyframes dg-border-spectrum {
      0% {
        background-position: 0% 50%;
      }
      100% {
        background-position: 200% 50%;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={customStyle(
          {
            '--segments-x': effectiveSegments,
            '--segments-y': effectiveSegments,
            '--overlay-blur-color': overlayBlurColor,
            '--tile-radius': imageBorderRadius,
            '--enlarge-radius': openedImageBorderRadius,
            '--image-filter': grayscale ? 'grayscale(1)' : 'none'
          }
        )}
      >
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <div
            className="absolute inset-[12%] m-auto z-[1] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 48%, rgba(199,154,49,0.16), transparent 36%), radial-gradient(circle at 50% 52%, rgba(242,237,228,0.08), transparent 52%)',
              filter: 'blur(38px)',
              transform: 'scale(1.04)'
            }}
          />
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => {
                const isImageActive = activeImageSources.has(it.src);
                const isImageLoaded = Boolean(loadedImageSources[it.src]);
                const isRetryBlinking = Boolean(retryBlinkSources[it.src]);
                const showLoadingOverlay = !isImageLoaded;
                const animateLoadingTile = (isImageActive && !isImageLoaded) || isRetryBlinking;
                const priorityIndex = imageSourcePriority[it.src] ?? Number.MAX_SAFE_INTEGER;
                const fetchPriority = priorityIndex < Math.min(INITIAL_ACTIVE_IMAGE_COUNT, 24) ? 'high' : 'auto';

                return (
                  <div
                    key={`${it.x},${it.y},${i}`}
                    className="sphere-item absolute m-auto"
                    data-src={it.src}
                    data-alt={it.alt}
                    data-offset-x={it.x}
                    data-offset-y={it.y}
                    data-size-x={it.sizeX}
                    data-size-y={it.sizeY}
                    style={customStyle(
                      {
                        '--offset-x': it.x,
                        '--offset-y': it.y,
                        '--item-size-x': it.sizeX,
                        '--item-size-y': it.sizeY,
                        top: '-999px',
                        bottom: '-999px',
                        left: '-999px',
                        right: '-999px'
                      }
                    )}
                  >
                    <div
                      className="item__image absolute block overflow-hidden cursor-pointer bg-[#171a1a] transition-transform duration-300"
                      data-loading={showLoadingOverlay}
                      data-loading-animated={animateLoadingTile}
                      data-retrying={isRetryBlinking}
                      role="button"
                      tabIndex={0}
                      aria-label={it.alt || 'Open image'}
                      onClick={e => {
                        if (draggingRef.current) return;
                        if (movedRef.current) return;
                        if (e.timeStamp - lastDragEndAt.current < 80) return;
                        if (openingRef.current) return;
                        openItemFromElement(e.currentTarget as HTMLElement);
                      }}
                      onPointerUp={e => {
                        if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') return;
                        if (draggingRef.current) return;
                        if (movedRef.current) return;
                        if (e.timeStamp - lastDragEndAt.current < 80) return;
                        if (openingRef.current) return;
                        openItemFromElement(e.currentTarget as HTMLElement);
                      }}
                      style={{
                        inset: '10px',
                        borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      <div
                        className="item__loading-overlay"
                        data-visible={showLoadingOverlay}
                        data-animated={animateLoadingTile}
                        data-retrying={isRetryBlinking}
                        aria-hidden="true"
                      />
                      {isImageActive ? (
                        <img
                          key={`${it.src}-${imageRetryKeys[it.src] ?? 0}`}
                          src={it.src}
                          draggable={false}
                          alt={it.alt}
                          loading="eager"
                          decoding="async"
                          fetchPriority={fetchPriority}
                          onLoad={() => markImageLoaded(it.src)}
                          onError={() => scheduleImageRetry(it.src)}
                          className="item__media object-cover"
                          style={{
                            opacity: isImageLoaded ? 1 : 0,
                            backfaceVisibility: 'hidden',
                            filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`
                          }}
                        />
                      ) : (
                        <div
                          className="item__media"
                          aria-hidden="true"
                          style={{
                            opacity: 0
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`
            }}
          />

          <div
            className="absolute inset-0 m-auto z-[3] pointer-events-none"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              backdropFilter: 'blur(3px)'
            }}
          />

          <div
            className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
            }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`
            }}
          />

          <div
            ref={viewerRef}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ padding: 'var(--viewer-pad)' }}
          >
            <div
              ref={scrimRef}
              className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(3px)'
              }}
            />
            <div
              ref={frameRef}
              className="viewer-frame h-full w-full flex"
              style={{
                borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
