import { type FormEvent, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  formatAuthError,
  getPasswordRecoveryRedirectUrl,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { ConfigNotice } from './ConfigNotice';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordView({ onBackToLogin }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage(
        'Konfigurasi Supabase belum lengkap. Sila tetapkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY terlebih dahulu.'
      );
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Sila masukkan alamat e-mel akaun anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getPasswordRecoveryRedirectUrl(),
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      setSentEmail(trimmedEmail);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Kolum Kiri: Panduan Permintaan Tetapan Semula */}
      <div className="space-y-8 lg:col-span-6 lg:pt-4">
        <div className="space-y-4">
          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-emerald-800 transition-colors hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Kembali ke Log Masuk</span>
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl">
            Tetapkan semula kata laluan akaun KMK anda.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-600">
            Masukkan alamat e-mel yang berdaftar dengan akaun anda. Supabase
            Authentication akan menghantar pautan pemulihan rasmi terus ke peti
            masuk anda.
          </p>
        </div>

        <dl className="divide-y divide-rose-100 border-y border-rose-100 text-sm">
          <div className="flex items-start gap-3 py-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <dt className="font-semibold text-slate-900">
                Pautan Pemulihan Terhad Masa
              </dt>
              <dd className="mt-0.5 leading-relaxed text-slate-600">
                Pautan yang dihantar hanya sah untuk satu sesi pemulihan dan akan
                membawa anda ke halaman penetapan kata laluan baharu.
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3 py-4">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-700"
              aria-hidden="true"
            />
            <div>
              <dt className="font-semibold text-slate-900">
                Semak Folder Peti Masuk atau Spam
              </dt>
              <dd className="mt-0.5 leading-relaxed text-slate-600">
                Jika e-mel tidak kelihatan selepas beberapa minit, sila semak
                folder Spam/Junk atau pastikan alamat e-mel yang dimasukkan
                adalah tepat.
              </dd>
            </div>
          </div>
        </dl>

        {!isSupabaseConfigured && <ConfigNotice variant="inline" />}
      </div>

      {/* Kolum Kanan: Kad Permintaan E-mel Tetapan Semula */}
      <div className="lg:col-span-6">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-rose-200/80 bg-white shadow-sm lg:ml-auto lg:mr-0">
          <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Lupa Kata Laluan
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Minta pautan tetapan semula kata laluan melalui e-mel.
            </p>
          </div>

          {sentEmail ? (
            <div className="space-y-5 p-6 sm:p-8">
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <p className="font-semibold">
                    Permintaan tetapan semula telah dihantar
                  </p>
                  <p className="leading-relaxed text-emerald-900">
                    Jika akaun berdaftar wujud untuk{' '}
                    <span className="font-semibold break-all">{sentEmail}</span>,
                    pautan tetapan semula kata laluan telah dihantar ke alamat
                    e-mel tersebut.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                Sila buka e-mel daripada Supabase dan klik pautan yang disediakan
                untuk menetapkan kata laluan baharu anda.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setSentEmail(null);
                    setErrorMessage(null);
                  }}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
                >
                  Hantar Semula
                </button>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap"
                >
                  Kembali ke Log Masuk
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8" noValidate>
              {!isSupabaseConfigured && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-sm text-rose-900"
                >
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-700"
                    aria-hidden="true"
                  />
                  <p>
                    Fungsi ini dinyahaktifkan sementara kerana konfigurasi Supabase
                    belum lengkap.
                  </p>
                </div>
              )}

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
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-slate-800"
                >
                  Alamat E-mel Berdaftar
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={!isSupabaseConfigured || isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelajar@contoh.edu.my"
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isSupabaseConfigured || isSubmitting}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 whitespace-nowrap"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isSubmitting
                    ? 'Sedang Menghantar...'
                    : 'Hantar Pautan Tetapan Semula'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
