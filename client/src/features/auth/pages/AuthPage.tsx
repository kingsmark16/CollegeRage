import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import backgroundImage from '@/assets/BG.png';
import { Button } from '@/components/ui/button';
import LoadingExperience from '@/components/LoadingExperience';
import type { AuthMode } from '@/services/auth.service';
import { useAuthActions } from '../hooks/useAuthActions';
import { useAuthSession } from '../hooks/useAuthSession';
import type { AuthFieldErrors } from '../schema/auth.validation';
import { validateAuthCredentials, validateAuthField } from '../schema/auth.validation';

type AuthPageProps = {
  mode: AuthMode;
};

const AuthPage = ({ mode }: AuthPageProps) => {
  const isSignIn = mode === 'sign-in';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<AuthFieldErrors>({});
  const { authMutation, submitAuth } = useAuthActions();
  const { error, isLoading } = useAuthSession();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateAuthCredentials(mode, { email, password, name });

    if (result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    setValidationErrors({});
    void submitAuth({
      mode,
      credentials: result.credentials,
    });
  };

  const validateFieldChange = (field: keyof AuthFieldErrors, value: string) => {
    const nextCredentials = {
      email,
      name,
      password,
      [field]: value,
    };

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateAuthField(mode, field, nextCredentials),
    }));
  };

  if (isLoading) {
    return <LoadingExperience variant="session" />;
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#080b0d] text-[#e2e2e2]">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,11,13,0.98)_8%,rgba(8,11,13,0.74)_48%,rgba(8,11,13,0.94)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-[#d4a542]/15 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-[#2d8b75]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(212,165,66,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(212,165,66,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-3 py-3 sm:px-6 sm:py-8 max-[400px]:px-2 max-[400px]:py-2">
        <div className="w-full min-w-0 max-w-md">
          <div className="mb-4 flex min-w-0 items-center justify-between gap-2 sm:mb-6 max-[400px]:mb-2">
            <Button
              asChild
              variant="outline"
              className="h-9 shrink-0 rounded-full border-white/15 bg-black/20 px-3 text-xs text-[#c9c4bb] backdrop-blur-md hover:border-[#d4a542]/60 hover:bg-[#d4a542]/10 hover:text-[#f4d27a] max-[400px]:h-7 max-[400px]:px-2.5 max-[400px]:text-[10px]"
            >
              <Link to="/">
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                Home
              </Link>
            </Button>
            <div className="flex min-w-0 items-center justify-end truncate text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9b927f] sm:text-[10px] sm:tracking-[0.2em]">
              <Sparkles aria-hidden="true" className="size-3.5 text-[#d4a542]" />
              <span className="ml-1.5">Private archive</span>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-[#111516]/80 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:rounded-[1.75rem]">
            <div className="border-b border-white/10 px-4 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-8 max-[400px]:px-3 max-[400px]:pb-3 max-[400px]:pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4a542] sm:text-xs sm:tracking-[0.28em]">
                {isSignIn ? 'Return to the archive' : 'Create your access'}
              </p>
              <h1 className="mt-3 font-heading text-[1.7rem] leading-tight text-[#f5f1ea] sm:text-4xl max-[400px]:mt-2 max-[400px]:text-[1.35rem]">
                {isSignIn ? 'Pick up where you left off.' : 'Keep the moment close.'}
              </h1>
              <p className="mt-3 text-[13px] leading-6 text-[#999999] sm:text-sm max-[400px]:mt-1 max-[400px]:text-[11px] max-[400px]:leading-4">
                {isSignIn ? 'Your memories are waiting.' : 'Make a place for the stories worth replaying.'}
              </p>
            </div>

            <div className="px-4 py-5 sm:px-8 sm:py-7 max-[400px]:px-3 max-[400px]:py-3">
              {error ? (
                <div className="mb-5 break-words rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <form className="flex min-w-0 flex-col gap-4 sm:gap-5 max-[400px]:gap-2.5" onSubmit={handleSubmit}>
                {!isSignIn ? (
                  <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c9c4bb]">
                    Name
                    <input
                      className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-normal normal-case tracking-normal text-[#e2e2e2] outline-none transition placeholder:text-[#77736d] focus:border-[#d4a542] focus:bg-[#171b1b] focus:ring-2 focus:ring-[#d4a542]/15 max-[400px]:h-9 max-[400px]:rounded-lg max-[400px]:px-3 max-[400px]:text-xs"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        validateFieldChange('name', event.target.value);
                      }}
                      placeholder="Your name"
                      type="text"
                      aria-invalid={Boolean(validationErrors.name)}
                    />
                    {validationErrors.name ? <span className="text-xs font-medium normal-case tracking-normal text-destructive">{validationErrors.name}</span> : null}
                  </label>
                ) : null}

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c9c4bb]">
                  Email
                  <input
                    className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-normal normal-case tracking-normal text-[#e2e2e2] outline-none transition placeholder:text-[#77736d] focus:border-[#d4a542] focus:bg-[#171b1b] focus:ring-2 focus:ring-[#d4a542]/15 max-[400px]:h-9 max-[400px]:rounded-lg max-[400px]:px-3 max-[400px]:text-xs"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      validateFieldChange('email', event.target.value);
                    }}
                    placeholder="name@company.com"
                    required
                    type="email"
                    aria-invalid={Boolean(validationErrors.email)}
                  />
                  {validationErrors.email ? <span className="text-xs font-medium normal-case tracking-normal text-destructive">{validationErrors.email}</span> : null}
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c9c4bb]">
                  Password
                  <input
                    className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-normal normal-case tracking-normal text-[#e2e2e2] outline-none transition placeholder:text-[#77736d] focus:border-[#d4a542] focus:bg-[#171b1b] focus:ring-2 focus:ring-[#d4a542]/15 max-[400px]:h-9 max-[400px]:rounded-lg max-[400px]:px-3 max-[400px]:text-xs"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      validateFieldChange('password', event.target.value);
                    }}
                    placeholder="Password"
                    required
                    type="password"
                    aria-invalid={Boolean(validationErrors.password)}
                  />
                  {validationErrors.password ? <span className="text-xs font-medium normal-case tracking-normal text-destructive">{validationErrors.password}</span> : null}
                </label>

                <Button
                  className="group mt-2 h-12 rounded-xl border-[#d4a542] bg-[#d4a542] font-semibold text-[#161310] shadow-[0_10px_30px_rgba(212,165,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e2b85f] max-[400px]:mt-1 max-[400px]:h-9 max-[400px]:rounded-lg max-[400px]:text-xs"
                  disabled={authMutation.isPending}
                  type="submit"
                >
                  {isSignIn ? <LogIn aria-hidden="true" data-icon="inline-start" /> : <UserPlus aria-hidden="true" data-icon="inline-start" />}
                  {authMutation.isPending ? 'Please wait' : isSignIn ? 'Enter archive' : 'Create access'}
                  <ArrowRight aria-hidden="true" className="ml-auto size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>

              <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-[#999999] max-[400px]:mt-3 max-[400px]:pt-3 max-[400px]:text-xs">
                {isSignIn ? "Don't have access yet?" : 'Already have access?'}
                <Link
                  className="ml-2 font-semibold text-[#d4a542] transition-colors hover:text-[#ebc97d]"
                  to={isSignIn ? '/auth/sign-up' : '/auth/sign-in'}
                >
                  {isSignIn ? 'Create access' : 'Enter archive'}
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[9px] uppercase tracking-[0.14em] text-[#6f6b63] sm:mt-5 sm:text-[10px] sm:tracking-[0.18em] max-[400px]:mt-2 max-[400px]:hidden">Every moment, still moving.</p>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
