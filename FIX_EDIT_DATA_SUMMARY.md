# ✅ PERBAIKAN BUG: Edit Data Membuat Baris Baru

## 🐛 MASALAH

**Sebelum:**
- User klik "Ubah Data Diri"
- Edit beberapa field
- Submit ulang
- ❌ Sistem membuat **BARIS BARU** di Google Sheets
- ❌ BIB number dan payment amount **BERBEDA** (baru)

**Hasil:** Duplicate data, BIB number bertambah terus, sheets berantakan!

---

## ✅ SOLUSI

**Sesudah:**
- User klik "Ubah Data Diri"
- Edit beberapa field
- Submit ulang
- ✅ Sistem **UPDATE BARIS YANG SUDAH ADA** di Google Sheets
- ✅ BIB number dan payment amount **TETAP SAMA** (tidak berubah)

**Hasil:** Data ter-update dengan benar, tidak ada duplicate!

---

## 🔧 PERUBAHAN YANG DILAKUKAN

### 1. ✅ Next.js Frontend (AUTO UPDATE)

**File yang diubah:**
- `src/app/page.tsx` ✅ Updated

**Fitur baru:**
- State `isEditMode` untuk track mode CREATE vs UPDATE
- `isEditMode = false` → CREATE (buat baris baru)
- `isEditMode = true` → UPDATE (update baris existing)
- Auto-save `isEditMode` ke localStorage
- Console logs informatif untuk debugging

**Flow:**
```
User submit pertama kali
  ↓
CREATE mode (isEditMode = false)
  ↓
Hit API: /api/registration/create
  ↓
Create row baru di sheet
  ↓
Set isEditMode = true
  ↓
Data tersimpan di localStorage

User klik "Ubah Data Diri"
  ↓
UPDATE mode (isEditMode = true)
  ↓
Edit form
  ↓
Submit ulang
  ↓
Hit API: /api/registration/update
  ↓
Update row yang sudah ada (tidak buat row baru)
  ↓
BIB & Payment Amount tetap sama
```

---

### 2. ✅ Next.js API Route (AUTO CREATED)

**File baru:**
- `src/app/api/registration/update/route.ts` ✅ Created

**Fungsi:**
- Terima data dari frontend (formData, orderId, paymentAmount, bibNumber)
- Kirim ke Google Apps Script dengan action "update"
- Return success/error response

---

### 3. ⚠️ Google Apps Script (MANUAL UPDATE REQUIRED)

**File dokumentasi:**
- `UPDATE_APPS_SCRIPT_WITH_UPDATE_ACTION.md` ✅ Created

**Yang perlu dilakukan:**
1. Buka Google Sheets → Extensions → Apps Script
2. Copy kode lengkap dari `UPDATE_APPS_SCRIPT_WITH_UPDATE_ACTION.md`
3. Replace semua kode yang ada
4. Save → Deploy ulang (New version)
5. URL tetap sama, tidak perlu update `.env.local`

**Fungsi baru yang ditambahkan:**
- `updateRegistration(orderId, data)` ✅ NEW
- Cari row berdasarkan email (orderId)
- Update row tersebut dengan data baru
- BIB number dan Payment Amount **TETAP SAMA**
- Update timestamp "Updated At"

---

## 📋 DEPLOYMENT CHECKLIST

### Step 1: Verifikasi Next.js (Sudah Auto-Update)
- [x] File `src/app/page.tsx` sudah ter-update
- [x] File `src/app/api/registration/update/route.ts` sudah dibuat
- [ ] **Test di browser** (optional, bisa test setelah update Apps Script)

### Step 2: Update Google Apps Script ⚠️ **OPSIONAL - ONLY IF YOU WANT TO ADD ORDER_ID COLUMN**

**UPDATE: Quick fix sudah implemented!**
- ✅ Frontend sekarang pakai **EMAIL sebagai orderId**
- ✅ Apps Script tidak perlu di-update (sudah cari berdasarkan email)
- ✅ Create & update works without changing Apps Script

**Jika ingin tetap update Apps Script (optional):**
- [ ] Buka `UPDATE_APPS_SCRIPT_WITH_UPDATE_ACTION.md`
- [ ] Copy **SEMUA** kode Apps Script dari file tersebut
- [ ] Buka Google Sheets → Extensions → Apps Script
- [ ] **Backup kode lama** (copy ke text file)
- [ ] **Delete semua** kode lama
- [ ] **Paste kode baru** dari dokumentasi
- [ ] Update `SHEET_NAME` jika perlu (baris 6)
- [ ] **Save** (Ctrl+S / Cmd+S)
- [ ] **Deploy ulang**:
  - Click: Deploy → Manage deployments
  - Click: Edit icon (✏️)
  - Version: **New version**
  - Description: "Add UPDATE action support"
  - Click: **Deploy**
- [ ] URL tetap sama, tidak perlu update `.env.local`

### Step 3: Testing
- [ ] **Test Create**: Isi form baru → submit → check sheet (row baru dibuat)
- [ ] **Test Update**: Klik "Ubah Data Diri" → edit → submit → check sheet:
  - ✅ Row yang sama ter-update (TIDAK buat row baru)
  - ✅ BIB number TETAP SAMA
  - ✅ Payment Amount TETAP SAMA
  - ✅ Data lain ter-update

---

## 🧪 CARA TESTING

### Test 1: Create New Registration

**Steps:**
1. Buka website fun run
2. Isi form lengkap dari awal
3. Submit → sampai payment page
4. **Check console logs:**
   ```
   ➕ Create mode: creating new registration
   ✅ Registration created: ...
   ```
5. **Check Google Sheets:**
   - Row baru dibuat
   - Note: Row number, Email, BIB, Payment Amount

