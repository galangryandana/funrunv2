# 📊 Setup Google Sheets Integration - Panduan Lengkap

## ✅ SUDAH SELESAI (Kode)

Kode integrasi Google Sheets **sudah selesai dibuat**. Yang perlu Anda lakukan adalah:
1. Setup Google Apps Script
2. Setup kolom di Google Sheets  
3. Deploy Apps Script
4. Update environment variable

---

## 🎯 FLOW LENGKAP

```
USER SUBMIT FORM
       ↓
CREATE TRANSACTION API
       ↓
   ✅ CREATE Midtrans transaction
   ✅ SAVE to Google Sheets (status: PENDING)
   ✅ Return token to frontend
       ↓
USER BAYAR VIA SNAP POPUP
       ↓
WEBHOOK NOTIFICATION
       ↓
   ✅ Verify signature
   ✅ Get transaction status
   ✅ UPDATE Google Sheets (status: SUCCESS/FAILED)
```

---

## 📋 LANGKAH 1: Setup Google Sheets

### 1.1 Buat/Buka Google Sheets

1. Buka Google Sheets Anda
2. Pastikan ada sheet bernama **"Registrations"** (case-sensitive!)
3. Jika belum ada, buat sheet baru dan rename jadi "Registrations"

### 1.2 Setup Header Kolom (Baris 1)

**PENTING**: Baris pertama harus berisi header kolom sesuai urutan ini:

```
A: Created At
B: Updated At
C: ID Pendaftaran
D: Email
E: Nomor Telepon
F: Mendaftar Untuk
G: Nama Lengkap
H: Tanggal Lahir
I: Jenis Kelamin
J: Alamat
K: Nomor KTP
L: Nama BIB
M: Terdaftar Dari
N: Nama (Terdaftar Dari)
O: Sumber Info
P: Golongan Darah
Q: Penyakit Kronis
R: Dalam Perawatan Dokter
S: Harus Minum Obat
T: Kejadian Buruk Terkait Penyakit
U: Kontak Darurat Nama
V: Kontak Darurat Telepon
W: Ukuran Jersey
X: Kategori Peserta
Y: Jumlah Payment
Z: Status Pembayaran
AA: Payment Date
AB: Transaction ID
AC: Payment Type
```

**Catatan:**
- Nama header boleh berbeda dari yang di atas
- Yang penting adalah **URUTAN kolom** harus sesuai
- Data akan diisi mulai baris 2

---

## 📜 LANGKAH 2: Setup Apps Script

### 2.1 Buka Apps Script Editor

1. Di Google Sheets, klik menu **Extensions** → **Apps Script**
2. Editor akan terbuka di tab baru
3. Hapus semua kode default yang ada

### 2.2 Copy Kode Apps Script

Buka file **`GOOGLE_APPS_SCRIPT.md`** di folder project Anda dan copy seluruh kode JavaScript yang ada.

Paste ke Apps Script Editor.

### 2.3 Save Project

1. Klik icon **Save** (💾) atau tekan `Ctrl+S`
2. Beri nama project: "Fun Run Registration API"

---

## 🚀 LANGKAH 3: Deploy Apps Script

### 3.1 Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas) → **New deployment**
2. Di popup yang muncul:
   - Klik icon **⚙️ Settings**
   - **Type**: Pilih **Web app**
3. **Configuration**:
   - **Description**: "Fun Run Registration API"
   - **Execute as**: **Me** (email Anda)
   - **Who has access**: ⚠️ **Anyone** (PENTING!)
4. Klik **Deploy**

### 3.2 Authorize Access

1. Akan muncul popup "Authorization required"
2. Klik **Authorize access**
3. Pilih Google account Anda
4. Google akan warning: "This app isn't verified"
   - Klik **Advanced**
   - Klik **Go to [Project Name] (unsafe)**
   - Klik **Allow**

### 3.3 Copy Web App URL

Setelah deploy sukses, akan muncul **Web app URL**:

```
https://script.google.com/macros/s/AKfycby......................./exec
```

**Copy URL ini!** Anda akan butuh untuk langkah berikutnya.

