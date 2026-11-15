import { type FormEvent, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from 'lucide-react';
import {
  formatAuthError,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

interface RecoveryViewProps {
  session: Session | null;
  isVerifyingLink: boolean;
  linkError: string | null;
  onRequestNewLink: () => void;
  onBackToLogin: () => void;
  onContinueToDashboard: () => void;
}

export function RecoveryView({
  session,
  isVerifyingLink,
  linkError,
  onRequestNewLink,
  onBackToLogin,
  onContinueToDashboard,
}: RecoveryViewProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Konfigurasi Supabase belum lengkap.');
      return;
    }

    if (!session) {
      setErrorMessage(
        'Sesi pemulihan tidak sah atau telah tamat tempoh. Sila minta pautan tetapan semula baharu.'
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage(
        'Sila masukkan kata laluan baharu dan pengesahan kata laluan.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        'Kata laluan baharu mestilah mengandungi sekurang-kurangnya 6 aksara.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'Kata laluan baharu dan pengesahan kata laluan tidak sepadan.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      // Kosongkan input kata laluan daripada memori sebaik berjaya dikemas kini
      setNewPassword('');
      setConfirmPassword('');
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-sm">
        <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h1 className="text-xl font-semibold text-slate-900">
              Pemulihan Kata Laluan
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {session?.user?.email
              ? `Akaun disahkan: ${session.user.email}`
              : 'Tetapkan kata laluan baharu untuk akaun Portal Markah KMK anda.'}
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {isVerifyingLink ? (
            <div
              aria-busy="true"
              className="space-y-4 py-4 text-center"
            >
              <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-rose-100" />
              <p className="text-sm font-medium text-slate-700">
                Sedang mengesahkan pautan pemulihan daripada Supabase...
              </p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-6">
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Kata laluan baharu berjaya disimpan
                  </p>
                  <p className="leading-relaxed text-emerald-900">
                    Anda boleh terus menyemak rekod markah anda sekarang atau log
                    masuk semula pada sesi akan datang menggunakan kata laluan
                    baharu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onContinueToDashboard}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap"
              >
                Teruskan ke Portal Markah
              </button>
            </div>
          ) : linkError || !session ? (
            <div className="space-y-6">
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold">Pautan Pemulihan Tidak Sah</p>
                  <p className="leading-relaxed">
                    {linkError ??
                      'Sesi pemulihan tidak ditemui atau pautan telah tamat tempoh. Sila minta pautan tetapan semula kata laluan yang baharu.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRequestNewLink}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap"
                >
                  Minta Pautan Baharu
                </button>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-rose-300 hover:bg-rose-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Kembali ke Log Masuk</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-900"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
                    aria-hidden="true"
                  />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="recovery-new-password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Kata Laluan Baharu
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="recovery-new-password"
                    name="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 aksara"
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={
                      showNewPassword
                        ? 'Sembunyikan kata laluan baharu'
                        : 'Tunjukkan kata laluan baharu'
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="recovery-confirm-password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Sahkan Kata Laluan Baharu
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="recovery-confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulang kata laluan baharu"
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword
                        ? 'Sembunyikan pengesahan kata laluan'
                        : 'Tunjukkan pengesahan kata laluan'
                    }
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 whitespace-nowrap"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isSubmitting
                    ? 'Sedang Mengemas Kini...'
                    : 'Simpan Kata Laluan Baharu'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