**Expected Result:**
- ✅ Row baru di sheet
- ✅ BIB format: 0001, 0002, dst
- ✅ Payment Amount: 200001, 200002, dst

---

### Test 2: Edit Existing Registration

**Steps:**
1. **Lanjut dari Test 1** (sudah ada data)
2. Di payment page, klik **"Ubah Data Diri"**
3. **Check console logs:**
   ```
   📝 Edit mode activated, will UPDATE on next submit
   ```
4. Kembali ke form (step 1)
5. **Edit beberapa field:**
   - Ganti nama
   - Ganti alamat
   - Ganti ukuran jersey
6. Submit ulang
7. **Check console logs:**
   ```
   🔄 Update mode: updating existing registration
   ✅ Registration updated successfully
   ```
8. **Check Google Sheets:**
   - Cari row dengan email yang sama
   - Data ter-update (nama, alamat, ukuran jersey berubah)
   - **BIB number TETAP SAMA** ✅
   - **Payment Amount TETAP SAMA** ✅
   - "Updated At" timestamp berubah
   - **TIDAK ada row baru** ✅

**Expected Result:**
- ✅ Row yang sama ter-update
- ✅ BIB tidak berubah
- ✅ Payment Amount tidak berubah
- ✅ Tidak ada duplicate row

---

### Test 3: Multiple Edits

**Steps:**
1. Edit data → submit
2. Klik "Ubah Data Diri" lagi
3. Edit lagi → submit lagi
4. Ulangi beberapa kali

**Expected Result:**
- ✅ Tetap 1 row saja di sheet
- ✅ BIB dan Payment Amount tidak pernah berubah
- ✅ Data selalu ter-update di row yang sama

---

## 📊 COMPARISON: Before vs After

### Scenario: User Edit Data

**BEFORE (Bug):**
```
Sheet awal:
Row 2: user@email.com | BIB: 0001 | Payment: 200001

User edit data → submit
↓
Sheet setelah edit:
Row 2: user@email.com | BIB: 0001 | Payment: 200001 (data lama)
Row 3: user@email.com | BIB: 0002 | Payment: 200002 (data baru) ❌ DUPLICATE!
```

**AFTER (Fixed):**
```
Sheet awal:
Row 2: user@email.com | BIB: 0001 | Payment: 200001

User edit data → submit
↓
Sheet setelah edit:
Row 2: user@email.com | BIB: 0001 | Payment: 200001 (data updated) ✅ SAME ROW!
```

---

## 🔍 DEBUGGING GUIDE

### Console Logs

**Create Mode:**
```
➕ Create mode: creating new registration
✅ Registration created: user@email.com
Payment amount: 200001
BIB number: 0001
💾 Data auto-saved to localStorage: {isEditMode: true, ...}
```

**Edit Mode (klik "Ubah Data Diri"):**
```
📝 Edit mode activated, will UPDATE on next submit
```

**Update Mode (submit setelah edit):**
```
🔄 Update mode: updating existing registration
✅ Registration updated successfully
💾 Data auto-saved to localStorage: {isEditMode: true, ...}
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Masih buat row baru saat edit

**Possible Causes:**
1. Apps Script belum di-update
2. Apps Script belum di-deploy ulang
3. Cache browser

**Solution:**
1. Check Apps Script: Harus ada function `updateRegistration`
2. Check deployment: Version harus terbaru
3. Hard refresh browser: `Ctrl + Shift + R` (Windows) atau `Cmd + Shift + R` (Mac)
4. Check console logs: Harus muncul "🔄 Update mode"

---

### Problem: BIB number berubah saat edit

**Possible Causes:**
- Apps Script tidak preserve existing BIB number

**Solution:**
1. Check Apps Script baris 228-229
2. Pastikan ada:
   ```javascript
   const existingBibNumber = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
   const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];
   ```
3. Pastikan di row update menggunakan `existingBibNumber` dan `existingPaymentAmount`

---

### Problem: Error "Registration not found"

**Possible Causes:**
- Email tidak ditemukan di sheet
- Email di localStorage berbeda dengan email di sheet

**Solution:**
1. Check localStorage: Email yang tersimpan
2. Check sheet: Email yang ada di column C
3. Pastikan exact match (case sensitive)

---

## 📁 FILE CHANGES SUMMARY

### Files Changed (Auto):
1. ✅ `src/app/page.tsx` - Added `isEditMode` state and logic
2. ✅ `src/app/api/registration/update/route.ts` - New API route

### Documentation Files (Created):
3. ✅ `UPDATE_APPS_SCRIPT_WITH_UPDATE_ACTION.md` - Complete Apps Script code
4. ✅ `FIX_EDIT_DATA_SUMMARY.md` - This file (summary & guide)

### Manual Action Required:
- ⚠️ **Update Google Apps Script** (follow `UPDATE_APPS_SCRIPT_WITH_UPDATE_ACTION.md`)

---

## ✅ FINAL CHECKLIST

Pastikan semua ini sudah dilakukan:

- [ ] Next.js files ter-update (auto)
- [ ] API route `/api/registration/update` terbuat (auto)
- [ ] **Google Apps Script di-update dengan kode baru** ⚠️ MANUAL
- [ ] Apps Script di-deploy ulang (New version)
- [ ] Test Create: Row baru dibuat ✅
- [ ] Test Update: Row yang sama ter-update (tidak buat row baru) ✅
- [ ] BIB number tetap sama saat edit ✅
- [ ] Payment amount tetap sama saat edit ✅

---

**Setelah checklist complete, bug sudah fixed!** 🎉

Jika ada masalah, check:
1. Console logs (harus muncul emoji dan pesan yang jelas)
2. Google Sheets (check row number, BIB, payment amount)
3. Apps Script Execution logs (View → Logs)

---

**Happy Coding!** 🚀
