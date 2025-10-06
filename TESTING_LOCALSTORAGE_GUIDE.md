# 🧪 PANDUAN TESTING LOCALSTORAGE

## 🎯 Apa yang Sudah Diperbaiki?

Sebelumnya localStorage tidak bekerja dengan baik karena:
- ❌ Timing issue saat save data
- ❌ Tidak ada loading state saat load dari localStorage
- ❌ Flash content saat page load

**Sekarang sudah diperbaiki dengan:**
- ✅ Auto-save menggunakan `useEffect` yang proper
- ✅ Loading screen saat check localStorage
- ✅ Console logs untuk debugging
- ✅ Data otomatis tersimpan saat masuk payment page
- ✅ Data otomatis ter-load saat page refresh

---

## 📋 STEP-BY-STEP TESTING

### Test 1: Verifikasi Data Tersimpan

**Langkah:**

1. **Buka website** di browser (Chrome/Firefox recommended)
2. **Buka Developer Tools**: 
   - Windows: `F12` atau `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`
3. **Buka tab Console**
4. **Isi form pendaftaran** lengkap dari awal sampai akhir
5. **Submit form** → sampai halaman instruksi pembayaran
6. **Check Console logs**, harus muncul:
   ```
   💾 Data auto-saved to localStorage: {formData: {...}, orderId: "...", paymentAmount: 200XXX, bibNumber: "00XX"}
   ```

7. **Buka tab Application** (di Chrome) atau **Storage** (di Firefox)
8. **Navigasi**: Application → Storage → Local Storage → `http://localhost:3000` (atau domain Anda)
9. **Check key**: `funrun_registration_data`
10. **Verify data**: Klik key tersebut, harus ada JSON dengan data lengkap

**Expected Result:**
```json
{
  "formData": {
    "email": "test@example.com",
    "phoneNumber": "081234567890",
    "name": "John Doe",
    ... (data lengkap)
  },
  "orderId": "test@example.com",
  "paymentAmount": 200001,
  "bibNumber": "0001"
}
```

---

### Test 2: Verifikasi Auto-Redirect Setelah Refresh

**Langkah:**

1. **Lanjutkan dari Test 1** (sudah ada data di localStorage)
2. **Di halaman instruksi pembayaran**, tekan `F5` atau klik refresh
3. **Perhatikan yang terjadi:**
   - Loading screen muncul sebentar (spinner hijau + text "Memuat data pendaftaran...")
   - Langsung redirect ke halaman instruksi pembayaran
   - BIB number dan payment amount sama seperti sebelumnya
4. **Check Console logs**, harus muncul:
   ```
   🔍 Checking localStorage...
   📦 Found data in localStorage: {...}
   ✅ Valid data found, loading...
   ✅ Data loaded successfully, redirecting to payment page
   ```

**Expected Result:**
- ✅ Tidak kembali ke form awal
- ✅ Langsung ke halaman payment
- ✅ Data BIB & payment amount tetap sama
- ✅ Form data tetap terisi (bisa dicek dengan klik "Ubah Data Diri")

---

### Test 3: Verifikasi Tombol "Ubah Data Diri"

**Langkah:**

1. **Di halaman instruksi pembayaran**
2. **Scroll ke bawah**, cari tombol "Ubah Data Diri" (di bawah tombol "Kirim Bukti Pembayaran")
3. **Klik tombol** "Ubah Data Diri"
4. **Perhatikan yang terjadi:**
   - Kembali ke step pertama form (Email)
   - Semua data form masih terisi
   - Progress bar kembali ke awal
5. **Edit beberapa field** (misal: ganti nama atau nomor telepon)
6. **Submit ulang** form
7. **Cek payment page:**
   - BIB number dan payment amount **TETAP SAMA** (tidak berubah)
   - Data yang diedit sudah terupdate

**Expected Result:**
- ✅ Data tidak hilang saat klik "Ubah Data Diri"
- ✅ Bisa edit data dan submit ulang
- ✅ BIB & payment amount tidak berubah

---

### Test 4: Verifikasi Clear Data Setelah Upload

**Langkah:**

1. **Di halaman instruksi pembayaran**
2. **Upload file bukti pembayaran** (pilih gambar apapun < 5MB)
3. **Klik** "Kirim Bukti Pembayaran"
4. **Tunggu sampai** halaman "Pendaftaran Berhasil" muncul
5. **Buka DevTools** → Application → Local Storage
6. **Check key** `funrun_registration_data`

**Expected Result:**
- ✅ Key `funrun_registration_data` **SUDAH TIDAK ADA** (terhapus)
- ✅ Console log muncul: `Data cleared from localStorage`

7. **Klik** "Daftarkan Peserta Lain"
8. **Check form**: Harus kosong semua (tidak ada data tersimpan)

---

### Test 5: Verifikasi Close Browser & Buka Lagi

**Langkah:**

1. **Isi form** → sampai halaman payment
2. **JANGAN upload bukti bayar dulu**
3. **Close tab** atau **close browser** seluruhnya
4. **Buka browser lagi**
5. **Buka website** (ketik URL atau dari bookmark)
6. **Perhatikan yang terjadi:**
   - Loading screen muncul sebentar
   - Langsung redirect ke payment page
   - Data tetap ada (BIB & payment amount sama)

