# 🧪 Deploy Staging (Vercel + Sandbox Midtrans)

## 🎯 Overview

Deploy ke Vercel sebagai **staging environment** dengan Midtrans Sandbox untuk testing.

```
┌─────────────────────────────────────────┐
│         STAGING (Vercel)                │
│  - Sandbox Midtrans                     │
│  - Test Payments                        │
│  - Webhook Testing                      │
│  - Free Hosting                         │
└─────────────────────────────────────────┘
              ↓
     Test Everything
              ↓
┌─────────────────────────────────────────┐
│      PRODUCTION (Hosting Berbayar)      │
│  - Production Midtrans                  │
│  - Real Payments                        │
│  - Real Users                           │
└─────────────────────────────────────────┘
```

---

## 📋 STEP 1: PUSH KE GITHUB

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/vibecode/fun-run-v2

# Init git jika belum
git init
git add .
git commit -m "Initial commit - Fun Run staging"

# Push ke GitHub
gh auth login
gh repo create fun-run-v2-staging --public --source=. --push

# Atau manual:
# 1. Buat repo di github.com
# 2. Push dengan instruksi yang diberikan
```

---

## 🚀 STEP 2: DEPLOY KE VERCEL

### 2.1 Import Project

1. Buka https://vercel.com/signup
2. **Sign up with GitHub**
3. **Add New Project** → Import `fun-run-v2-staging`
4. Klik **Import**

### 2.2 Environment Variables

**SANGAT PENTING!** Add semua variables ini:

```env
# Midtrans Sandbox
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Google Sheets
APPS_SCRIPT_ENTRYPOINT=https://script.google.com/macros/s/AKfycby.../exec

# Base URL (ganti setelah deploy)
NEXT_PUBLIC_BASE_URL=https://fun-run-v2.vercel.app
```

**Cara Add:**
1. Di halaman import, scroll ke "Environment Variables"
2. Name: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
3. Value: Paste Sandbox Client Key (prefix SB-)
4. Klik "Add"
5. Ulangi untuk semua variable

### 2.3 Deploy!

Klik **"Deploy"** 🚀

Tunggu 2-3 menit...

**Deploy sukses!** URL: `https://fun-run-v2-xxxxx.vercel.app`

---

## 🔧 STEP 3: POST-DEPLOY SETUP

### 3.1 Update Base URL

1. Copy URL Vercel (contoh: `https://fun-run-v2-xxxxx.vercel.app`)
2. **Vercel Dashboard** → Project → Settings → Environment Variables
3. Edit `NEXT_PUBLIC_BASE_URL`
4. Value: `https://fun-run-v2-xxxxx.vercel.app`
5. Save
6. **Deployments** → Latest → ... → **Redeploy**

### 3.2 Set Webhook di Midtrans Sandbox

1. Login https://dashboard.midtrans.com/
2. **Toggle ke SANDBOX** mode (pojok kiri atas)
3. **Settings** → **Configuration**
4. **Payment Notification URL:**
   ```
   https://fun-run-v2-xxxxx.vercel.app/api/webhook/midtrans
   ```
   (Ganti dengan URL Vercel Anda)
5. **Update Settings**

---

## ✅ STEP 4: TESTING

### 4.1 Test Registration

1. Buka URL staging: `https://fun-run-v2-xxxxx.vercel.app`
2. Isi form pendaftaran
3. Klik "Selesaikan Pendaftaran"
4. Popup Snap muncul ✅

### 4.2 Test Payment (Sandbox)

Gunakan test credentials:

**Credit Card:**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Expiry: 01/25
OTP: 112233
```

**QRIS:**
- Scan QR code
- Klik "Simulate payment" untuk sukses

**GoPay:**
- Akan dapat QR code
- Klik link untuk simulasi pembayaran

### 4.3 Test Webhook

1. Complete payment
2. Tunggu 5-10 detik
3. **Cek Google Sheets** → Status harus update jadi SUCCESS ✅
4. **Halaman "Registrasi Berhasil"** muncul ✅

### 4.4 Monitor Webhook

**Vercel Dashboard** → Project → **Monitoring** → **Functions**

Bisa lihat log webhook endpoint.

---

## 🔍 VERIFIKASI

### Checklist Staging:

- [ ] URL staging bisa diakses
- [ ] Form bisa diisi dan submit
- [ ] Popup Snap muncul (sandbox mode)
- [ ] Test payment berhasil (credit card test)
- [ ] Data masuk Google Sheets (status: PENDING)
- [ ] Webhook jalan (status update ke SUCCESS)
- [ ] Halaman "Registrasi Berhasil" tampil
- [ ] No error di browser console
- [ ] No error di Vercel function logs

---

## 📊 MONITORING

### Vercel Dashboard

**Analytics:**
- Pageviews
- Users
- Performance

**Functions:**
- API endpoint logs
- Webhook execution logs
- Error tracking

**Deployments:**
- Build logs
- Deployment history
- Preview deployments

---

## 🔄 CONTINUOUS DEPLOYMENT

Setiap push ke GitHub → Auto deploy!

```bash
# Edit code
vim src/app/page.tsx

