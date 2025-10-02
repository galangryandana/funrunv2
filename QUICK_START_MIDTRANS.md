# ⚡ Quick Start - Midtrans Payment Gateway

## 🎯 Yang HARUS Anda Lakukan Sekarang

### 1. Daftar & Dapatkan API Keys Midtrans

```
🌐 Buka: https://dashboard.midtrans.com/register
📧 Daftar dengan email Anda
✅ Verifikasi email
🔑 Login → Settings → Access Keys
🔄 Toggle ke SANDBOX mode
📋 Copy Client Key & Server Key
```

### 2. Setup Environment Variables

```bash
# Copy file .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local dan isi dengan keys Anda:
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXX (ganti dengan key Anda)
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXX (ganti dengan key Anda)
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka: http://localhost:3000

### 4. Test Payment (Sandbox)

Isi form sampai step terakhir, klik **"Selesaikan Pendaftaran"**

Popup Midtrans akan muncul. Gunakan test credentials:

**Credit Card**:
```
Card: 4811 1111 1111 1114
CVV: 123
Exp: 01/25
OTP: 112233
```

**GoPay/Bank Transfer**: Klik untuk simulasi pembayaran berhasil

---

## 📁 File yang Sudah Dibuat

```
src/
├── lib/
│   └── midtrans.ts                          ✅ Konfigurasi Midtrans
├── types/
│   ├── midtrans.ts                          ✅ TypeScript types
│   └── snap.d.ts                            ✅ Window.snap declaration
├── app/
│   ├── layout.tsx                           ✅ Load Snap.js script
│   ├── page.tsx                             ✅ Integrasi payment form
│   └── api/
│       ├── payment/
│       │   └── create-transaction/
│       │       └── route.ts                 ✅ API create transaction
│       └── webhook/
│           └── midtrans/
│               └── route.ts                 ✅ Webhook handler
```

---

## 🔍 Troubleshooting Cepat

**Snap popup tidak muncul?**
- Cek Console (F12) untuk error
- Pastikan `.env.local` sudah benar
- Refresh browser

**Error "Invalid API key"?**
- Pastikan copy API keys dengan benar
- Pastikan tidak ada spasi di awal/akhir
- Pastikan menggunakan Sandbox keys

**Webhook tidak jalan?**
- Untuk testing lokal, gunakan ngrok (lihat MIDTRANS_SETUP.md)
- Webhook hanya perlu untuk production

---

## 📚 Dokumentasi Lengkap

Baca file **MIDTRANS_SETUP.md** untuk:
- Panduan detail setup
- Testing webhook dengan ngrok
- Deployment ke production
- Troubleshooting lengkap

---

## 🚀 Next Steps

1. ✅ Setup Midtrans API keys
2. ✅ Test pembayaran di Sandbox
3. 📊 (Opsional) Integrasi dengan Google Sheets untuk menyimpan data
4. 🌐 (Opsional) Setup webhook dengan ngrok
5. 🎉 Deploy ke production

---

**Butuh bantuan?** Baca MIDTRANS_SETUP.md atau cek https://docs.midtrans.com/