---

## 🔧 LANGKAH 4: Update Environment Variable

### 4.1 Buka .env.local

Buka file `.env.local` di root project Anda.

### 4.2 Update APPS_SCRIPT_ENTRYPOINT

Ganti URL Apps Script dengan yang baru Anda copy:

```env
APPS_SCRIPT_ENTRYPOINT=https://script.google.com/macros/s/AKfycby.../exec
```

⚠️ **PENTING**: 
- URL harus diakhiri dengan `/exec`
- Tidak ada spasi di awal/akhir
- Tidak ada tanda kutip tambahan

### 4.3 Save File

Save file `.env.local` setelah diubah.

---

## ✅ LANGKAH 5: Test Integration

### 5.1 Test Apps Script (Manual)

**Test via Browser:**

1. Buka Web App URL di browser
2. Harus muncul response JSON:
```json
{
  "success": true,
  "message": "Fun Run Registration Apps Script is active",
  "timestamp": "2025-10-01T14:30:00.000Z"
}
```

Jika muncul ini, artinya Apps Script sudah berjalan! ✅

**Test Create Registration (di Apps Script Editor):**

1. Di Apps Script Editor, pilih function **testCreateRegistration** dari dropdown
2. Klik **Run** (▶️)
3. Cek Google Sheet Anda, harus ada data baru muncul di baris 2

**Test Update Status (di Apps Script Editor):**

1. Edit function **testUpdateStatus**, ganti `orderId` dengan ID yang valid dari sheet
2. Pilih function **testUpdateStatus** dari dropdown
3. Klik **Run** (▶️)
4. Cek Google Sheet, status harus berubah jadi "SUCCESS"

### 5.2 Test Full Flow (Via App)

1. **Restart dev server** (agar .env.local terbaca):
```bash
# Stop server (Ctrl+C)
npm run dev
```

2. **Buka app**: http://localhost:3000

3. **Isi form pendaftaran** sampai selesai

4. **Klik "Selesaikan Pendaftaran"**

5. **Cek Google Sheets**:
   - Harus muncul data baru
   - Status: **PENDING**
   - Created At & Updated At terisi
   - Payment Date, Transaction ID, Payment Type masih kosong

6. **Bayar via Snap popup** (gunakan test card)

7. **Tunggu beberapa detik** (webhook processing)

8. **Refresh Google Sheets**:
   - Status berubah jadi: **SUCCESS**
   - Payment Date terisi
   - Transaction ID terisi
   - Payment Type terisi (contoh: credit_card)

---

## 🎨 FORMAT DATA DI SHEETS

### Data yang Diconvert ke Bahasa Indonesia:

| Field Form | Value Form | Value di Sheets |
|------------|------------|-----------------|
| Mendaftar Untuk | `self` | Diri Sendiri |
| Mendaftar Untuk | `other` | Orang Lain |
| Jenis Kelamin | `male` | Pria |
| Jenis Kelamin | `female` | Wanita |
| Terdaftar Dari | `community` | Komunitas |
| Terdaftar Dari | `company` | Perusahaan |
| Terdaftar Dari | `organization` | Organisasi |
| Terdaftar Dari | `personal` | Personal |
| Sumber Info | `friend` | Teman |
| Sumber Info | `social_media` | Sosial Media |
| Sumber Info | `print_media` | Media Cetak |
| Kategori Peserta | `student` | Pelajar |
| Kategori Peserta | `general` | Umum |
| Penyakit Kronis | `yes` | Ya |
| Penyakit Kronis | `no` | Tidak |
| (dst untuk field yes/no lainnya) | | |

### Status Pembayaran:

- **PENDING**: Transaksi dibuat, belum bayar / sedang proses
- **SUCCESS**: Pembayaran berhasil dan terkonfirmasi
- **FAILED**: Pembayaran ditolak / dibatalkan
- **EXPIRED**: Transaksi expired (tidak dibayar dalam batas waktu)

### Format Timestamp:

```
2025-10-01 14:30:25
(YYYY-MM-DD HH:mm:ss)
Timezone: WIB (Asia/Jakarta)
```

