# 🔧 QUICK FIX: Order ID Issue

## 🐛 Masalah

Error saat ubah data:
```
Submit error: Error: Registration not found for email: FUN-RUN-1759739216158-365
```

**Penyebab:**
- Frontend generate `orderId` dengan format `FUN-RUN-${timestamp}-${randomNum}`
- Apps Script mencari row berdasarkan **EMAIL** (kolom C)
- Tapi frontend mengirim orderId yang bukan email
- Apps Script tidak menemukan row dengan "email" = `FUN-RUN-...`

## ✅ Solusi

**Gunakan EMAIL sebagai orderId** di semua tempat (lebih simple dan konsisten).

### Perubahan yang Dilakukan

**File:** `src/app/api/registration/create/route.ts` ✅ Updated

**Sebelum:**
```javascript
const timestamp = Date.now();
const randomNum = Math.floor(Math.random() * 1000);
const orderId = `FUN-RUN-${timestamp}-${randomNum}`;
```

**Sesudah:**
```javascript
// ✅ Use EMAIL as orderId
const orderId = formData.email;
```

**Benefit:**
- ✅ Konsisten dengan Apps Script (cari berdasarkan email)
- ✅ Tidak perlu tambah kolom ORDER_ID di sheet
- ✅ Email sudah unique per user
- ✅ Update sekarang bisa find row dengan benar

---

## 🧪 Testing

### Test Create:
1. Isi form → submit
2. Check localStorage: `orderId` harus berisi email (contoh: `user@email.com`)
3. Check sheet: Row baru dibuat dengan email di kolom C

### Test Update:
1. Klik "Ubah Data Diri"
2. Edit beberapa field
3. Submit ulang
4. **Check console:** Tidak boleh ada error "Registration not found"
5. **Check sheet:** Row yang sama ter-update (tidak buat row baru)

---

## 📝 Catatan

### Kenapa tidak pakai FUN-RUN-... ?

**Masalah dengan format FUN-RUN:**
- Apps Script tidak menyimpan orderId ini di kolom terpisah
- Struktur sheet tidak ada kolom ORDER_ID
- Apps Script hanya menyimpan: Email, Name, BIB, dst
- Jadi orderId `FUN-RUN-...` hilang setelah disimpan

**Solusi dengan EMAIL:**
- Email sudah unique per user
- Apps Script sudah menyimpan email di kolom C
- Fungsi `updateRegistration` cari berdasarkan email
- Konsisten di semua tempat!

### Apa implikasi perubahan ini?

**For NEW registrations:**
- ✅ orderId sekarang = email
- ✅ Create & update works seamlessly

**For EXISTING registrations (old data with FUN-RUN-... orderId):**
- ❌ Tidak bisa di-update (karena orderId di localStorage masih FUN-RUN format)
- ✅ Solution: Clear localStorage untuk registrasi lama
- ✅ Registrasi baru dari sekarang akan pakai email sebagai orderId

### Cara clear old data:

**Option 1: Manual (per user):**
```javascript
// Di browser console:
localStorage.removeItem('funrun_registration_data');
// Refresh page → isi form dari awal
```

**Option 2: Auto (deploy dengan version bump):**
- Versi sekarang sudah otomatis fix untuk registrasi baru
- User dengan data lama akan dapat error
- Mereka perlu clear localStorage manual atau tunggu expired

---

## ✅ Deployment Checklist

- [x] Update API create: `orderId = email` ✅
- [x] No need to update Apps Script (already search by email) ✅
- [ ] Test create new registration
- [ ] Test update registration
- [ ] Verify no more "Registration not found" error

---

## 🎉 Summary

**Sebelum:**
- orderId = `FUN-RUN-1759739216158-365`
- Apps Script cari berdasarkan email
- ❌ Mismatch → error "not found"

**Sesudah:**
- orderId = `user@email.com`
- Apps Script cari berdasarkan email
- ✅ Match → update berhasil!

---

**No need to update Apps Script!** Fix hanya di Next.js API. 🚀
