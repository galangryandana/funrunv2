# Update Google Apps Script untuk Nomor BIB

## 📋 OVERVIEW

Update ini menambahkan sistem **Nomor BIB** otomatis yang akan digenerate ketika pembayaran berhasil (status SUCCESS).

### Fitur Baru:
- ✅ Kolom baru: **"Nomor BIB"** (sebelum kolom "Nama Lengkap")
- ✅ Auto-increment: Nomor BIB dimulai dari 0001, 0002, 0003, dst
- ✅ Format: 4 digit dengan leading zero (0001, 0025, 0100, 1234)
- ✅ Hanya terisi ketika payment SUCCESS
- ✅ Kolom baru: **"Pernah Pingsan"** (kuesioner kesehatan baru)
- ✅ Blood type updated: A+, A-, B+, B-, O+, O-, AB+, AB-

---

## 🔧 LANGKAH UPDATE

### **STEP 1: Update Struktur Google Sheets**

Buka Google Sheets Anda dan tambahkan kolom baru:

**Posisi Kolom Baru:**
```
... | Mendaftar Untuk | [NOMOR BIB] | Nama Lengkap | ...
                         ↑ INSERT DI SINI
```

**Urutan kolom yang benar:**
```
1. Created At
2. Updated At
3. Order ID
4. Email
5. Nomor Telepon
6. Mendaftar Untuk
7. NOMOR BIB          ← KOLOM BARU!
8. Nama Lengkap
9. Tanggal Lahir
10. Jenis Kelamin
11. Alamat
12. NIK
13. Nama BIB
14. Saluran Pendaftaran
15. Nama Saluran
16. Sumber Informasi
17. Golongan Darah
18. Penyakit Kronis
19. Perawatan Dokter
20. Minum Obat
21. Komplikasi Fisik
22. Pernah Pingsan     ← KOLOM BARU!
23. Nama Kontak Darurat
24. Nomor Kontak Darurat
25. Ukuran Jersey
26. Kategori Pendaftar
27. Jumlah Pembayaran
28. Status Pembayaran  ← PINDAH KE SINI (dari kolom 4)
29. Payment Date       ← PINDAH KE SINI (dari kolom 5)
30. Transaction ID     ← PINDAH KE SINI (dari kolom 6)
31. Payment Type       ← PINDAH KE SINI (dari kolom 7)
```

**Cara insert kolom:**
1. Klik header kolom **"Nama Lengkap"** (contoh: kolom L)
2. Klik kanan → **Insert 1 column left**
3. Rename kolom baru menjadi **"Nomor BIB"**
4. Klik header kolom **"Nama Kontak Darurat"** 
5. Klik kanan → **Insert 1 column left**
6. Rename kolom baru menjadi **"Pernah Pingsan"**

---

### **STEP 2: Backup Apps Script Lama**

1. Buka **Extensions → Apps Script**
2. Copy semua code yang ada
3. Simpan di file text sebagai backup

---

### **STEP 3: Replace dengan Code Baru**

Hapus semua code yang ada dan paste code di bawah ini:

