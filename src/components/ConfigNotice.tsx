import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  isSupabaseConfigured,
  isUsingForbiddenSecretKey,
  supabaseKeyMissing,
  supabaseUrlHasExtraPath,
  supabaseUrlMissing,
} from '../lib/supabase';

interface ConfigNoticeProps {
  variant?: 'inline' | 'panel';
}

export function ConfigNotice({ variant = 'panel' }: ConfigNoticeProps) {
  return (
    <section
      aria-label="Maklumat konfigurasi Supabase"
      className={
        variant === 'inline'
          ? 'rounded-xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6'
          : 'rounded-2xl border border-rose-200 bg-white p-6 shadow-xs sm:p-8'
      }
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
          {isSupabaseConfigured ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-700" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              {isSupabaseConfigured
                ? 'Konfigurasi Sambungan Supabase Aktif'
                : 'Konfigurasi Supabase Belum Lengkap'}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {isSupabaseConfigured
                ? 'Pemboleh ubah persekitaran pelanggan telah dikesan. Log masuk akan disahkan terus dengan projek Supabase anda.'
                : 'Aplikasi ini belum disambungkan ke mana-mana projek Supabase. Sila tetapkan dua pemboleh ubah persekitaran berikut sebelum membuat log masuk:'}
            </p>
          </div>

          {supabaseUrlHasExtraPath && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <p>
                Nilai <code className="font-mono text-xs">VITE_SUPABASE_URL</code>{' '}
                dikesan mempunyai laluan tambahan (seperti{' '}
                <code className="font-mono text-xs">/rest/v1/</code> atau{' '}
                <code className="font-mono text-xs">/auth/v1/</code>). Aplikasi
                telah menormalkannya kepada alamat asas projek secara automatik,
                namun anda disyorkan mengemas kini nilai tersebut kepada alamat
                asas projek sahaja.
              </p>
            </div>
          )}

          {isUsingForbiddenSecretKey && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-900"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
              <p>
                Kunci rahsia (<code className="font-mono text-xs">service_role</code> atau{' '}
                <code className="font-mono text-xs">sb_secret_</code>) tidak dibenarkan dalam aplikasi pelanggan. Sila tukar kepada{' '}
                <strong>Publishable Key</strong> (atau <code className="font-mono text-xs">anon</code> key) sahaja.
              </p>
            </div>
          )}

          <div className="divide-y divide-rose-100 rounded-xl border border-rose-100 bg-[#FDFBFC]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <code className="font-mono text-xs font-semibold text-slate-800 sm:text-sm">
                VITE_SUPABASE_URL
              </code>
              <span
                className={
                  supabaseUrlMissing
                    ? 'font-medium text-rose-800'
                    : 'font-medium text-emerald-800'
                }
              >
                {supabaseUrlMissing ? 'Belum ditetapkan / tidak sah' : 'Telah dikonfigurasikan'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <code className="font-mono text-xs font-semibold text-slate-800 sm:text-sm">
                VITE_SUPABASE_PUBLISHABLE_KEY
              </code>
              <span
                className={
                  supabaseKeyMissing
                    ? 'font-medium text-rose-800'
                    : 'font-medium text-emerald-800'
                }
              >
                {supabaseKeyMissing ? 'Belum ditetapkan / tidak sah' : 'Telah dikonfigurasikan'}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              Cara mengisi konfigurasi dengan selamat:
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 leading-relaxed">
              <li>
                Buka papan pemuka projek Supabase anda dan pergi ke{' '}
                <span className="font-medium text-slate-800">
                  Project Settings &rarr; API / Data API
                </span>
                .
              </li>
              <li>
                Salin <strong>Project URL</strong> sebagai alamat asas projek
                sahaja (tanpa tambahan{' '}
                <code className="font-mono text-xs">/rest/v1/</code> atau{' '}
                <code className="font-mono text-xs">/auth/v1/</code>) dan masukkan
                ke pemboleh ubah{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                  VITE_SUPABASE_URL
                </code>
                .
              </li>
              <li>
                Salin <strong>Publishable Key</strong> (atau <code className="font-mono text-xs">anon public</code>) ke{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                  VITE_SUPABASE_PUBLISHABLE_KEY
                </code>
                . Jangan sesekali gunakan <code className="font-mono text-xs">service_role</code> atau Secret Key.
              </li>
              <li>
                Dalam Google AI Studio, tambah atau kemas kini kedua-dua
                pemboleh ubah ini melalui panel{' '}
                <span className="font-medium text-slate-800">Secrets / Environment Variables</span>{' '}
                (atau fail <code className="font-mono text-xs">.env</code> tempatan) dan muat semula pratonton.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
