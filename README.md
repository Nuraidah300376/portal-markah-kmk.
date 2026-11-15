# Portal Markah KMK

Aplikasi latihan markah pelajar berasaskan React, Vite dan Supabase.

## Sambungan Supabase
Aplikasi menggunakan dua pemboleh ubah ketika pembinaan:
- `VITE_SUPABASE_URL`: URL asas projek Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: kunci publishable untuk akses pelayar.

Konfigurasikan kedua-duanya dalam GitHub **Settings → Secrets and variables → Actions → Variables**. Nilai akan digunakan oleh aliran kerja `.github/workflows/deploy.yml` sewaktu GitHub Actions membina aplikasi.

**Jangan simpan Secret Key, Service Role Key atau kata laluan dalam repositori.** Keizinan akses data perlu dikawal dalam Supabase melalui RLS.

## GitHub Pages
Aplikasi dibina menggunakan `npm run build` dan hasil dalam folder `dist` diterbitkan secara automatik oleh GitHub Actions apabila cabang `main` dikemas kini.

## Pembangunan setempat
```sh
npm install
npm run dev
```

Untuk pembangunan setempat, tetapkan kedua-dua pemboleh ubah `VITE_SUPABASE_...` dalam fail `.env.local` yang tidak dimuat naik ke GitHub.

Ini ialah prototaip pembelajaran. Gunakan data simulasi sahaja sehingga ujian identiti dan dasar RLS selesai.
