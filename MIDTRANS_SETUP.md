# 🚀 Panduan Setup Midtrans Payment Gateway

## 📋 YANG HARUS ANDA LAKUKAN SECARA MANUAL

### 1️⃣ SETUP AKUN MIDTRANS

#### A. Registrasi & Login
1. Buka https://dashboard.midtrans.com/register
2. Daftar dengan email bisnis Anda
3. Verifikasi email
4. Login ke dashboard Midtrans

#### B. Dapatkan API Keys (Sandbox Mode)
1. Setelah login, pergi ke **Settings** → **Access Keys**
2. Toggle mode ke **Sandbox** (untuk testing)
3. Copy kredensial berikut:
   - **Client Key** (contoh: `SB-Mid-client-xxxxx`)
   - **Server Key** (contoh: `SB-Mid-server-xxxxx`)

---

### 2️⃣ SETUP ENVIRONMENT VARIABLES

1. Copy file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

2. Buka file `.env.local` dan isi dengan API keys Midtrans Anda:

```env
# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_ACTUAL_CLIENT_KEY
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_ACTUAL_SERVER_KEY
MIDTRANS_IS_PRODUCTION=false

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

⚠️ **PENTING**: Ganti `YOUR_ACTUAL_CLIENT_KEY` dan `YOUR_ACTUAL_SERVER_KEY` dengan keys yang Anda dapatkan dari dashboard Midtrans.

---

### 3️⃣ JALANKAN DEVELOPMENT SERVER

```bash
npm run dev
```

Buka browser: http://localhost:3000

---

### 4️⃣ TEST PEMBAYARAN (SANDBOX MODE)

Gunakan test credentials berikut untuk testing:

#### Credit Card Test
- **Card Number**: `4811 1111 1111 1114`
- **CVV**: `123`
- **Expiry Date**: `01/25` (atau bulan/tahun yang valid)
- **OTP**: `112233`

#### GoPay Test
- Pilih GoPay, akan muncul QR code simulasi
- Klik "Lanjutkan" untuk simulasi sukses

#### Transfer Bank Test
- Pilih bank transfer
- Akan muncul nomor Virtual Account untuk simulasi

**Dokumentasi lengkap test credentials**: https://docs.midtrans.com/docs/testing-payment

---

### 5️⃣ TESTING WEBHOOK (OPSIONAL - Untuk Testing Lokal)

Webhook Midtrans akan mengirim notifikasi ke server Anda ketika status pembayaran berubah.

#### Menggunakan Ngrok untuk Expose Local Server

1. **Install Ngrok**:
   - Mac: `brew install ngrok`
   - Download dari: https://ngrok.com/download

2. **Expose Local Server**:
```bash
ngrok http 3000
```

3. **Copy Forwarding URL** yang muncul (contoh: `https://abcd1234.ngrok.io`)

4. **Set Webhook URL di Midtrans Dashboard**:
   - Login ke https://dashboard.midtrans.com/
   - Pergi ke **Settings** → **Configuration**
   - Di bagian **Payment Notification URL**, masukkan:
     ```
     https://abcd1234.ngrok.io/api/webhook/midtrans
     ```
   - Klik **Save**

5. **Test Payment** dan lihat console log untuk notifikasi webhook

---

### 6️⃣ PERUBAHAN HARGA PENDAFTARAN (OPSIONAL)

Jika Anda ingin mengubah harga pendaftaran, edit file:

**File**: `src/app/api/payment/create-transaction/route.ts`

```typescript
// Baris ~26-28
const grossAmount = formData.participantCategory === 'student' 
  ? 75000   // Ubah harga pelajar di sini
  : 150000; // Ubah harga umum di sini
```

---

## 🎉 DEPLOYMENT KE PRODUCTION

### Switch ke Production Mode

#### 1. Verifikasi Akun Midtrans
- Di dashboard Midtrans, lengkapi verifikasi bisnis
- Tunggu approval dari tim Midtrans

#### 2. Dapatkan Production API Keys
- Toggle mode dari **Sandbox** ke **Production**
- Copy Production Client Key & Server Key

#### 3. Update Environment Variables
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_CLIENT_KEY
MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_SERVER_KEY
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### 4. Update Script Snap.js
Edit file `src/app/layout.tsx`, ganti URL Snap.js:

**Dari (Sandbox)**:
```tsx
src="https://app.sandbox.midtrans.com/snap/snap.js"
```

**Ke (Production)**:
```tsx
src="https://app.midtrans.com/snap/snap.js"
```

#### 5. Set Production Webhook URL
Di Midtrans Dashboard → Settings → Configuration:
```
https://yourdomain.com/api/webhook/midtrans
```

---

## 🐛 TROUBLESHOOTING

### Issue: Snap popup tidak muncul
**Solusi**:
1. Buka DevTools (F12) → Console tab
2. Cek apakah ada error
3. Pastikan Snap.js script sudah ter-load (Network tab)
4. Pastikan environment variables sudah benar

### Issue: "Invalid signature" di webhook
**Solusi**:
- Pastikan Server Key yang digunakan sesuai environment (sandbox/production)
- Cek apakah Server Key di `.env.local` sudah benar

### Issue: Transaction error
**Solusi**:
1. Cek console log di browser dan terminal
2. Pastikan API keys valid
3. Cek apakah form data lengkap (email, nama, dll)

---

## 📚 REFERENSI

- **Midtrans Dashboard**: https://dashboard.midtrans.com/
- **Midtrans Docs**: https://docs.midtrans.com/
- **Snap API Docs**: https://snap-docs.midtrans.com/
- **Test Credentials**: https://docs.midtrans.com/docs/testing-payment

---

## ✅ CHECKLIST SEBELUM GO-LIVE

- [ ] Akun Midtrans sudah terverifikasi
- [ ] Production API keys sudah didapat
- [ ] Environment variables production sudah di-set
- [ ] Script Snap.js sudah menggunakan production URL
- [ ] Webhook URL production sudah terdaftar di dashboard
- [ ] Test pembayaran dengan production credentials berhasil
- [ ] SSL Certificate aktif (HTTPS wajib untuk production)
- [ ] Monitoring & logging siap

---

## 💡 TIPS

1. **Selalu test di Sandbox dulu** sebelum ke production
2. **Jangan commit API keys** ke Git (sudah di-gitignore)
3. **Monitor webhook logs** untuk debug masalah pembayaran
4. **Simpan transaction logs** untuk referensi dan audit
5. **Backup data** sebelum deployment production

---

## 📞 SUPPORT

Jika ada masalah:
1. Cek dokumentasi Midtrans: https://docs.midtrans.com/
2. Contact Midtrans support: support@midtrans.com
3. Midtrans Slack Community: midtrans.slack.com

---

**Selamat mencoba! 🎉**