# Commit & push
git add .
git commit -m "Update feature X"
git push

# Vercel auto-deploy dalam 2-3 menit
```

Monitor: https://vercel.com/[username]/fun-run-v2/deployments

---

## 🎨 CUSTOM DOMAIN (OPSIONAL)

Bisa pakai subdomain untuk staging:

```
staging.malangfunrun.com → Vercel staging
```

**Setup:**
1. Vercel → Settings → Domains
2. Add: `staging.malangfunrun.com`
3. Update DNS di domain provider:
   - Type: CNAME
   - Name: staging
   - Value: cname.vercel-dns.com
4. Update webhook URL di Midtrans

---

## 🐛 TROUBLESHOOTING

### Issue: Webhook Tidak Jalan

**Check:**
1. Webhook URL di Midtrans benar?
2. Mode Sandbox di Midtrans?
3. Cek Vercel function logs untuk error

**Test manual:**
```bash
curl https://your-staging-url.vercel.app/api/webhook/midtrans
```

Harus return: `{"message":"Midtrans webhook endpoint is active"}`

### Issue: Environment Variables Tidak Terbaca

**Fix:**
1. Vercel → Settings → Environment Variables
2. Pastikan semua variable ada
3. **Redeploy** (Deployments → ... → Redeploy)

### Issue: "Invalid API Key" Error

**Fix:**
- Pastikan pakai Sandbox keys (prefix SB-)
- Pastikan tidak ada spasi di awal/akhir keys
- Re-copy keys dari Midtrans dashboard

### Issue: Payment Method Tidak Muncul

**Fix:**
- Pastikan Snap.js URL = sandbox (app.sandbox.midtrans.com)
- Pastikan Client Key benar dan ada prefix SB-
- Check browser console untuk error

---

## 📝 PRODUCTION NOTES

Saat mau go production (hosting berbayar):

### File yang Perlu Diubah:

**1. `.env` (Production):**
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxx (Production, tanpa SB-)
MIDTRANS_SERVER_KEY=Mid-server-xxx (Production, tanpa SB-)
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_BASE_URL=https://malangfunrun.com
```

**2. `src/app/layout.tsx`:**
```tsx
// Ganti dari:
src="https://app.sandbox.midtrans.com/snap/snap.js"

// Jadi:
src="https://app.midtrans.com/snap/snap.js"
```

**3. Midtrans Dashboard:**
- Toggle ke **PRODUCTION** mode
- Update webhook URL ke production domain

---

## 🎯 BEST PRACTICES

### Branch Strategy

```bash
# Development branch
git checkout -b development
# Push → Vercel preview URL

# Staging branch (main)
git checkout main
git merge development
# Push → Staging URL

# Production branch
git checkout production
git merge main
# Deploy ke hosting berbayar
```

### Testing Checklist

Sebelum merge ke production:

- [ ] Semua fitur tested di staging
- [ ] Payment flow lengkap tested
- [ ] Webhook tested & logs checked
- [ ] Google Sheets integration tested
- [ ] Mobile responsive tested
- [ ] Browser compatibility tested
- [ ] Performance tested (Core Web Vitals)

---

## 💡 TIPS

1. **Gunakan staging URL untuk UAT** (User Acceptance Testing)
2. **Share staging URL** ke teman/tim untuk testing
3. **Monitor Vercel Analytics** untuk track usage
4. **Test di berbagai device** (mobile, tablet, desktop)
5. **Document bugs** yang ditemukan sebelum production

---

## 📞 SUPPORT

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: vercel.com/discord

**Midtrans Sandbox:**
- Docs: https://docs.midtrans.com/
- Sandbox Dashboard: https://dashboard.sandbox.midtrans.com/

---

## ✅ SUMMARY

**Staging (Vercel):**
- URL: `https://fun-run-v2-xxxxx.vercel.app`
- Midtrans: Sandbox mode
- Payment: Test credentials
- Webhook: Active ✅
- Purpose: Testing & UAT

**Production (Nanti):**
- URL: `https://malangfunrun.com`
- Midtrans: Production mode
- Payment: Real money
- Webhook: Active ✅
- Purpose: Live event

---

**Deploy staging sekarang, test sampai perfect, baru deploy production!** 🚀
