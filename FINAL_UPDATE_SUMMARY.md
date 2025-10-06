# ✅ FINAL UPDATE SUMMARY

## 🎯 APA YANG SUDAH DIUBAH?

### 1. ✅ orderId Menggunakan Nomor KTP
**Sebelum:** orderId = Email atau `FUN-RUN-...`  
**Sesudah:** orderId = **Nomor KTP** (16 digit)

**Alasan:** Nomor KTP lebih reliable sebagai unique identifier dan konsisten untuk update registration.

---

### 2. ✅ Data di Google Sheets dalam Bahasa Indonesia
**Sebelum:** Data dalam bahasa Inggris  
- `self` / `other`
- `male` / `female`
- `yes` / `no`
- `social_media` / `friend` / `print_media`

**Sesudah:** Data dalam **Bahasa Indonesia**  
- `Diri Sendiri` / `Orang Lain`
- `Pria` / `Wanita`
- `Ya` / `Tidak`
- `Sosial Media` / `Teman` / `Media Cetak`

---

## 📁 FILE YANG SUDAH DIUPDATE (OTOMATIS)

1. ✅ **`src/app/api/registration/create/route.ts`**
   - orderId = nationalId
   - Transform data ke Bahasa Indonesia

2. ✅ **`src/app/api/registration/update/route.ts`**
   - orderId = nationalId
   - Transform data ke Bahasa Indonesia

3. ✅ **`UPDATE_APPS_SCRIPT_FINAL.md`** (Dokumentasi)
   - Kode Apps Script lengkap
   - Cari row berdasarkan NATIONAL_ID
   - Support data Bahasa Indonesia

---

## ⚠️ ACTION REQUIRED: UPDATE GOOGLE APPS SCRIPT

**WAJIB dilakukan sebelum test!**

### Step 1: Backup Apps Script Lama
1. Buka Google Sheets → Extensions → Apps Script
2. Copy semua kode yang ada
3. Save ke text file sebagai backup

### Step 2: Replace dengan Kode Baru
1. Buka file: **`UPDATE_APPS_SCRIPT_FINAL.md`**
2. Copy **SEMUA** kode Apps Script dari file tersebut
3. Kembali ke Apps Script Editor
4. **Delete semua** kode lama
5. **Paste kode baru** dari dokumentasi
6. Update `SHEET_NAME` jika perlu (baris 6)
7. **Save** (Ctrl+S / Cmd+S)

### Step 3: Deploy Ulang
1. Click: **Deploy** → **Manage deployments**
2. Click: **Edit** icon (✏️) pada deployment yang aktif
3. Version: **New version**
4. Description: "Use NATIONAL_ID + Indonesian data"
5. Click: **Deploy**
6. ✅ URL tetap sama, tidak perlu update `.env.local`

---

## 🧪 TESTING CHECKLIST

### Pre-Test: Clear Old Data
```javascript
// Buka browser console (F12), paste ini:
localStorage.removeItem('funrun_registration_data');
// Lalu refresh page
```

### Test 1: Create Registration dengan Data Bahasa Indonesia

**Steps:**
1. Isi form baru lengkap
2. Submit → payment page
3. **Check localStorage** (F12 → Application → Local Storage):
   - `orderId` harus berisi **Nomor KTP** (16 digit)
   - Bukan email atau `FUN-RUN-...`
4. **Check Google Sheets:**
   - Row baru dibuat
   - **Check kolom-kolom berikut:**
     - E (Mendaftar Untuk): `Diri Sendiri` atau `Orang Lain` ✅
     - H (Jenis Kelamin): `Pria` atau `Wanita` ✅
     - L (Terdaftar Dari): `Komunitas` / `Perusahaan` / `Organisasi` / `Personal` ✅
     - N (Sumber Info): `Teman` / `Sosial Media` / `Media Cetak` ✅
     - P-T (Kuesioner): `Ya` atau `Tidak` ✅

**Expected Result:**
- ✅ Semua data dalam **Bahasa Indonesia**
- ✅ Nomor KTP di kolom J (dengan apostrophe prefix `'1234...`)

---

### Test 2: Update Registration

**Steps:**
1. **Dari Test 1**, catat Nomor KTP yang digunakan
2. Di payment page, klik **"Ubah Data Diri"**
3. Edit beberapa field:
   - Ganti nama
   - Ganti alamat
   - Ganti ukuran jersey
4. Submit ulang
5. **Check console logs:**
   - ✅ `🔄 Update mode: updating existing registration`
   - ✅ `✅ Registration updated successfully`
   - ❌ TIDAK ada error "Registration not found"
6. **Check Google Sheets:**
   - ✅ Row yang **SAMA** ter-update (tidak buat row baru)
   - ✅ BIB number **TETAP SAMA**
   - ✅ Payment Amount **TETAP SAMA**
   - ✅ Data ter-update dengan **Bahasa Indonesia**

