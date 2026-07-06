import { useState } from 'react';
import AnalyticsPageViewsChart from '@/features/analytics/components/AnalyticsPageViewsChart';
import AnalyticsVisitorList from '@/features/analytics/components/AnalyticsVisitorList';
import type { AnalyticsRange } from '@/features/analytics/analytics.types';

const AnalyticsPage = () => {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [page, setPage] = useState(1);

  const handleRangeChange = (nextRange: AnalyticsRange) => {
    setRange(nextRange);
    setPage(1);
  };

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Analytics</p>
        <h1 className="mt-3 font-heading text-4xl text-[#f2ede4]">Visitor insights</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#beb7af]">
          Track how people move through the site with page-view trends and a visitor-level activity list backed by the
          raw analytics events already captured in the app.
        </p>
      </div>

      <section className="grid gap-5">
        <AnalyticsPageViewsChart range={range} onRangeChange={handleRangeChange} />
        <AnalyticsVisitorList range={range} page={page} onPageChange={setPage} />
      </section>
    </div>
  );
};

export default AnalyticsPage;
