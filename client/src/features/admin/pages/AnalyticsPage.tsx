import { Activity, BarChart3 } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Analytics</p>
        <h1 className="mt-3 font-heading text-4xl text-[#f2ede4]">Visitor insights</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#beb7af]">
          This section is reserved for the visitor tracking and playback analytics that will grow out of the raw events
          system already added on the backend.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="border border-white/10 bg-[#151818] p-6">
          <div className="flex items-center gap-3 text-[#c79a31]">
            <BarChart3 className="size-5" />
            <p className="text-xs uppercase tracking-[0.22em]">Already available</p>
          </div>
          <p className="mt-4 text-lg font-semibold">Raw page-view tracking</p>
          <p className="mt-3 text-sm leading-7 text-[#beb7af]">
            The backend can already capture anonymous and authenticated traffic with cookie-based visitor tracking.
          </p>
        </article>

        <article className="border border-white/10 bg-[#151818] p-6">
          <div className="flex items-center gap-3 text-[#c79a31]">
            <Activity className="size-5" />
            <p className="text-xs uppercase tracking-[0.22em]">Next UI step</p>
          </div>
          <p className="mt-4 text-lg font-semibold">Dashboards and summaries</p>
          <p className="mt-3 text-sm leading-7 text-[#beb7af]">
            This shell is ready for top pages, unique visitors, session summaries, and soundtrack engagement metrics.
          </p>
        </article>
      </section>
    </div>
  );
};

export default AnalyticsPage;