```javascript
/**
 * Google Apps Script untuk Trail Run Ranu Segaran 2025
 * Features:
 * - CREATE: Simpan pendaftaran baru (status PENDING, BIB number kosong)
 * - UPDATE: Update status pembayaran
 * - AUTO BIB: Generate nomor BIB otomatis ketika status SUCCESS (format 4 digit: 0001, 0002, dst)
 */

// Configuration
const SHEET_NAME = 'Registrations'; // Nama sheet Anda
const BIB_COLUMN_INDEX = 7; // Kolom "Nomor BIB" (G = kolom ke-7)

// Kolom mapping (sesuaikan dengan struktur sheet Anda)
const COLUMNS = {
  CREATED_AT: 1,           // A: Created At
  UPDATED_AT: 2,           // B: Updated At
  ORDER_ID: 3,             // C: Order ID
  EMAIL: 4,                // D: Email
  PHONE_NUMBER: 5,         // E: Nomor Telepon
  REGISTERING_FOR: 6,      // F: Mendaftar Untuk
  BIB_NUMBER: 7,           // G: Nomor BIB ← BARU!
  NAME: 8,                 // H: Nama Lengkap
  BIRTH_DATE: 9,           // I: Tanggal Lahir
  GENDER: 10,              // J: Jenis Kelamin
  ADDRESS: 11,             // K: Alamat
  NATIONAL_ID: 12,         // L: NIK
  BIB_NAME: 13,            // M: Nama BIB
  REGISTRATION_CHANNEL: 14,// N: Saluran Pendaftaran
  REGISTRATION_CHANNEL_NAME: 15, // O: Nama Saluran
  INFO_SOURCE: 16,         // P: Sumber Informasi
  BLOOD_TYPE: 17,          // Q: Golongan Darah
  CHRONIC_CONDITION: 18,   // R: Penyakit Kronis
  UNDER_DOCTOR_CARE: 19,   // S: Perawatan Dokter
  REQUIRES_MEDICATION: 20, // T: Minum Obat
  EXPERIENCED_COMPLICATIONS: 21, // U: Komplikasi Fisik
  EXPERIENCED_FAINTING: 22,      // V: Pernah Pingsan ← BARU!
  EMERGENCY_CONTACT_NAME: 23,    // W: Nama Kontak Darurat
  EMERGENCY_CONTACT_PHONE: 24,   // X: Nomor Kontak Darurat
  SHIRT_SIZE: 25,          // Y: Ukuran Jersey
  PARTICIPANT_CATEGORY: 26,// Z: Kategori Pendaftar
  AMOUNT: 27,              // AA: Jumlah Pembayaran
  STATUS: 28,              // AB: Status Pembayaran (PINDAH KE SINI)
  PAYMENT_DATE: 29,        // AC: Payment Date (PINDAH KE SINI)
  TRANSACTION_ID: 30,      // AD: Transaction ID (PINDAH KE SINI)
  PAYMENT_TYPE: 31         // AE: Payment Type (PINDAH KE SINI)
};

/**
 * Main entry point untuk POST request dari Next.js
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'create') {
      return createRegistration(data.data);
    } else if (action === 'update') {
      return updateRegistration(data.orderId, data.data);
    } else if (action === 'getBib') {
      return getBibNumber(data.orderId);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Invalid action' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CREATE: Simpan registrasi baru dengan status PENDING
 */
function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Prepare row data (31 kolom total)
    const rowData = [
      data.createdAt || '',                    // A: Created At
      data.updatedAt || '',                    // B: Updated At
      data.orderId || '',                      // C: Order ID
      data.email || '',                        // D: Email
      data.phoneNumber || '',                  // E: Nomor Telepon
      data.registeringFor || '',               // F: Mendaftar Untuk
      '',                                      // G: Nomor BIB (kosong saat create)
      data.name || '',                         // H: Nama Lengkap
      data.birthDate || '',                    // I: Tanggal Lahir
      data.gender || '',                       // J: Jenis Kelamin
      data.address || '',                      // K: Alamat
      data.nationalId || '',                   // L: NIK
      data.bibName || '',                      // M: Nama BIB
      data.registrationChannel || '',          // N: Saluran Pendaftaran
      data.registrationChannelName || '',      // O: Nama Saluran
      data.infoSource || '',                   // P: Sumber Informasi
      data.bloodType || '',                    // Q: Golongan Darah
      data.chronicCondition || '',             // R: Penyakit Kronis
      data.underDoctorCare || '',              // S: Perawatan Dokter
      data.requiresMedication || '',           // T: Minum Obat
      data.experiencedComplications || '',     // U: Komplikasi Fisik
      data.experiencedFainting || '',          // V: Pernah Pingsan
      data.emergencyContactName || '',         // W: Nama Kontak Darurat
      data.emergencyContactPhone || '',        // X: Nomor Kontak Darurat
      data.shirtSize || '',                    // Y: Ukuran Jersey
      data.participantCategory || '',          // Z: Kategori Pendaftar
      data.amount || 0,                        // AA: Jumlah Pembayaran
      'PENDING',                               // AB: Status (default PENDING)
      '',                                      // AC: Payment Date (kosong)
      '',                                      // AD: Transaction ID (kosong)
      ''                                       // AE: Payment Type (kosong)
    ];

    // Append row
    sheet.appendRow(rowData);

    Logger.log('Registration created: ' + data.orderId);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error creating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * UPDATE: Update status registrasi dan generate BIB number jika SUCCESS
 */
function updateRegistration(orderId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by Order ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][COLUMNS.ORDER_ID - 1] === orderId) {
        rowIndex = i + 1; // Sheets index starts at 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Order ID not found: ' + orderId);
    }

    // Update status
    if (data.status) {
      sheet.getRange(rowIndex, COLUMNS.STATUS).setValue(data.status);
    }

    // Update payment info
    if (data.paymentDate) {
      sheet.getRange(rowIndex, COLUMNS.PAYMENT_DATE).setValue(data.paymentDate);
    }
    if (data.transactionId) {
      sheet.getRange(rowIndex, COLUMNS.TRANSACTION_ID).setValue(data.transactionId);
    }
    if (data.paymentType) {
      sheet.getRange(rowIndex, COLUMNS.PAYMENT_TYPE).setValue(data.paymentType);
    }

    // Generate BIB number jika status SUCCESS dan generateBibNumber = true
    if (data.status === 'SUCCESS' && data.generateBibNumber === true) {
      const bibNumber = generateNextBibNumber(sheet);
      sheet.getRange(rowIndex, COLUMNS.BIB_NUMBER).setValue(bibNumber);
      Logger.log('BIB number generated: ' + bibNumber + ' for Order ID: ' + orderId);
    }

    // Update timestamp
    const updatedAt = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(updatedAt);

    Logger.log('Registration updated: ' + orderId + ' - Status: ' + data.status);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error updating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generate nomor BIB berikutnya (auto-increment)
 * Format: 4 digit dengan leading zero (0001, 0002, ..., 9999)
 */
function generateNextBibNumber(sheet) {
  try {
    // Get all BIB numbers from column K (BIB_NUMBER)
    const bibColumnRange = sheet.getRange(2, COLUMNS.BIB_NUMBER, sheet.getLastRow() - 1, 1);
    const bibNumbers = bibColumnRange.getValues();

    // Filter dan convert ke integer (exclude kosong dan non-numeric)
    const existingBibs = bibNumbers
      .map(row => row[0])
      .filter(val => val !== '' && val !== null)
      .map(val => parseInt(val.toString().replace(/^0+/, '')) || 0) // Remove leading zeros untuk comparison
      .filter(val => !isNaN(val));

    // Find max BIB number
    let maxBib = 0;
    if (existingBibs.length > 0) {
      maxBib = Math.max(...existingBibs);
    }

    // Next BIB = max + 1
    const nextBib = maxBib + 1;

    // Format dengan 4 digit leading zero
    const formattedBib = Utilities.formatString('%04d', nextBib);

    Logger.log('Max BIB: ' + maxBib + ', Next BIB: ' + formattedBib);

    return formattedBib;

  } catch (error) {
    Logger.log('Error generating BIB number: ' + error.toString());
    // Fallback: return 0001 jika error
    return '0001';
  }
}

/**
 * GET BIB: Ambil nomor BIB dan status berdasarkan Order ID
 */
function getBibNumber(orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by Order ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][COLUMNS.ORDER_ID - 1] === orderId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Order ID not found: ' + orderId);
    }

    // Get BIB number and status
    const bibNumber = values[rowIndex][COLUMNS.BIB_NUMBER - 1];
    const status = values[rowIndex][COLUMNS.STATUS - 1];

    Logger.log('BIB fetched for ' + orderId + ': ' + bibNumber + ' (Status: ' + status + ')');

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        bibNumber: bibNumber || null,
        status: status || 'PENDING'
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error fetching BIB number: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function untuk generate BIB number (untuk debugging)
 */
function testGenerateBibNumber() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const bibNumber = generateNextBibNumber(sheet);
  Logger.log('Generated BIB Number: ' + bibNumber);
}
```

