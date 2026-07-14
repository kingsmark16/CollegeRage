import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/services/analytics.service';

let lastTrackedPath = '';
let lastTrackedAt = 0;

const AnalyticsTracker = () => {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    if (lastTrackedPathRef.current === path) {
      return;
    }

    const now = Date.now();

    if (lastTrackedPath === path && now - lastTrackedAt < 30_000) {
      return;
    }

    lastTrackedPathRef.current = path;
    lastTrackedPath = path;
    lastTrackedAt = now;

    void trackPageView({
      path,
      title: document.title,
      referrer: document.referrer,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }).catch(() => undefined);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
