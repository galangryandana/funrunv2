# 🚀 Deploy ke Vercel - Panduan Lengkap

## 📋 PERSIAPAN SEBELUM DEPLOY

### ✅ Checklist Pre-Deploy

Pastikan semua ini sudah OK:

- [ ] **Code berfungsi di local** (test di localhost:3000)
- [ ] **Midtrans API keys** (Production keys untuk production)
- [ ] **Google Apps Script** sudah deployed
- [ ] **Environment variables** sudah lengkap
- [ ] **Git repository** sudah ada (GitHub/GitLab)
- [ ] **No sensitive data** di code (keys harus di .env)

---

## 🔧 LANGKAH 1: PERSIAPAN PROJECT

### 1.1 Init Git Repository (Jika Belum)

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/vibecode/fun-run-v2

# Check apakah sudah git
git status

# Jika belum, init:
git init
git add .
git commit -m "Initial commit - Fun Run registration app"
```

### 1.2 Push ke GitHub

**Opsi A: Via GitHub CLI (Recommended)**

```bash
# Login GitHub CLI
gh auth login

# Create repo dan push
gh repo create fun-run-v2 --public --source=. --push
```

**Opsi B: Manual via GitHub Website**

1. Buka https://github.com/new
2. Nama repo: `fun-run-v2`
3. Public/Private: Pilih sesuai kebutuhan
4. Jangan centang "Initialize with README"
5. Klik "Create repository"
6. Follow instruksi untuk push existing repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/fun-run-v2.git
git branch -M main
git push -u origin main
```

---

## 🌐 LANGKAH 2: DEPLOY KE VERCEL

### 2.1 Sign Up / Login Vercel

1. Buka https://vercel.com/signup
2. **Sign up with GitHub** (recommended)
3. Authorize Vercel untuk akses GitHub repos

### 2.2 Import Project

1. **Dashboard Vercel** → Klik **"Add New Project"**
2. **Import Git Repository**
3. Pilih repo **`fun-run-v2`**
4. Klik **"Import"**

### 2.3 Configure Project

**Framework Preset:** Next.js (auto-detected) ✅

**Root Directory:** `./` (default)

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

---

## 🔑 LANGKAH 3: ENVIRONMENT VARIABLES

**PENTING!** Jangan lanjut deploy sebelum setup environment variables!

### 3.1 Add Environment Variables di Vercel

Di halaman import project, scroll ke **"Environment Variables"**:

#### **WAJIB DIISI:**

```env
# Midtrans - PRODUCTION KEYS!
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxx
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=true

# Google Sheets
APPS_SCRIPT_ENTRYPOINT=https://script.google.com/macros/s/.../exec

# Base URL - GANTI NANTI setelah deploy
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

**Cara Add:**
1. Name: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
2. Value: `Mid-client-xxxxxxxxxxxxx` (Production key!)
3. Klik **"Add"**
4. Ulangi untuk semua variable di atas

**⚠️ PENTING:**
- Gunakan **Production Keys** Midtrans (bukan Sandbox!)
- `NEXT_PUBLIC_BASE_URL` bisa diisi nanti setelah tahu domain Vercel

---

## 🚀 LANGKAH 4: DEPLOY!

1. **Klik "Deploy"**
2. Tunggu proses build (2-3 menit)
3. **Deployment sukses!** 🎉

Anda akan dapat URL: `https://fun-run-v2.vercel.app` (atau custom)

---

## 🔧 LANGKAH 5: POST-DEPLOY CONFIGURATION

### 5.1 Update Base URL

Setelah deploy, Anda punya URL production. Update env var:

1. **Vercel Dashboard** → Project → **Settings** → **Environment Variables**
2. Edit `NEXT_PUBLIC_BASE_URL`
3. Value: `https://fun-run-v2.vercel.app` (URL Vercel Anda)
4. **Save**
5. **Redeploy** (Deployments → ... → Redeploy)

### 5.2 Update Midtrans Configuration

**Webhook URL di Midtrans Dashboard:**

1. Login https://dashboard.midtrans.com/
2. Toggle ke **PRODUCTION** mode
3. Settings → Configuration
4. **Payment Notification URL:**
   ```
   https://fun-run-v2.vercel.app/api/webhook/midtrans
   ```
5. **Save**

### 5.3 Update layout.tsx untuk Production Snap.js

⚠️ **PENTING!** Pastikan Snap.js URL sudah production:

File: `src/app/layout.tsx`

```tsx
<Script
  src="https://app.midtrans.com/snap/snap.js"  // Tanpa .sandbox!
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
  strategy="beforeInteractive"
/>
```

