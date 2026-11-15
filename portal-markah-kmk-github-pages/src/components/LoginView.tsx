import { type FormEvent, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  formatAuthError,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { ConfigNotice } from './ConfigNotice';

interface LoginViewProps {
  onForgotPassword: () => void;
}

export function LoginView({ onForgotPassword }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (!trimmedEmail || !password) {
      setErrorMessage('Sila masukkan alamat e-mel dan kata laluan anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      // Kosongkan kata laluan daripada memori komponen sebaik log masuk berjaya
      setPassword('');
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Kolum Kiri: Pengenalan Portal & Status Konfigurasi */}
      <div className="space-y-8 lg:col-span-6 lg:pt-4">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-800">
            Sistem Semakan Rekod Pelajar
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl">
            Semak markah KMK anda dengan selamat dan terus daripada pangkalan data.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-600">
            Log masuk menggunakan akaun e-mel pelajar yang berdaftar untuk melihat
            rekod nama, kelas dan markah anda. Setiap paparan dilindungi oleh
            pengesahan Supabase dan dasar Row Level Security (RLS).
          </p>
        </div>

        {/* Garis panduan ringkas tanpa kad bersarang */}
        <dl className="divide-y divide-rose-100 border-y border-rose-100 text-sm">
          <div className="flex items-start gap-3 py-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <dt className="font-semibold text-slate-900">
                Akses Terhad Kepada Rekod Sendiri
              </dt>
              <dd className="mt-0.5 leading-relaxed text-slate-600">
                Hanya rekod daripada jadual{' '}
                <code className="font-mono text-xs text-slate-800">
                  public.pelajar_kmk
                </code>{' '}
                yang dibenarkan oleh RLS untuk sesi anda akan dipaparkan.
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3 py-4">
            <Lock
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-700"
              aria-hidden="true"
            />
            <div>
              <dt className="font-semibold text-slate-900">
                Paparan Baca Sahaja (Read-Only)
              </dt>
              <dd className="mt-0.5 leading-relaxed text-slate-600">
                Kata laluan tidak disimpan secara manual dalam pelayar dan rekod
                markah tidak boleh diubah atau dipadam oleh pelajar.
              </dd>
            </div>
          </div>
        </dl>

        {!isSupabaseConfigured && <ConfigNotice variant="inline" />}
      </div>

      {/* Kolum Kanan: Kad Log Masuk */}
      <div className="lg:col-span-6">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-rose-200/80 bg-white shadow-sm lg:ml-auto lg:mr-0">
          <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Log Masuk Pelajar
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Masukkan e-mel dan kata laluan akaun KMK anda.
            </p>
          </div>

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
                  Borang log masuk dinyahaktifkan sementara kerana konfigurasi
                  Supabase belum lengkap.
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
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-800"
              >
                Alamat E-mel
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Kata Laluan
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-semibold text-emerald-800 transition-colors hover:text-emerald-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
                >
                  Lupa kata laluan?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={!isSupabaseConfigured || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata laluan anda"
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={!isSupabaseConfigured || isSubmitting}
                  aria-label={
                    showPassword
                      ? 'Sembunyikan kata laluan'
                      : 'Tunjukkan kata laluan'
                  }
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSupabaseConfigured || isSubmitting}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 whitespace-nowrap"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Sedang Mengesahkan...' : 'Log Masuk'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
