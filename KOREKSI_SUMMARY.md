# ✅ RINGKASAN PERBAIKAN - 3 KOREKSI

## 📋 MASALAH YANG SUDAH DIPERBAIKI

| No | Masalah | Status | File yang Diubah |
|----|---------|--------|------------------|
| 1 | Nomor BIB format 5 (bukan 0005) | ✅ Fixed | Google Apps Script |
| 2 | Bukti pembayaran terbagi ke subfolder | ✅ Fixed | Google Apps Script |
| 3 | Nama file bukti pembayaran format salah | ✅ Fixed | Google Apps Script + Next.js |

---

## 🔧 PERUBAHAN YANG DILAKUKAN

### 1. Google Apps Script (UPDATE MANUAL)

**File:** `UPDATE_APPS_SCRIPT_FIXES.md` ✅ Sudah dibuat

**Perubahan:**
- ✅ Nomor BIB sekarang disimpan dengan apostrophe prefix (`'0005`) agar tidak hilang leading zeros
- ✅ Upload bukti pembayaran langsung ke 1 folder utama: `Payment Proofs - Trail Run`
- ✅ Nama file bukti pembayaran: `NamaPeserta_NomorKTP.jpg` (bukan `orderId_filename`)

**Action Required:** ⚠️ **ANDA HARUS UPDATE APPS SCRIPT SECARA MANUAL**

Ikuti langkah di file: `UPDATE_APPS_SCRIPT_FIXES.md`

---

### 2. Next.js Frontend (SUDAH AUTO UPDATE)

**File:** `src/app/page.tsx` ✅ Updated

**Perubahan:**
- ✅ Mengirim `userName` dan `nationalId` saat upload bukti pembayaran

**Kode yang diubah:**
```javascript
// SEBELUM
formData.append('file', paymentProofFile);
formData.append('orderId', orderId);

// SESUDAH
uploadFormData.append('file', paymentProofFile);
uploadFormData.append('orderId', orderId);
uploadFormData.append('userName', formData.name); // ✅ NEW
uploadFormData.append('nationalId', formData.nationalId); // ✅ NEW
```

---

### 3. Next.js API Route (SUDAH AUTO UPDATE)

**File:** `src/app/api/upload/payment-proof/route.ts` ✅ Updated

**Perubahan:**
- ✅ Menerima `userName` dan `nationalId` dari frontend
- ✅ Meneruskan data tersebut ke Google Apps Script

**Kode yang diubah:**
```javascript
// SEBELUM
const orderId = formData.get('orderId') as string;

// SESUDAH
const orderId = formData.get('orderId') as string;
const userName = formData.get('userName') as string; // ✅ NEW
const nationalId = formData.get('nationalId') as string; // ✅ NEW

// Forward ke Apps Script
uploadData: {
  action: 'uploadPaymentProof',
  orderId: orderId,
  userName: userName, // ✅ NEW
  nationalId: nationalId, // ✅ NEW
  file: { ... }
}
```

---

## 🚀 LANGKAH DEPLOYMENT

### Step 1: Update Google Apps Script ⚠️ **PENTING**

1. Buka file: `UPDATE_APPS_SCRIPT_FIXES.md`
2. Copy **SEMUA** kode Apps Script dari file tersebut
3. Buka Google Sheets Anda
4. Klik: **Extensions** → **Apps Script**
5. **Hapus semua kode lama**
6. **Paste kode baru** dari `UPDATE_APPS_SCRIPT_FIXES.md`
7. Update `SHEET_NAME` jika perlu (baris 6)
8. **Save** (Ctrl+S / Cmd+S)
9. **Deploy ulang**:
   - Klik: **Deploy** → **Manage deployments**
   - Klik: **Edit** icon (✏️)
   - Version: **New version**
   - Description: "Fix BIB format, folder structure, and filename"
   - Klik: **Deploy**
10. ✅ URL tetap sama, tidak perlu update `.env.local`

---

### Step 2: Test Aplikasi

**Test Registration:**
1. ✅ Submit form registrasi baru
2. ✅ Check Google Sheets - BIB harus format `0005` (bukan `5`)
3. ✅ Upload bukti pembayaran
4. ✅ Check Google Drive:
   - Folder: `Payment Proofs - Trail Run` (tanpa subfolder)
   - Nama file: `JohnDoe_1234567890123456.jpg`