---

### **STEP 4: Deploy Apps Script**

1. **Klik tombol "Deploy"** (pojok kanan atas) → **New deployment**
2. **Type:** Web app
3. **Description:** "Update BIB Number System"
4. **Execute as:** Me
5. **Who has access:** Anyone
6. **Klik "Deploy"**
7. **Copy Web App URL** (akan digunakan di .env.local)

**Format URL:**
```
https://script.google.com/macros/s/XXXXXXXXXXXXXX/exec
```

---

### **STEP 5: Update .env.local di Next.js**

Pastikan `APPS_SCRIPT_ENTRYPOINT` di file `.env.local` sudah benar (gunakan URL dari Step 4).

```env
APPS_SCRIPT_ENTRYPOINT=https://script.google.com/macros/s/XXXXXX/exec
```

---

## 🧪 TESTING

### **Test 1: CREATE (Pendaftaran Baru)**

1. Buka website
2. Isi form pendaftaran
3. Submit form
4. Cek Google Sheets:
   - ✅ Row baru terisi
   - ✅ Status = PENDING
   - ✅ Nomor BIB = **kosong**
   - ✅ Kolom "Pernah Pingsan" terisi (Ya/Tidak)
   - ✅ Golongan Darah format baru (A+, B-, dll)

### **Test 2: UPDATE to SUCCESS (Generate BIB)**

