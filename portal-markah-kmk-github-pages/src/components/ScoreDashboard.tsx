import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  AlertCircle,
  FileX2,
  GraduationCap,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  formatDatabaseError,
  type PelajarKmkRecord,
  supabase,
} from '../lib/supabase';

interface ScoreDashboardProps {
  session: Session;
  isSigningOut: boolean;
  onSignOut: () => void;
}

function formatScoreValue(markah: PelajarKmkRecord['markah']): string {
  if (markah === null || markah === undefined || markah === '') {
    return '—';
  }
  return String(markah);
}

export function ScoreDashboard({
  session,
  isSigningOut,
  onSignOut,
}: ScoreDashboardProps) {
  const [records, setRecords] = useState<PelajarKmkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStudentScores = useCallback(async () => {
    if (!supabase) {
      setErrorMessage('Sambungan Supabase belum dikonfigurasikan.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.from('pelajar_kmk').select('*');

      if (error) {
        setErrorMessage(formatDatabaseError(error));
        setRecords([]);
        return;
      }

      setRecords((data as PelajarKmkRecord[] | null) ?? []);
    } catch (err) {
      setErrorMessage(formatDatabaseError(err));
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStudentScores();
  }, [fetchStudentScores, session.user.id]);

  return (
    <div className="space-y-8">
      {/* Tajuk & Tindakan Halaman */}
      <div className="flex flex-col gap-4 border-b border-rose-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-emerald-800">
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Sesi Disahkan
            </span>
            <span aria-hidden="true">·</span>
            <span className="break-all text-slate-600">{session.user.email}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rekod Markah KMK
          </h1>
          <p className="text-sm text-slate-600">
            Paparan rasmi rekod pelajar yang dibenarkan oleh Row Level Security (RLS).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void fetchStudentScores()}
            disabled={isLoading}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 text-emerald-700 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Muat Semula</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm font-semibold text-rose-900 transition-colors hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4 text-rose-700" aria-hidden="true" />
            <span>{isSigningOut ? 'Sedang Keluar...' : 'Log Keluar'}</span>
          </button>
        </div>
      </div>

      {/* Keadaan Memuatkan */}
      {isLoading && (
        <div
          aria-busy="true"
          aria-label="Sedang memuatkan rekod markah"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-xs sm:p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-28 rounded bg-rose-100" />
              <div className="h-7 w-3/4 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="h-10 w-24 rounded bg-emerald-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keadaan Ralat Pangkalan Data */}
      {!isLoading && errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">
                  Gagal Membaca Rekod Markah
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void fetchStudentScores()}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Cuba Lagi</span>
            </button>
          </div>
        </div>
      )}

      {/* Keadaan Rekod Kosong */}
      {!isLoading && !errorMessage && records.length === 0 && (
        <div className="rounded-2xl border border-rose-200/80 bg-white p-8 text-center shadow-xs sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <FileX2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Tiada rekod markah ditemukan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Tiada baris data dalam jadual{' '}
            <code className="font-mono text-xs text-slate-800">
              public.pelajar_kmk
            </code>{' '}
            yang dipautkan atau dibenarkan oleh RLS untuk akaun{' '}
            <span className="font-medium text-slate-800">{session.user.email}</span>.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => void fetchStudentScores()}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap"
            >
              <RefreshCw className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <span>Semak Semula</span>
            </button>
          </div>
        </div>
      )}

      {/* Paparan Kad Markah Pelajar */}
      {!isLoading && !errorMessage && records.length > 0 && (
        <div className="space-y-6">
          <div
            className={
              records.length === 1
                ? 'max-w-2xl'
                : 'grid grid-cols-1 gap-6 md:grid-cols-2'
            }
          >
            {records.map((record, index) => {
              const cardKey =
                record.id !== undefined && record.id !== null
                  ? String(record.id)
                  : `rekod-${index}`;

              return (
                <article
                  key={cardKey}
                  className="overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-xs"
                >
                  {/* Jalur kepala lembut merah jambu */}
                  <div className="flex items-center justify-between gap-4 border-b border-rose-100 bg-rose-50/50 px-6 py-4">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-rose-950">
                      <GraduationCap
                        className="h-4 w-4 text-emerald-700"
                        aria-hidden="true"
                      />
                      <span>Kad Markah Pelajar</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      Baca Sahaja
                    </span>
                  </div>

                  {/* Isi kad: Nama, Kelas, Markah */}
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-xs font-medium text-slate-500">
                            Nama Pelajar
                          </dt>
                          <dd className="mt-1 text-xl font-bold text-slate-900">
                            {record.nama || 'Tidak dinyatakan'}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs font-medium text-slate-500">
                            Kelas
                          </dt>
                          <dd className="mt-1 text-base font-semibold text-slate-800">
                            {record.kelas || 'Tidak dinyatakan'}
                          </dd>
                        </div>
                      </dl>

                      <div className="border-t border-rose-100 pt-4 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0 sm:text-right">
                        <p className="text-xs font-medium text-slate-500">
                          Markah KMK
                        </p>
                        <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-emerald-700 tabular-nums sm:text-5xl">
                          {formatScoreValue(record.markah)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>
              Data dipaparkan terus daripada jadual{' '}
              <code className="font-mono text-slate-700">public.pelajar_kmk</code>{' '}
              mengikut dasar RLS akaun anda.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
