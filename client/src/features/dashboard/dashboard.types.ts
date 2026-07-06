export type DashboardMetricSlice = {
  key: 'images' | 'videos' | 'music';
  label: string;
  count: number;
  sizeBytes: number;
};

export type DashboardOverviewMetrics = {
  dropbox: {
    connected: boolean;
    requiresReconnect: boolean;
    message: string | null;
    usedBytes: number | null;
    allocatedBytes: number | null;
    usagePercent: number | null;
    allocationType: 'individual' | 'team' | 'other' | null;
  };
  media: {
    totalCount: number;
    totalSizeBytes: number;
    imageCount: number;
    imageSizeBytes: number;
    videoCount: number;
    videoSizeBytes: number;
    musicCount: number;
    musicSizeBytes: number;
    breakdown: DashboardMetricSlice[];
  };
};