**Manual Test:**
1. Buka Apps Script Editor
2. Pilih function **`updateRegistration`**
3. Klik **Run** dengan test data

**Or via Webhook:**
1. Lakukan pembayaran test di Midtrans
2. Tunggu webhook callback
3. Cek Google Sheets:
   - ✅ Status berubah = SUCCESS
   - ✅ Payment Date terisi
   - ✅ Nomor BIB terisi: **0001** (untuk yang pertama)
   - ✅ Nomor BIB kedua: **0002**
   - ✅ Dan seterusnya auto-increment

### **Test 3: Multiple SUCCESS (Auto-Increment)**

Lakukan beberapa pembayaran SUCCESS, cek:
```
Pembayaran 1: BIB = 0001
Pembayaran 2: BIB = 0002
Pembayaran 3: BIB = 0003
...
Pembayaran 25: BIB = 0025
Pembayaran 100: BIB = 0100
```

---

## 📊 STRUKTUR DATA SHEETS

**Contoh data setelah update:**

| Order ID | Email | ... | BIB | Nama | ... | Jumlah | Status | Payment Date |
|----------|-------|-----|-----|------|-----|--------|--------|--------------|
| ORD001   | john@email.com | ... | (kosong) | John Doe | ... | 150000 | PENDING | (kosong) |
| ORD002   | jane@email.com | ... | 0001 | Jane Smith | ... | 150000 | SUCCESS | 2025-11-16 10:30:00 |
| ORD003   | bob@email.com | ... | 0002 | Bob Wilson | ... | 150000 | SUCCESS | 2025-11-16 10:35:00 |
| ORD004   | alice@email.com | ... | (kosong) | Alice Brown | ... | 150000 | FAILED | (kosong) |
| ORD005   | charlie@email.com | ... | 0003 | Charlie Lee | ... | 150000 | SUCCESS | 2025-11-16 10:40:00 |

---

## ⚠️ TROUBLESHOOTING

### **Issue: BIB number tidak generate**

**Check:**
1. Apps Script deployed dengan permissions yang benar?
2. Column mapping benar? (BIB_NUMBER = kolom 11)
3. Check Logs di Apps Script: **View → Executions**

**Solution:**
```javascript
// Run test function di Apps Script
function testGenerateBibNumber() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const bibNumber = generateNextBibNumber(sheet);
  Logger.log('Generated BIB Number: ' + bibNumber);
}
```

### **Issue: Duplicate BIB numbers**

**Cause:** Race condition (2 requests bersamaan)

**Solution:** Apps Script sudah handle ini dengan `getLastRow()` real-time check.

### **Issue: Column index salah**

**Check:** Hitung manual kolom di sheets Anda, update `COLUMNS` object di Apps Script.

---

## 📝 CHANGELOG

**Version 2.0 - BIB Number System**

✅ **Added:**
- Kolom "Nomor BIB" (auto-increment 4 digit)
- Kolom "Pernah Pingsan" (kuesioner baru)
- Function `generateNextBibNumber()` untuk auto-increment
- Blood type expanded: A+, A-, B+, B-, O+, O-, AB+, AB-

✅ **Changed:**
- `createRegistration()`: Tambah kolom BIB (kosong) dan Pingsan
- `updateRegistration()`: Trigger BIB generation saat SUCCESS
- Column mapping: 29 kolom → 31 kolom

---

## 🎯 NEXT STEPS

1. ✅ Update Google Sheets struktur (tambah 2 kolom)
2. ✅ Update Apps Script code
3. ✅ Deploy Apps Script baru
4. ✅ Test pendaftaran baru
5. ✅ Test payment SUCCESS → BIB generate
6. ✅ Verify auto-increment working

---

**Selamat! Sistem Nomor BIB sudah siap digunakan!** 🎉
