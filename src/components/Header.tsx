import { BookOpen, LogOut, Settings2 } from 'lucide-react';

interface HeaderProps {
  userEmail?: string | null;
  isConfigured: boolean;
  isSigningOut: boolean;
  showGuide: boolean;
  onToggleGuide: () => void;
  onSignOut: () => void;
}

export function Header({
  userEmail,
  isConfigured,
  isSigningOut,
  showGuide,
  onToggleGuide,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-rose-200/70 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zon 1: Jenama */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white"
            aria-hidden="true"
          >
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            Portal Markah KMK
          </span>
        </div>

        {/* Zon 2: Konteks ringkas tanpa kapsul/pil */}
        <nav
          aria-label="Status akaun"
          className="hidden min-w-0 items-center gap-4 text-sm text-slate-600 md:flex"
        >
          {userEmail ? (
            <span className="max-w-xs truncate font-medium text-slate-700">
              {userEmail}
            </span>
          ) : (
            <span className="whitespace-nowrap text-slate-500">
              {isConfigured
                ? 'Semakan Rekod Pelajar'
                : 'Konfigurasi Diperlukan'}
            </span>
          )}
        </nav>

        {/* Zon 3: Satu tindakan utama */}
        <div className="flex items-center shrink-0">
          {userEmail ? (
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm font-semibold text-rose-900 transition-colors hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <LogOut className="h-4 w-4 text-rose-700" aria-hidden="true" />
              <span>{isSigningOut ? 'Sedang Keluar...' : 'Log Keluar'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleGuide}
              aria-expanded={showGuide}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
            >
              <Settings2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <span>{showGuide ? 'Tutup Panduan' : 'Panduan Konfigurasi'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