**Expected Result:**
- ✅ Data tidak hilang setelah close browser
- ✅ Langsung ke payment page
- ✅ Tidak perlu isi form ulang

---

## 🔍 DEBUGGING GUIDE

### Console Logs Explained

Saat page load pertama kali (belum ada data):
```
🔍 Checking localStorage...
ℹ️ No saved data in localStorage
```

Saat submit form dan masuk payment page:
```
💾 Data auto-saved to localStorage: {...}
```

Saat refresh page (ada data di localStorage):
```
🔍 Checking localStorage...
📦 Found data in localStorage: {...}
✅ Valid data found, loading...
✅ Data loaded successfully, redirecting to payment page
💾 Data auto-saved to localStorage: {...}
```

Saat data di localStorage tidak valid:
```
🔍 Checking localStorage...
📦 Found data in localStorage: {...}
⚠️ Data incomplete, clearing localStorage
```

Saat error parsing JSON:
```
🔍 Checking localStorage...
❌ Error parsing localStorage: SyntaxError...
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Refresh page kembali ke form awal

**Possible Causes:**
1. Data tidak tersimpan di localStorage
2. Browser mode private/incognito
3. Browser block localStorage

**Solution:**
1. Check console logs saat submit form
2. Harus muncul: `💾 Data auto-saved to localStorage`
3. Check DevTools → Application → Local Storage
4. Pastikan key `funrun_registration_data` ada
5. Jika tidak ada, coba browser lain (Chrome/Firefox)
6. Pastikan tidak pakai mode incognito

---

### Problem: Loading screen muncul tapi tidak redirect

**Possible Causes:**
1. Data di localStorage corrupted
2. Data incomplete (missing fields)

**Solution:**
1. Check console logs
2. Jika muncul `⚠️ Data incomplete`, berarti data tidak lengkap
3. Buka DevTools → Application → Local Storage
4. Delete key `funrun_registration_data`
5. Refresh page → isi form dari awal

---

### Problem: Data tidak ter-save saat submit

**Possible Causes:**
1. JavaScript error sebelum save
2. Network error saat submit ke API

**Solution:**
1. Check console untuk error merah
2. Pastikan API `/api/registration/create` success
3. Pastikan response mengandung `orderId`, `paymentAmount`, `bibNumber`
4. Check network tab → lihat response API

---

### Problem: BIB number berubah saat edit data

**Expected Behavior:**
- BIB number **TIDAK BOLEH** berubah setelah di-generate pertama kali
- Stored di localStorage
- Tetap sama meskipun edit data

**If BIB changes:**
1. Bug! Data localStorage ke-overwrite dengan submit baru
2. Check console logs
3. Seharusnya data di localStorage tidak ter-replace saat submit ulang

---

## 🎬 VIDEO EXPECTED BEHAVIOR

### Scenario 1: Normal Flow
```
1. User isi form (10 menit)
2. Submit → Payment Page
   💾 Data saved
3. Upload bukti bayar
4. Success page
   🗑️ Data cleared
5. Klik "Daftarkan Peserta Lain"
6. Form kosong → isi lagi untuk peserta baru
```

### Scenario 2: Interrupted Flow (Close Browser)
```
1. User isi form (10 menit)
2. Submit → Payment Page
   💾 Data saved
3. Close browser (accident atau sengaja)
4. Buka browser lagi
5. Ketik URL
   ⏳ Loading screen
   ✅ Langsung ke Payment Page
6. Data masih ada → tinggal upload bukti
```

### Scenario 3: Edit Data
```
1. User isi form → Payment Page
   💾 Data saved
2. Lihat detail → ada yang salah
3. Klik "Ubah Data Diri"
4. Edit data yang salah
5. Submit ulang → Payment Page
   💾 Data updated (BIB tetap sama)
6. Upload bukti bayar
```

---

## ✅ FINAL CHECKLIST

Pastikan semua test case ini PASS:

- [ ] **Test 1**: Data tersimpan di localStorage saat submit ✅
- [ ] **Test 2**: Refresh page → auto-redirect ke payment page ✅
- [ ] **Test 3**: Tombol "Ubah Data Diri" berfungsi ✅
- [ ] **Test 4**: Data ter-clear setelah upload bukti bayar ✅
- [ ] **Test 5**: Close browser → buka lagi → data masih ada ✅

**Console Logs Check:**
- [ ] `🔍 Checking localStorage...` muncul saat page load ✅
- [ ] `💾 Data auto-saved to localStorage` muncul saat submit ✅
- [ ] `✅ Data loaded successfully` muncul saat refresh dengan data ✅
- [ ] `Data cleared from localStorage` muncul setelah upload ✅

**DevTools Check:**
- [ ] Key `funrun_registration_data` ada di localStorage setelah submit ✅
- [ ] Key `funrun_registration_data` hilang setelah upload ✅
- [ ] Data di localStorage valid JSON dan lengkap ✅

---

## 📞 SUPPORT

Jika semua test case PASS, localStorage sudah bekerja dengan sempurna! 🎉

Jika ada yang FAIL, check:
1. Console logs untuk error messages
2. Network tab untuk API errors
3. Browser compatibility (gunakan Chrome/Firefox terbaru)

---

**Happy Testing!** 🚀