Jika masih pakai `.sandbox`, edit dan commit:
```bash
# Edit file layout.tsx, ganti URL
git add src/app/layout.tsx
git commit -m "Update Snap.js to production URL"
git push
```

Vercel akan auto-deploy ulang.

---

## ✅ LANGKAH 6: TESTING PRODUCTION

### 6.1 Test Full Flow

1. Buka URL production: `https://fun-run-v2.vercel.app`
2. Isi form pendaftaran lengkap
3. Klik "Selesaikan Pendaftaran"
4. Popup Snap muncul (production mode)
5. **BAYAR DENGAN KARTU REAL** (bukan test card!)
6. Cek Google Sheets → Data masuk & status update ✅
7. Cek halaman "Registrasi Berhasil" ✅

### 6.2 Test Webhook

Webhook akan otomatis jalan karena:
- ✅ Domain public (tidak pakai localhost)
- ✅ Webhook URL sudah di-set di Midtrans
- ✅ SSL/HTTPS aktif (otomatis di Vercel)

Test:
1. Payment → Success
2. Tunggu 5-10 detik
3. Cek Google Sheets → Status harus update jadi SUCCESS ✅

---

## 🎨 LANGKAH 7: CUSTOM DOMAIN (OPSIONAL)

Jika punya domain sendiri (contoh: `malangfunrun.com`):

### 7.1 Add Domain di Vercel

1. **Project** → **Settings** → **Domains**
2. Klik **"Add"**
3. Masukkan domain: `malangfunrun.com`
4. Follow instruksi untuk setup DNS:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   
   Dan:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

5. Tunggu propagasi DNS (5-10 menit)
6. SSL auto-generated oleh Vercel ✅

### 7.2 Update Environment Variables

Jika pakai custom domain, update:
```env
NEXT_PUBLIC_BASE_URL=https://malangfunrun.com
```

Dan update webhook URL di Midtrans dashboard.

---

## 🔄 LANGKAH 8: CONTINUOUS DEPLOYMENT

Setiap kali Anda push ke GitHub, Vercel akan **auto-deploy**!

```bash
# Edit code
git add .
git commit -m "Update feature X"
git push

# Vercel auto-deploy dalam 2-3 menit! 🚀
```

Monitor di: https://vercel.com/[username]/fun-run-v2/deployments

---

## 🐛 TROUBLESHOOTING

### Issue: Build Error

**Cek build logs** di Vercel dashboard.

Common fixes:
```bash
# Test build locally first
npm run build

# Fix errors, then push
git add .
git commit -m "Fix build errors"
git push
```

### Issue: Environment Variables Tidak Terbaca

- Pastikan semua env vars sudah di-add di Vercel
- **Redeploy** setelah add/update env vars
- Env vars yang prefix `NEXT_PUBLIC_` harus di-build ulang

### Issue: Webhook Tidak Jalan

1. Cek webhook URL di Midtrans benar
2. Cek Vercel function logs (Monitoring → Functions)
3. Test manual:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhook/midtrans
   ```

### Issue: Payment Popup Tidak Muncul

- Cek apakah pakai Production Snap.js URL (bukan .sandbox)
- Cek console browser untuk error
- Pastikan Production Midtrans keys sudah benar

---

## 📋 PRODUCTION CHECKLIST

Sebelum go-live:

- [ ] Code tested di local
- [ ] Git pushed ke GitHub
- [ ] Deployed ke Vercel
- [ ] Environment variables production sudah set
- [ ] Base URL sudah diupdate
- [ ] Snap.js URL production (tanpa .sandbox)
- [ ] Webhook URL production di-set di Midtrans
- [ ] Test payment dengan kartu real berhasil
- [ ] Webhook update status di Google Sheets berhasil
- [ ] Custom domain setup (jika ada)
- [ ] SSL certificate aktif (auto di Vercel)
- [ ] Monitoring setup (Vercel Analytics)

---

## 💡 TIPS

1. **Branch Strategy**: Gunakan branch untuk development
   ```bash
   git checkout -b development
   # Deploy preview di Vercel
   ```

2. **Vercel Preview**: Setiap PR akan dapat preview URL

3. **Monitoring**: Enable Vercel Analytics untuk tracking

4. **Backup**: Export Google Sheets regularly

5. **Security**: Never commit `.env.local` ke git (sudah di .gitignore)

---

## 📞 SUPPORT

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Midtrans Issues:**
- Docs: https://docs.midtrans.com/
- Support: support@midtrans.com

---

**Selamat! Project Anda sekarang LIVE! 🎉**

URL: https://fun-run-v2.vercel.app
