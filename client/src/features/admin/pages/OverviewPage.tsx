import { BarChart3, Cloud, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

const OverviewPage = () => {
  const { apiUser, error, user } = useAuthSession();
  const { connectDropboxMutation, verifyApiMutation } = useAuthActions();
  const isBusy = connectDropboxMutation.isPending || verifyApiMutation.isPending;

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
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
            <p className="mt-4 text-lg font-semibold">Admin shell is ready for expansion</p>
            <p className="mt-3 text-sm leading-7 text-[#beb7af]">
              Your private area now has a stable structure for media management, soundtrack uploads, and future
              moderation tools.
            </p>
          </article>

          <article className="border border-white/10 bg-[#151818] p-6">
            <div className="flex items-center gap-3 text-[#c79a31]">
              <BarChart3 className="size-5" />
              <p className="text-xs uppercase tracking-[0.24em]">Analytics</p>
            </div>
            <p className="mt-4 text-lg font-semibold">Visitor insights can slot in cleanly</p>
            <p className="mt-3 text-sm leading-7 text-[#beb7af]">
              The dashboard shell gives analytics its own home when you are ready to surface page views, sessions, and
              track engagement data.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