---

## 📊 HASIL YANG DIHARAPKAN

### 1. Format Nomor BIB
**Sebelum:**
```
Nomor BIB di Google Sheets: 5, 10, 150 (leading zeros hilang)
```

**Sesudah:**
```
Nomor BIB di Google Sheets: 0005, 0010, 0150 (dengan leading zeros)
```

---

### 2. Struktur Folder Bukti Pembayaran
**Sebelum:**
```
Payment Proofs - Trail Run/
├── 2025-01/
│   ├── ORDER123_bukti.jpg
│   └── ORDER456_bukti.jpg
└── 2025-02/
    └── ORDER789_bukti.jpg
```

**Sesudah:**
```
Payment Proofs - Trail Run/
├── JohnDoe_1234567890123456.jpg
├── JaneSmith_9876543210987654.jpg
└── BudiSantoso_1122334455667788.jpg
```

---

### 3. Format Nama File
**Sebelum:**
```
ORDER-1738830123456_IMG_20250206_123456.jpg
```

**Sesudah:**
```
JohnDoe_1234567890123456.jpg
BudiSantoso_1122334455667788.jpg
```

---

## ⚠️ CATATAN PENTING

### Data Lama vs Data Baru

**Data Registrasi Lama:**
- Nomor BIB yang sudah ada **tetap dalam format lama** (tanpa leading zeros)
- Bukti pembayaran lama **tetap di subfolder bulan**
- Nama file lama **tetap format orderId_filename**

**Data Registrasi Baru (setelah update):**
- Nomor BIB **format baru** dengan leading zeros (0005)
- Bukti pembayaran **disimpan di 1 folder utama**
- Nama file **format baru**: `NamaPeserta_NomorKTP.ext`

### Jika Ingin Migrate Data Lama

Jika Anda ingin mengubah data lama agar sesuai format baru:

1. **Nomor BIB**: Bisa run script manual di Apps Script untuk add apostrophe prefix
2. **Bukti Pembayaran**: Bisa pindahkan file manual dari subfolder ke folder utama
3. **Nama File**: Bisa rename manual atau biarkan saja (tidak mengganggu sistem)

---

## 🐛 TROUBLESHOOTING

### BIB masih tampil sebagai angka tanpa leading zeros
→ Pastikan Apps Script sudah di-update dan di-deploy ulang
→ Check baris 83 di Apps Script: `const bibNumberWithPrefix = "'" + bibNumber;`

### File masih tersimpan di subfolder bulan
→ Pastikan Apps Script sudah di-update
→ Check fungsi `uploadPaymentProof()` - harus langsung upload ke `rootFolder`

### Nama file masih format orderId_filename
→ Pastikan Next.js sudah di-restart
→ Check API route sudah terima `userName` dan `nationalId`
→ Check Apps Script menerima parameter `userName` dan `nationalId`

### Error saat upload bukti pembayaran
→ Check console browser untuk error message
→ Check Apps Script execution log
→ Pastikan `userName` dan `nationalId` tidak kosong

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Backup Apps Script lama
- [ ] Copy kode baru dari `UPDATE_APPS_SCRIPT_FIXES.md`
- [ ] Paste ke Apps Script Editor
- [ ] Update `SHEET_NAME` jika perlu
- [ ] Save Apps Script
- [ ] Deploy ulang (New version)
- [ ] Test registrasi baru
- [ ] Check BIB format di Sheets (harus 0005)
- [ ] Upload bukti pembayaran
- [ ] Check folder Google Drive (harus 1 folder utama)
- [ ] Check nama file (harus NamaPeserta_NomorKTP.ext)

---

## 📞 SUPPORT

Jika ada masalah:
1. Check Apps Script **Execution logs** (View → Logs)
2. Check Browser **Console logs** (F12 → Console)
3. Check Google Sheets data
4. Verify Drive folder structure

---

**Selamat! Semua koreksi sudah selesai dilakukan.** 🎉

Next.js sudah auto-update, tinggal **update Apps Script secara manual** di Google Apps Script Editor.