---

## 🔄 UPDATE KODE APPS SCRIPT

Jika Anda perlu edit kode Apps Script nanti:

1. Edit kode di Apps Script Editor
2. Save (Ctrl+S)
3. **Deploy ulang**:
   - Klik **Deploy** → **Manage deployments**
   - Klik icon **✏️ Edit** di deployment yang aktif
   - Di "Version", pilih **New version**
   - Klik **Deploy**
4. **URL tetap sama**, tidak perlu update .env.local

---

## 🐛 TROUBLESHOOTING

### ❌ Error: "Sheet not found: Registrations"

**Solusi:**
- Pastikan nama sheet **persis** "Registrations" (huruf besar R)
- Atau edit `SHEET_NAME` di kode Apps Script sesuai nama sheet Anda

### ❌ Error: "Authorization required"

**Solusi:**
- Jalankan function test (testCreateRegistration) sekali di Apps Script Editor
- Akan muncul popup authorize, klik Allow

### ❌ Data tidak muncul di Google Sheets

**Solusi:**
1. Cek terminal Next.js, lihat error log
2. Cek Apps Script → Executions (View → Executions), lihat error log
3. Pastikan URL Apps Script di .env.local benar
4. Pastikan setting "Who has access" = **Anyone**

### ❌ Status tidak update setelah bayar

**Solusi:**
1. Webhook mungkin belum setup (normal untuk local dev)
2. Untuk test local, gunakan ngrok (lihat MIDTRANS_SETUP.md)
3. Atau manual update di Apps Script dengan function testUpdateStatus

### ❌ Error: "Failed to save to Google Sheets"

**Solusi:**
1. Cek koneksi internet
2. Cek Apps Script URL masih valid (tidak expired)
3. Cek quota Google Apps Script (ada limit daily execution)
4. Cek Apps Script Executions log untuk detail error

---

## 📊 MONITORING & ANALYTICS

### Dashboard Sederhana di Google Sheets

Buat sheet baru bernama "Dashboard" dengan formula:

```
Total Pendaftar:
=COUNTA(Registrations!A:A)-1

Total Success:
=COUNTIF(Registrations!Z:Z,"SUCCESS")

Total Pending:
=COUNTIF(Registrations!Z:Z,"PENDING")

Total Failed:
=COUNTIF(Registrations!Z:Z,"FAILED")

Total Revenue:
=SUMIF(Registrations!Z:Z,"SUCCESS",Registrations!Y:Y)

Conversion Rate:
=COUNTIF(Registrations!Z:Z,"SUCCESS")/COUNTA(Registrations!A:A)-1
```

### Filter View

Buat filter view untuk:
- Hanya PENDING
- Hanya SUCCESS
- Registrasi hari ini
- dll

---

## 💡 TIPS

1. **Backup Sheet**: Buat copy sheet secara berkala
2. **Freeze Header**: Freeze row 1 agar header tetap terlihat
3. **Conditional Formatting**: Warnai row berdasarkan status
   - SUCCESS: Hijau
   - PENDING: Kuning
   - FAILED: Merah
4. **Sort by Created At**: Terbaru di atas
5. **Protected Range**: Protect kolom Created At, Order ID, dll agar tidak diubah manual

---

## ✅ CHECKLIST SETUP

Sebelum testing, pastikan:

- [ ] Google Sheet bernama "Registrations" sudah dibuat
- [ ] Header kolom di baris 1 sudah diisi (sesuai urutan)
- [ ] Apps Script code sudah di-paste dan di-save
- [ ] Apps Script sudah di-deploy sebagai Web app
- [ ] Setting "Who has access" = **Anyone**
- [ ] Web App URL sudah di-copy
- [ ] .env.local sudah di-update dengan Apps Script URL
- [ ] Dev server sudah di-restart
- [ ] Test manual di Apps Script berhasil
- [ ] Test via app berhasil (data muncul di sheet)

---

**Selamat! Google Sheets integration sudah siap! 🎉**

Jika ada masalah, cek Troubleshooting section atau Execution log di Apps Script Editor.
