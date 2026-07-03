import { BarChart3, Cloud, LogOut, ShieldCheck, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import AdminMusicPanel from '@/features/music/components/AdminMusicPanel';

const DashboardPage = () => {
  const { apiUser, error, user } = useAuthSession();
  const { connectDropboxMutation, signOutMutation, verifyApiMutation } = useAuthActions();
  const isBusy =
    connectDropboxMutation.isPending || signOutMutation.isPending || verifyApiMutation.isPending;

  return (
    <main className="min-h-screen bg-[#0f1111] text-[#f2ede4]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#c79a31]">Admin dashboard</p>
            <h1 className="mt-3 font-heading text-4xl sm:text-5xl">Private workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#beb7af]">
              This area is only for the authenticated admin account. It is ready to host media operations, analytics,
              and future moderation tools without leaking them into the public site.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b]">
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant="outline"
              className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b]"
              onClick={() => void signOutMutation.mutateAsync()}
              disabled={isBusy}
            >
              <LogOut aria-hidden="true" data-icon="inline-start" />
              Sign out
            </Button>
          </div>
        </header>

        {error ? (
          <div className="mt-6 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="border border-white/10 bg-[#151818] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#c79a31]">Session</p>
            <h2 className="mt-3 text-2xl font-semibold">Signed in admin</h2>
            <p className="mt-4 text-sm leading-7 text-[#beb7af]">{user?.email ?? user?.name ?? user?.id}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                className="border-[#c79a31] bg-[#c79a31] text-[#131110] hover:bg-[#dfb24c]"
                onClick={() => void verifyApiMutation.mutateAsync()}
                disabled={isBusy}
              >
                <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                Verify API
              </Button>
              <Button
                variant="outline"
                className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b]"
                onClick={() => void connectDropboxMutation.mutateAsync()}
                disabled={isBusy}
              >
                <Cloud aria-hidden="true" data-icon="inline-start" />
                Connect Dropbox
              </Button>
            </div>

            {apiUser ? (
              <div className="mt-6 border border-[#c79a31]/40 bg-[#c79a31]/8 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d7b15f]">Express API verified</p>
                <p className="mt-2 text-sm text-[#f2ede4]">{apiUser.email ?? apiUser.id}</p>
              </div>
            ) : null}
          </article>

          <div className="grid gap-5">
            <article className="border border-white/10 bg-[#151818] p-6">
              <div className="flex items-center gap-3 text-[#c79a31]">
                <Upload className="size-5" />
                <p className="text-xs uppercase tracking-[0.24em]">Media operations</p>
              </div>
              <p className="mt-4 text-lg font-semibold">Ready for upload management</p>
              <p className="mt-3 text-sm leading-7 text-[#beb7af]">
                Your backend media system is already separated from the public UI, so this dashboard is the right
                place for upload workflows, metadata editing, and deletion tools.
              </p>
            </article>

            <article className="border border-white/10 bg-[#151818] p-6">
              <div className="flex items-center gap-3 text-[#c79a31]">
                <BarChart3 className="size-5" />
                <p className="text-xs uppercase tracking-[0.24em]">Analytics</p>
              </div>
              <p className="mt-4 text-lg font-semibold">Visitor tracking can surface here next</p>
              <p className="mt-3 text-sm leading-7 text-[#beb7af]">
                The raw analytics backend is already in place, and this dashboard now gives us a clean admin-only home
                for page-view metrics and visitor summaries.
              </p>
            </article>
          </div>
        </section>

        <AdminMusicPanel />
      </div>
    </main>
  );
};

export default DashboardPage;
