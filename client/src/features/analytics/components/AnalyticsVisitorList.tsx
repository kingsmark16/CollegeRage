import { ChevronLeft, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnalyticsRange } from '../analytics.types';
import { useVisitorList } from '../hooks/useVisitorList';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const truncateValue = (value: string, length = 10) =>
  value.length > length ? `${value.slice(0, length)}...` : value;

const hashPattern = /^[a-f0-9]{64}$/i;

const formatIpAddress = (value: string | null) => {
  if (!value || hashPattern.test(value)) {
    return 'Unavailable';
  }

  return value;
};

type AnalyticsVisitorListProps = {
  range: AnalyticsRange;
  page: number;
  onPageChange: (page: number) => void;
};

const AnalyticsVisitorList = ({ range, page, onPageChange }: AnalyticsVisitorListProps) => {
  const visitorListQuery = useVisitorList(range, page, 10);
  const visitorList = visitorListQuery.data;
  const visitors = visitorList?.visitors ?? [];

  return (
    <article className="min-w-0 overflow-hidden border border-white/10 bg-[#151818] p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Visitor list</p>
            <h2 className="mt-4 text-2xl font-semibold text-[#f2ede4]">Tracked visitors</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#beb7af]">
              Visitor-level summaries for the selected range, including anonymous browsing and authenticated admin visits.
            </p>
          </div>

          <div className="text-sm text-[#beb7af]">
            {visitorList ? `${visitorList.totalVisitors.toLocaleString()} visitors in ${range.toUpperCase()}` : 'Loading visitors'}
          </div>
        </div>

        {visitorListQuery.error ? (
          <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {visitorListQuery.error instanceof Error ? visitorListQuery.error.message : 'Unable to load visitors.'}
          </div>
        ) : null}

        {visitorListQuery.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16 w-full bg-white/5" />
            <Skeleton className="h-16 w-full bg-white/5" />
            <Skeleton className="h-16 w-full bg-white/5" />
          </div>
        ) : visitors.length > 0 ? (
          <>
            <div className="max-w-full overflow-x-auto border border-white/10 bg-[#111414]">
              <table className="w-max min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-[#8f887e]">
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Visitor</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Status</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Views</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Sessions</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">IP</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">User agent</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Latest path</th>
                    <th className="whitespace-nowrap px-3 py-3 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor.visitorId} className="border-b border-white/10 align-top last:border-b-0">
                      <td className="max-w-[220px] px-3 py-3">
                        <p className="truncate text-sm font-semibold text-[#f2ede4]">
                          {visitor.userEmail ?? `Visitor ${truncateValue(visitor.visitorKey, 12)}`}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-[11px] text-[#8f887e]">
                          First seen {formatDateTime(visitor.firstSeenAt)}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em]',
                            visitor.isAuthenticated
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-white/10 bg-[#151818] text-[#beb7af]'
                          )}
                        >
                          {visitor.isAuthenticated ? <ShieldCheck className="size-3" /> : <Globe className="size-3" />}
                          {visitor.isAuthenticated ? 'Auth' : 'Anon'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-[#f2ede4]">
                        {visitor.pageViewCount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-[#f2ede4]">
                        {visitor.sessionCount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-[#beb7af]">
                        {formatIpAddress(visitor.ipHash)}
                      </td>
                      <td className="max-w-[320px] px-3 py-3">
                        <p className="truncate text-xs text-[#beb7af]" title={visitor.userAgent ?? 'Unavailable'}>
                          {visitor.userAgent || 'Unavailable'}
                        </p>
                      </td>
                      <td className="max-w-[240px] px-3 py-3">
                        <p className="truncate text-sm font-medium text-[#f2ede4]" title={visitor.latestPath}>
                          {visitor.latestPath}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-[#8f887e]" title={visitor.latestTitle ?? undefined}>
                          {visitor.latestTitle || 'No title captured'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-[#beb7af]">
                        {formatDateTime(visitor.lastSeenAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#8f887e]">
                Page {visitorList?.page ?? page} of {visitorList?.totalPages ?? 1}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-[#121515] text-[#beb7af] hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]"
                  disabled={page <= 1 || visitorListQuery.isFetching}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft />
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-[#121515] text-[#beb7af] hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]"
                  disabled={page >= (visitorList?.totalPages ?? 1) || visitorListQuery.isFetching}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-white/15 bg-[#121515] px-6 py-14 text-center text-sm text-[#beb7af]">
            No visitors have been tracked yet for this range.
          </div>
        )}
      </div>
    </article>
  );
};

export default AnalyticsVisitorList;
