import { useState, type FormEvent } from 'react';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import backgroundImage from '@/assets/BG.png';
import { Button } from '@/components/ui/button';
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
    return (
      <main className="grid min-h-screen place-items-center bg-[#121414] px-6 text-[#e2e2e2]">
        <p className="text-sm text-[#999999]">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#121414] text-[#e2e2e2]">
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto px-3 py-4 sm:px-6 sm:py-8 md:px-12">
        <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="pointer-events-none absolute inset-0 bg-[#121414]/78" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(212,165,66,0.2),transparent_30%),radial-gradient(circle_at_80%_72%,rgba(52,213,154,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(212,165,66,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,165,66,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative mx-auto flex w-full max-w-[1200px] items-center justify-center py-2 sm:py-4 lg:py-8">
          <div className="grid w-full min-w-0 gap-6 sm:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <div className="flex min-w-0 max-w-xl flex-col items-center justify-between px-0 py-2 text-center sm:px-4 sm:py-6 md:px-8 lg:items-start lg:py-8 lg:text-left">
              <div>
                <Button
                  asChild
                  variant="outline"
                  className="border-[#3f3a34] text-[#e2e2e2] hover:bg-[#1a1c1c] hover:text-[#f4d27a]"
                >
                  <Link to="/">
                    <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                    Home
                  </Link>
                </Button>

                <div className="mt-6 sm:mt-10 lg:mt-12">
                  <p className="text-xl font-bold tracking-[0.18em] sm:text-2xl sm:tracking-widest">College Rage</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#d4a542] sm:mt-3 sm:text-sm sm:tracking-widest">Relive the glory</p>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-center">
              <div className="w-full max-w-[28rem] min-w-0 border border-[#2e2e2e] bg-[#171919]/90 p-5 backdrop-blur-sm sm:p-8">
                <p className="text-xs uppercase tracking-[0.25em] text-[#d4a542]">{isSignIn ? 'Sign in' : 'Sign up'}</p>
                <h2 className="mt-4 font-heading text-3xl text-[#f5f1ea]">
                  {isSignIn ? 'Welcome back' : 'Secure the dashboard'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#999999]">
                  {isSignIn
                    ? 'Use your Neon Auth credentials to continue.'
                    : 'Start with a secure Neon Auth account and move into the admin dashboard.'}
                </p>

                {error ? (
                  <div className="mt-6 break-words border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}

                <form className="mt-6 flex min-w-0 flex-col gap-5 sm:mt-8 sm:gap-6" onSubmit={handleSubmit}>
                  {!isSignIn ? (
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#e2e2e2]">
                      Name
                      <input
                        className="w-full min-w-0 border border-[#3f3a34] bg-transparent px-3 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#d4a542] focus:ring-1 focus:ring-[#d4a542] sm:px-4"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          validateFieldChange('name', event.target.value);
                        }}
                        placeholder="Your name"
                        type="text"
                        aria-invalid={Boolean(validationErrors.name)}
                      />
                      {validationErrors.name ? (
                        <span className="text-xs font-medium text-destructive">{validationErrors.name}</span>
                      ) : null}
                    </label>
                  ) : null}

                  <label className="flex flex-col gap-2 text-sm font-medium text-[#e2e2e2]">
                    Email
                    <input
                      className="w-full min-w-0 border border-[#3f3a34] bg-transparent px-3 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#d4a542] focus:ring-1 focus:ring-[#d4a542] sm:px-4"
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
                    {validationErrors.email ? (
                      <span className="text-xs font-medium text-destructive">{validationErrors.email}</span>
                    ) : null}
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-medium text-[#e2e2e2]">
                    Password
                    <input
                      className="w-full min-w-0 border border-[#3f3a34] bg-transparent px-3 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#d4a542] focus:ring-1 focus:ring-[#d4a542] sm:px-4"
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
                    {validationErrors.password ? (
                      <span className="text-xs font-medium text-destructive">{validationErrors.password}</span>
                    ) : null}
                  </label>

                  <Button
                    className="h-12 border-[#d4a542] bg-[#d4a542] text-[#161310] hover:bg-[#e2b85f]"
                    disabled={authMutation.isPending}
                    type="submit"
                  >
                    {isSignIn ? (
                      <LogIn aria-hidden="true" data-icon="inline-start" />
                    ) : (
                      <UserPlus aria-hidden="true" data-icon="inline-start" />
                    )}
                    {authMutation.isPending ? 'Please wait' : isSignIn ? 'Sign in' : 'Sign up'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-[#999999] sm:mt-8">
                  {isSignIn ? "Don't have an account?" : 'Already have an account?'}
                  <Link
                    className="ml-2 text-[#d4a542] transition-colors hover:text-[#ebc97d]"
                    to={isSignIn ? '/auth/sign-up' : '/auth/sign-in'}
                  >
                    {isSignIn ? 'Sign up' : 'Sign in'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
