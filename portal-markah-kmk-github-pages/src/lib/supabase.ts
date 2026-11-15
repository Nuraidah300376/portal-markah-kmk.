import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface PelajarKmkRecord {
  id?: string | number;
  nama: string | null;
  kelas: string | null;
  markah: number | string | null;
  [key: string]: unknown;
}

function extractCleanUrlCandidate(raw: string): string {
  const trimmed = raw.trim().replace(/^['"<>]+|['"<>]+$/g, '');
  const markdownMatch = trimmed.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/i);
  if (markdownMatch) {
    return markdownMatch[2].trim();
  }
  return trimmed;
}

const rawSupabaseUrl = extractCleanUrlCandidate(
  import.meta.env.VITE_SUPABASE_URL ?? ''
);
const rawSupabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
)
  .trim()
  .replace(/^['"]|['"]$/g, '');

function isPlaceholderValue(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    !normalized ||
    normalized.includes('your-') ||
    normalized.includes('your_') ||
    normalized.includes('my_supabase') ||
    normalized === 'undefined' ||
    normalized === 'null'
  );
}

function parseSupabaseBaseUrl(value: string): {
  baseUrl: string;
  hasExtraPath: boolean;
} {
  if (!value || isPlaceholderValue(value)) {
    return { baseUrl: '', hasExtraPath: false };
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { baseUrl: '', hasExtraPath: false };
    }

    const hasExtraPath =
      (parsed.pathname !== '' && parsed.pathname !== '/') ||
      parsed.search !== '' ||
      parsed.hash !== '';

    return {
      baseUrl: parsed.origin,
      hasExtraPath,
    };
  } catch {
    return { baseUrl: '', hasExtraPath: false };
  }
}

function looksLikeSecretKey(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.startsWith('sb_secret_') ||
    normalized.includes('service_role')
  );
}

const { baseUrl: supabaseBaseUrl, hasExtraPath: supabaseUrlHasExtraPath } =
  parseSupabaseBaseUrl(rawSupabaseUrl);

export { supabaseUrlHasExtraPath };

export const supabaseUrlMissing = !supabaseBaseUrl;

export const supabaseKeyMissing =
  isPlaceholderValue(rawSupabasePublishableKey) ||
  looksLikeSecretKey(rawSupabasePublishableKey);

export const isUsingForbiddenSecretKey = looksLikeSecretKey(
  rawSupabasePublishableKey
);

export const isSupabaseConfigured =
  !supabaseUrlMissing && !supabaseKeyMissing;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseBaseUrl, rawSupabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getPasswordRecoveryRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/reset-password';
  }
  return `${window.location.origin}/reset-password`;
}

export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Proses pengesahan gagal. Sila cuba sebentar lagi.';
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid path specified in request url')) {
    return 'Alamat VITE_SUPABASE_URL mengandungi laluan tambahan yang tidak sah. Pastikan nilainya ialah alamat asas projek Supabase sahaja (tanpa /rest/v1/ atau /auth/v1/).';
  }
  if (lower.includes('invalid login credentials')) {
    return 'E-mel atau kata laluan tidak sah. Sila semak semula maklumat log masuk anda.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Akaun e-mel anda belum disahkan. Sila semak peti masuk e-mel untuk pautan pengesahan.';
  }
  if (
    lower.includes('new password should be different from the old password') ||
    lower.includes('same password')
  ) {
    return 'Kata laluan baharu mestilah berbeza daripada kata laluan lama anda.';
  }
  if (
    lower.includes('password should be at least') ||
    lower.includes('weak password')
  ) {
    return 'Kata laluan baharu tidak memenuhi syarat keselamatan minimum (sekurang-kurangnya 6 aksara).';
  }
  if (
    lower.includes('email link is invalid or has expired') ||
    lower.includes('otp_expired') ||
    lower.includes('token has expired')
  ) {
    return 'Pautan tetapan semula kata laluan tidak sah atau telah tamat tempoh. Sila minta pautan baharu.';
  }
  if (lower.includes('auth session missing')) {
    return 'Sesi pemulihan tidak ditemui atau telah tamat tempoh. Sila buka semula pautan daripada e-mel atau minta pautan baharu.';
  }
  if (lower.includes('for security purposes, you can only request this after')) {
    return 'Atas sebab keselamatan, sila tunggu sebentar sebelum menghantar permintaan tetapan semula yang seterusnya.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Terlalu banyak percubaan dibuat. Sila tunggu beberapa minit sebelum mencuba semula.';
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network')
  ) {
    return 'Sambungan ke pelayan pengesahan Supabase gagal. Sila semak sambungan internet dan nilai VITE_SUPABASE_URL anda.';
  }
  if (lower.includes('invalid api key') || lower.includes('apikey')) {
    return 'Kunci pengesahan Supabase tidak sah. Sila pastikan VITE_SUPABASE_PUBLISHABLE_KEY ditetapkan dengan betul.';
  }

  return message
    ? `Pengesahan gagal: ${message}`
    : 'Permintaan pengesahan gagal. Sila cuba semula.';
}

export function formatDatabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Gagal membaca rekod daripada pangkalan data Supabase.';
  }

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message
      : '';
  const code =
    'code' in error && typeof error.code === 'string' ? error.code : '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid path specified in request url')) {
    return 'Alamat VITE_SUPABASE_URL mengandungi laluan tambahan yang tidak sah. Pastikan nilainya ialah alamat asas projek Supabase sahaja (tanpa /rest/v1/ atau /auth/v1/).';
  }
  if (
    code === '42P01' ||
    lower.includes('does not exist') ||
    lower.includes('could not find the table')
  ) {
    return 'Jadual public.pelajar_kmk tidak ditemukan dalam pangkalan data Supabase. Sila pastikan jadual telah dicipta.';
  }
  if (
    code === '42501' ||
    lower.includes('permission denied') ||
    lower.includes('row-level security')
  ) {
    return 'Akses kepada jadual public.pelajar_kmk ditolak oleh dasar keselamatan (RLS). Sila pastikan dasar SELECT untuk pengguna yang disahkan telah diaktifkan.';
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network')
  ) {
    return 'Sambungan ke pangkalan data Supabase terputus atau gagal. Sila semak sambungan rangkaian anda.';
  }

  return message
    ? `Ralat pangkalan data: ${message}`
    : 'Gagal memuatkan data markah daripada Supabase.';
}