**Expected Result:**
- ✅ Data ter-update tanpa buat row baru
- ✅ BIB & Payment tidak berubah
- ✅ Data tetap dalam Bahasa Indonesia

---

### Test 3: Multiple Updates

**Steps:**
1. Edit data → submit
2. Edit lagi → submit lagi
3. Ulangi beberapa kali

**Expected Result:**
- ✅ Tetap 1 row saja
- ✅ BIB & Payment never change
- ✅ Data selalu dalam Bahasa Indonesia

---

## 📊 DATA MAPPING REFERENCE

### Mendaftar Untuk:
| English | Indonesian |
|---------|------------|
| self | Diri Sendiri |
| other | Orang Lain |

### Jenis Kelamin:
| English | Indonesian |
|---------|------------|
| male | Pria |
| female | Wanita |

### Terdaftar Dari:
| English | Indonesian |
|---------|------------|
| community | Komunitas |
| company | Perusahaan |
| organization | Organisasi |
| personal | Personal |

### Sumber Info:
| English | Indonesian |
|---------|------------|
| friend | Teman |
| social_media | Sosial Media |
| print_media | Media Cetak |

### Yes/No Fields:
| English | Indonesian |
|---------|------------|
| yes | Ya |
| no | Tidak |

---

## ⚠️ TROUBLESHOOTING

### Error: "Registration not found for Nomor KTP: ..."

**Possible Causes:**
1. Apps Script belum di-update
2. Apps Script masih cari berdasarkan email (kode lama)
3. Nomor KTP tidak ditemukan di sheet

**Solution:**
1. Pastikan Apps Script sudah di-update dengan kode dari `UPDATE_APPS_SCRIPT_FINAL.md`
2. Pastikan deploy ulang sudah dilakukan
3. Check console logs: Harus muncul orderId = Nomor KTP (16 digit)
4. Check sheet kolom J: Harus ada Nomor KTP dengan apostrophe prefix

---

### Data masih dalam bahasa Inggris di sheet

**Possible Causes:**
- Apps Script atau Next.js belum ter-update
- Cache browser

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac)
2. Clear localStorage
3. Restart Next.js dev server
4. Test create registration baru → check sheet

---

### Update membuat row baru (masih ada bug)

**Possible Causes:**
- Apps Script function `updateRegistration` tidak bekerja
- orderId yang dikirim tidak match dengan data di sheet

**Solution:**
1. Check console logs saat submit edit
2. Pastikan muncul: `🔄 Update mode`
3. Check network tab: Request body harus ada `orderId` = Nomor KTP
4. Check Apps Script execution logs (View → Logs)
5. Run `testUpdate()` function di Apps Script Editor

---

## 📝 NOTES

### Untuk Data Lama (Sebelum Update Ini)
- Data lama **TIDAK otomatis** ter-convert ke Bahasa Indonesia
- Data lama masih dalam format English (`self`, `male`, `yes`, dst)
- User dengan data lama perlu **clear localStorage** dan daftar ulang

### Untuk Data Baru (Mulai Sekarang)
- ✅ Semua data otomatis dalam Bahasa Indonesia
- ✅ orderId = Nomor KTP
- ✅ Create & update works seamlessly

### Consistency
- Frontend tetap pakai value English (`self`, `male`, `yes`) untuk internal logic
- Transform hanya terjadi saat **kirim ke Google Sheets**
- Saat display di frontend, tetap pakai label Indonesia

---

## ✅ FINAL CHECKLIST

Pastikan semua ini sudah dilakukan:

- [ ] **Next.js API** ter-update (auto) ✅
- [ ] **Google Apps Script** di-update (manual) ⚠️ **REQUIRED**
- [ ] Apps Script di-deploy ulang ⚠️ **REQUIRED**
- [ ] Clear localStorage sebelum test
- [ ] Test create: Data dalam Bahasa Indonesia ✅
- [ ] Test create: orderId = Nomor KTP ✅
- [ ] Test update: Row yang sama ter-update ✅
- [ ] Test update: BIB & Payment tetap sama ✅
- [ ] Test update: Data dalam Bahasa Indonesia ✅

---

## 🎉 SELESAI!

Jika semua checklist ✅, maka:
- ✅ Data di sheet dalam Bahasa Indonesia
- ✅ Update registration berdasarkan Nomor KTP
- ✅ Tidak ada duplicate row saat edit
- ✅ BIB & Payment Amount tetap konsisten

---

**Silakan update Apps Script terlebih dahulu, lalu test!** 🚀

Dokumentasi lengkap ada di: `UPDATE_APPS_SCRIPT_FINAL.md`
