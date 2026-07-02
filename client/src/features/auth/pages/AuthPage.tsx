import { useState, type FormEvent } from 'react';
import { CheckCircle2, Cloud, LogIn, LogOut, ShieldCheck, UserPlus } from 'lucide-react';
import backgroundImage from '@/assets/BG.png';
import { Button } from '@/components/ui/button';
import { type AuthMode } from '@/services/auth.service';
import type { AuthFieldErrors } from '../schema/auth.validation';
import { validateAuthCredentials, validateAuthField } from '../schema/auth.validation';
import { useAuth } from '../services/useAuth';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<AuthFieldErrors>({});
  const { connectDropbox, error, isLoading, isSubmitting, logOut, submitAuth, user, verifiedApiUser, verifyWithApi } =
    useAuth();

  const isSignIn = mode === 'sign-in';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateAuthCredentials(mode, { email, password, name });

    if (result.errors) {
      setValidationErrors(result.errors);
      return;
    }

    setValidationErrors({});
    void submitAuth(mode, result.credentials);
  };

  const handleModeChange = () => {
    setMode(isSignIn ? 'sign-up' : 'sign-in');
    setValidationErrors({});
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
    <main className="min-h-screen bg-[#121414] text-[#e2e2e2]">
      <section className="relative grid min-h-screen overflow-hidden px-4 py-8 md:px-12">
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#121414]/78" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(147,51,234,0.26),transparent_34%),radial-gradient(circle_at_82%_70%,rgba(52,213,154,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(90,242,180,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(90,242,180,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative mx-auto flex w-full max-w-[1200px] items-center justify-center">
          <div className="w-full max-w-md px-2 py-8 md:px-8">
            <div className="mb-10 flex flex-col items-center gap-3">
              <p className='text-2xl font-bold tracking-widest'>College Rage</p>
              <p className="text-sm font-medium uppercase tracking-widest text-[#c084fc]">Relive the glory</p>
            </div>

            <div className="mb-8 flex flex-col items-center">
              <h1 className="font-heading text-4xl font-semibold text-[#e2e2e2]">
                {user ? 'Session active' : isSignIn ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#999999]">
                {user
                  ? 'Your client session is ready to verify against the Express API.'
                  : isSignIn
                    ? 'Please sign in to your account'
                    : 'Start with a secure Neon Auth account'}
              </p>
            </div>

            {error ? (
              <div className="mb-6 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {user ? (
              <div className="flex flex-col gap-4">
                <div className="border border-[#2e2e2e] bg-[#1a1c1c]/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#999999]">Signed in as</p>
                  <p className="mt-2 text-sm font-medium text-[#e2e2e2]">{user.email ?? user.name ?? user.id}</p>
                </div>

                {verifiedApiUser ? (
                  <div className="border border-[#34d59a]/60 bg-[#34d59a]/10 px-4 py-4">
                    <div className="flex items-center gap-2 text-[#5af2b4]">
                      <CheckCircle2 aria-hidden="true" />
                      <p className="text-xs font-semibold uppercase tracking-widest">Express API verified</p>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#e2e2e2]">
                      {verifiedApiUser.email ?? verifiedApiUser.id}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="border-[#2e2e2e] bg-[#282a2b] text-[#e2e2e2] hover:border-[#34d59a] hover:bg-[#282a2b] hover:text-[#5af2b4]"
                    type="button"
                    onClick={() => void verifyWithApi()}
                    disabled={isSubmitting}
                  >
                    <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                    Verify API
                  </Button>
                  <Button
                    className="border-[#2e2e2e] bg-[#282a2b] text-[#e2e2e2] hover:border-[#34d59a] hover:bg-[#282a2b] hover:text-[#5af2b4]"
                    type="button"
                    onClick={() => void connectDropbox()}
                    disabled={isSubmitting}
                  >
                    <Cloud aria-hidden="true" data-icon="inline-start" />
                    Connect Dropbox
                  </Button>
                  <Button
                    className="border-[#2e2e2e] text-[#e2e2e2] hover:border-[#34d59a] hover:bg-[#1a1c1c] hover:text-[#5af2b4]"
                    type="button"
                    variant="outline"
                    onClick={() => void logOut()}
                    disabled={isSubmitting}
                  >
                    <LogOut aria-hidden="true" data-icon="inline-start" />
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  {!isSignIn ? (
                    <label className="flex flex-col gap-2 text-sm font-medium text-[#e2e2e2]">
                      Name
                      <input
                        className="border border-[#ddb813] bg-transparent px-4 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#34d59a] focus:ring-1 focus:ring-[#34d59a]"
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
                      className="border border-[#ddb813] bg-transparent px-4 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#34d59a] focus:ring-1 focus:ring-[#34d59a]"
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
                      className="border border-[#ddb813] bg-transparent px-4 py-3 text-sm text-[#e2e2e2] outline-none transition-colors placeholder:text-[#999999] focus:border-[#34d59a] focus:ring-1 focus:ring-[#34d59a]"
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
                    className="h-12 border-[#2e2e2e] bg-[#282a2b] text-[#e2e2e2] hover:border-[#34d59a] hover:bg-[#282a2b] hover:text-[#5af2b4]"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSignIn ? (
                      <LogIn aria-hidden="true" data-icon="inline-start" />
                    ) : (
                      <UserPlus aria-hidden="true" data-icon="inline-start" />
                    )}
                    {isSignIn ? 'Sign in' : 'Sign up'}
                  </Button>
                </form>

                <div className="mt-8 text-center text-sm text-[#999999]">
                  {isSignIn ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    className="ml-2 text-[#34d59a] transition-colors hover:text-[#66fcbe]"
                    type="button"
                    onClick={handleModeChange}
                  >
                    {isSignIn ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
