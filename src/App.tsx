import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AlertCircle } from 'lucide-react';
import { ConfigNotice } from './components/ConfigNotice';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { RecoveryView } from './components/RecoveryView';
import { ScoreDashboard } from './components/ScoreDashboard';
import { formatAuthError, isSupabaseConfigured, supabase } from './lib/supabase';

type AuthScreen = 'login' | 'forgot-password' | 'recovery';

interface InitialRecoveryContext {
  isRecoveryRoute: boolean;
  tokenHash: string | null;
  urlType: string | null;
  urlError: string | null;
}

function readInitialRecoveryContext(): InitialRecoveryContext {
  if (typeof window === 'undefined') {
    return {
      isRecoveryRoute: false,
      tokenHash: null,
      urlType: null,
      urlError: null,
    };
  }

  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search);

  const urlType = hashParams.get('type') ?? searchParams.get('type');
  const tokenHash = searchParams.get('token_hash');
  const urlError =
    hashParams.get('error_description') ??
    searchParams.get('error_description') ??
    hashParams.get('error') ??
    searchParams.get('error');

  const isRecoveryRoute =
    normalizedPath === '/reset-password' ||
    urlType === 'recovery' ||
    Boolean(urlError);

  return {
    isRecoveryRoute,
    tokenHash,
    urlType,
    urlError,
  };
}

function clearRecoveryUrlParams() {
  if (typeof window === 'undefined') return;
  if (
    window.location.pathname !== '/' ||
    window.location.search !== '' ||
    window.location.hash !== ''
  ) {
    window.history.replaceState({}, '', '/');
  }
}

export default function App() {
  const [initialContext] = useState<InitialRecoveryContext>(() =>
    readInitialRecoveryContext()
  );
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<AuthScreen>(() =>
    initialContext.isRecoveryRoute ? 'recovery' : 'login'
  );
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(
    isSupabaseConfigured
  );
  const [isVerifyingRecoveryLink, setIsVerifyingRecoveryLink] =
    useState<boolean>(
      isSupabaseConfigured && initialContext.isRecoveryRoute && !initialContext.urlError
    );
  const [recoveryLinkError, setRecoveryLinkError] = useState<string | null>(() =>
    initialContext.urlError
      ? formatAuthError({ message: initialContext.urlError })
      : null
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsCheckingSession(false);
      setIsVerifyingRecoveryLink(false);
      return;
    }

    let isMounted = true;

    async function initializeAuth() {
      try {
        if (initialContext.urlError) {
          setIsVerifyingRecoveryLink(false);
          setIsCheckingSession(false);
          return;
        }

        // Sokong templat e-mel token_hash (?token_hash=...&type=recovery)
        if (
          initialContext.tokenHash &&
          initialContext.urlType === 'recovery'
        ) {
          const { data: verifyData, error: verifyError } =
            await supabase!.auth.verifyOtp({
              token_hash: initialContext.tokenHash,
              type: 'recovery',
            });

          if (!isMounted) return;

          if (verifyError) {
            setRecoveryLinkError(formatAuthError(verifyError));
            setScreen('recovery');
            setIsVerifyingRecoveryLink(false);
            setIsCheckingSession(false);
            return;
          }

          setSession(verifyData.session ?? null);
          setScreen('recovery');
          setIsVerifyingRecoveryLink(false);
          setIsCheckingSession(false);
          return;
        }

        const { data, error } = await supabase!.auth.getSession();
        if (!isMounted) return;

        if (error) {
          if (initialContext.isRecoveryRoute) {
            setRecoveryLinkError(formatAuthError(error));
          } else {
            setSessionError(
              'Gagal mengesahkan sesi sedia ada. Sila log masuk semula.'
            );
          }
          setSession(null);
        } else {
          setSession(data.session ?? null);
        }
      } catch (err) {
        if (!isMounted) return;
        if (initialContext.isRecoveryRoute) {
          setRecoveryLinkError(formatAuthError(err));
        } else {
          setSessionError(
            'Tidak dapat menghubungi pelayan pengesahan Supabase.'
          );
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
          setIsVerifyingRecoveryLink(false);
        }
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession ?? null);
      setSessionError(null);
      setIsCheckingSession(false);

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryLinkError(null);
        setIsVerifyingRecoveryLink(false);
        setScreen('recovery');
      } else if (event === 'SIGNED_OUT') {
        setScreen((prev) => (prev === 'recovery' ? 'login' : prev));
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialContext]);

  const handleBackToLogin = useCallback(() => {
    clearRecoveryUrlParams();
    setRecoveryLinkError(null);
    setScreen('login');
  }, []);

  const handleOpenForgotPassword = useCallback(() => {
    clearRecoveryUrlParams();
    setRecoveryLinkError(null);
    setScreen('forgot-password');
  }, []);

  const handleContinueToDashboard = useCallback(() => {
    clearRecoveryUrlParams();
    setRecoveryLinkError(null);
    setScreen('login');
  }, []);

  async function handleSignOut() {
    if (!supabase) return;
    setIsSigningOut(true);
    setSessionError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setSessionError(`Proses log keluar gagal: ${error.message}`);
        return;
      }
      clearRecoveryUrlParams();
      setSession(null);
      setScreen('login');
    } catch {
      setSessionError('Ralat rangkaian berlaku semasa proses log keluar.');
    } finally {
      setIsSigningOut(false);
    }
  }

  const showRecoveryScreen = screen === 'recovery';
  const showDashboard = Boolean(session) && !showRecoveryScreen;

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBFC] text-slate-900">
      <Header
        userEmail={session?.user?.email ?? null}
        isConfigured={isSupabaseConfigured}
        isSigningOut={isSigningOut}
        showGuide={showGuide}
        onToggleGuide={() => setShowGuide((prev) => !prev)}
        onSignOut={() => void handleSignOut()}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {sessionError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
              aria-hidden="true"
            />
            <p>{sessionError}</p>
          </div>
        )}

        {showGuide && !session && (
          <div className="mb-8">
            <ConfigNotice variant="panel" />
          </div>
        )}

        {isCheckingSession ? (
          <div
            aria-busy="true"
            className="mx-auto max-w-md rounded-2xl border border-rose-100 bg-white p-8 shadow-xs"
          >
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-40 rounded bg-rose-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-11 w-full rounded-xl bg-slate-100" />
              <div className="h-11 w-full rounded-xl bg-emerald-100" />
            </div>
          </div>
        ) : showRecoveryScreen ? (
          <RecoveryView
            session={session}
            isVerifyingLink={isVerifyingRecoveryLink}
            linkError={recoveryLinkError}
            onRequestNewLink={handleOpenForgotPassword}
            onBackToLogin={handleBackToLogin}
            onContinueToDashboard={handleContinueToDashboard}
          />
        ) : showDashboard && session ? (
          <ScoreDashboard
            session={session}
            isSigningOut={isSigningOut}
            onSignOut={() => void handleSignOut()}
          />
        ) : screen === 'forgot-password' ? (
          <ForgotPasswordView onBackToLogin={handleBackToLogin} />
        ) : (
          <LoginView onForgotPassword={handleOpenForgotPassword} />
        )}
      </main>

      <footer className="border-t border-rose-100 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Portal Markah KMK · Latihan Pembangunan Aplikasi Pendidikan</span>
          <span>Pengesahan &amp; Dasar Keselamatan Baris (RLS) oleh Supabase</span>
        </div>
      </footer>
    </div>
  );
}
