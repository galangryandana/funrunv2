# Trail Run Ranu Segaran 2025 (v2)

Proyek ini adalah turunan mandiri dari portal Fun Run sebelumnya, tetapi disederhanakan menjadi satu halaman registrasi yang didesain ulang (hasil eksplorasi di Claude). Aplikasi tetap menggunakan Next.js 15 (App Router), Tailwind CSS v4, dan `lucide-react` untuk ikon.

## Persyaratan

- Node.js 20 LTS atau lebih baru
- npm 10 (atau gunakan pnpm/bun sesuai preferensi)
- Akun Google untuk membuat Apps Script, Google Sheets, dan folder bukti pembayaran di Drive

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Aplikasi dapat diakses di `http://localhost:3000`. Script tambahan:

- `npm run lint` / `npm run lint:fix` – pengecekan dan perbaikan otomatis ESLint
- `npm run format` / `npm run format:fix` – pengecekan dan format kode via Prettier

## Struktur Direktori Penting

```
src/
  app/
    page.tsx         # Halaman registrasi Trail Run Ranu Segaran 2025
```

## Variabel Lingkungan

Salin `.env.example` menjadi `.env.local` dan isi nilai berikut:

- `NEXT_PUBLIC_SITE_URL` – URL dasar aplikasi (mis. https://funrunnusantara.id)
- `APPS_SCRIPT_ENTRYPOINT` – URL Web App Apps Script

## Catatan

- Komponen form bersifat dummy: data tidak dikirim ke backend, hanya simulasi sukses.
- Sesuaikan validasi atau integrasi API jika ingin menghubungkan ke backend sungguhan.
