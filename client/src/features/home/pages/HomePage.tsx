import { ArrowRight, LogIn, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero.png';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

const HomePage = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const dashboardHref = isAdmin ? '/admin' : '/auth/sign-in';

  return (
    <main className="min-h-screen bg-[#161513] text-[#f4efe7]">
      <section className="relative min-h-screen overflow-hidden">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(218,165,32,0.26),transparent_32%),linear-gradient(180deg,rgba(22,21,19,0.72),rgba(22,21,19,0.96))]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between border-b border-white/10 py-4">
            <div>
              <p className="text-lg font-semibold uppercase tracking-[0.28em] text-[#f4efe7]">College Rage</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#c7bfb2]">Relive the glory</p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="border-[#4a4339] text-[#f4efe7] hover:bg-[#231f1a]">
                <Link to="/auth/sign-in">
                  <LogIn aria-hidden="true" data-icon="inline-start" />
                  Sign in
                </Link>
              </Button>
              <Button asChild className="border-[#b88928] bg-[#b88928] text-[#171411] hover:bg-[#d4a542]">
                <Link to={dashboardHref}>
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.32em] text-[#d4a542]">Public home</p>
              <h1 className="mt-5 max-w-3xl font-heading text-5xl leading-tight sm:text-6xl">
                The home page everyone can enter, with the admin path kept separate and clean.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#d2cbc2] sm:text-lg">
                Visitors land here first. Anonymous users can explore the public front door, while the admin gets a
                dedicated private dashboard with media tooling, Dropbox setup, and backend verification.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="border-[#b88928] bg-[#b88928] text-[#171411] hover:bg-[#d4a542]">
                  <Link to={dashboardHref}>
                    <ArrowRight aria-hidden="true" data-icon="inline-start" />
                    {isLoading ? 'Checking session' : user && isAdmin ? 'Open dashboard' : 'Admin sign in'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-[#4a4339] text-[#f4efe7] hover:bg-[#231f1a]">
                  <Link to="/auth/sign-up">Create account</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <article className="border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4a542]">Public</p>
                <h2 className="mt-3 text-xl font-semibold">Home for everyone</h2>
                <p className="mt-3 text-sm leading-7 text-[#c7bfb2]">
                  Anonymous visitors can reach the site without bumping into admin tools or auth-only workflows.
                </p>
              </article>
              <article className="border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4a542]">Auth</p>
                <h2 className="mt-3 text-xl font-semibold">Dedicated sign-in and sign-up</h2>
                <p className="mt-3 text-sm leading-7 text-[#c7bfb2]">
                  Auth routes stay focused, and signed-in admin visits get redirected straight to the dashboard.
                </p>
              </article>
              <article className="border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[#d4a542]">Admin</p>
                <h2 className="mt-3 text-xl font-semibold">Private control surface</h2>
                <p className="mt-3 text-sm leading-7 text-[#c7bfb2]">
                  The dashboard becomes the private workspace for media, integrations, and analytics as the app grows.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
