# 🔧 PERBAIKAN APPS SCRIPT - 3 KOREKSI

## 📋 MASALAH YANG DIPERBAIKI

1. ✅ **Nomor BIB** terupload dengan format **0005** (bukan 5)
2. ✅ **Bukti pembayaran** disimpan di **1 folder utama** (tanpa subfolder)
3. ✅ **Nama file bukti pembayaran**: `NamaPeserta_NomorKTP.ext`

---

## 🔧 KODE APPS SCRIPT YANG SUDAH DIPERBAIKI

Copy kode lengkap di bawah ini ke Google Apps Script Editor Anda:

```javascript
// ========================================
// CONFIGURATION
// ========================================

const SHEET_NAME = 'Sheet1'; // Ganti dengan nama sheet Anda

const COLUMNS = {
  CREATED_AT: 1,                    // A
  UPDATED_AT: 2,                    // B
  EMAIL: 3,                         // C
  PHONE_NUMBER: 4,                  // D
  REGISTERING_FOR: 5,               // E
  NAME: 6,                          // F
  BIRTH_DATE: 7,                    // G
  GENDER: 8,                        // H
  ADDRESS: 9,                       // I
  NATIONAL_ID: 10,                  // J
  BIB_NAME: 11,                     // K
  REGISTRATION_CHANNEL: 12,         // L
  REGISTRATION_CHANNEL_NAME: 13,    // M
  INFO_SOURCE: 14,                  // N
  BLOOD_TYPE: 15,                   // O
  CHRONIC_CONDITION: 16,            // P
  UNDER_DOCTOR_CARE: 17,            // Q
  REQUIRES_MEDICATION: 18,          // R
  EXPERIENCED_COMPLICATIONS: 19,    // S
  EXPERIENCED_FAINTING: 20,         // T
  EMERGENCY_CONTACT_NAME: 21,       // U
  EMERGENCY_CONTACT_PHONE: 22,      // V
  SHIRT_SIZE: 23,                   // W
  PAYMENT_AMOUNT: 24,               // X
  PAYMENT_PROOF_URL: 25,            // Y
  BIB_NUMBER: 26,                   // Z
};

// ========================================
// MAIN ENTRY POINT
// ========================================

/**
 * Main entry point for all API calls
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'create') {
      return createRegistration(data.data);
    } else if (action === 'uploadPaymentProof') {
      // Upload file to Drive first
      const driveLink = uploadPaymentProof(
        data.orderId, 
        data.file, 
        data.userName,      // ✅ NEW: Nama peserta
        data.nationalId     // ✅ NEW: Nomor KTP
      );
      // Then update sheet with link
      return updatePaymentProof(data.orderId, driveLink);
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

// ========================================
// CREATE REGISTRATION
// ========================================

/**
 * Create new registration with auto-generated BIB and Payment Amount
 */
function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Generate BIB number and Payment Amount (same logic, sequential)
    const registrationNumber = sheet.getLastRow(); // Row 2 = 1st, Row 3 = 2nd, dst
    const bibNumber = generateBibNumber(registrationNumber);
    const paymentAmount = generatePaymentAmount(registrationNumber);

    // Format timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // ✅ FIX 1: Tambahkan apostrophe (') di depan BIB number agar tersimpan sebagai text
    const bibNumberWithPrefix = "'" + bibNumber;

    // Prepare row data (26 kolom)
    const rowData = [
      timestamp,                              // A: Created At
      timestamp,                              // B: Updated At
      data.email || '',                       // C: Email
      "'" + (data.phoneNumber || ''),         // D: No Telepon (with apostrophe)
      data.registeringFor || '',              // E: Mendaftar Untuk
      data.name || '',                        // F: Nama Lengkap
      data.birthDate || '',                   // G: Tanggal lahir
      data.gender || '',                      // H: Jenis Kelamin
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP (with apostrophe)
      data.bibName || '',                     // K: Nama BIB
      data.registrationChannel || '',         // L: Terdaftar Dari
      data.registrationChannelName || '',     // M: Nama (Terdaftar Dari)
      data.infoSource || '',                  // N: Sumber Info
      data.bloodType || '',                   // O: Golongan Darah
      data.chronicCondition || '',            // P: Penyakit Kronis
      data.underDoctorCare || '',             // Q: Dalam Perawatan Dokter
      data.requiresMedication || '',          // R: Harus Minum Obat
      data.experiencedComplications || '',    // S: Kejadian Buruk Terkait Penyakit
      data.experiencedFainting || '',         // T: Pernah Pingsan
      data.emergencyContactName || '',        // U: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // V: Kontak Darurat Telepon (with apostrophe)
      data.shirtSize || '',                   // W: Ukuran Jersey
      paymentAmount,                          // X: Jumlah Payment (AUTO-GENERATED)
      '',                                     // Y: Link Bukti Bayar (kosong, diisi setelah upload)
      bibNumberWithPrefix,                    // Z: Nomor BIB (AUTO-GENERATED with apostrophe prefix)
    ];

    // Append row
    sheet.appendRow(rowData);

    Logger.log('Registration created - BIB: ' + bibNumber + ' - Payment: ' + paymentAmount);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        bibNumber: bibNumber,
        paymentAmount: paymentAmount
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error creating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Generate BIB number in format: 0001, 0002, 0003, ..., 9999
 * Returns STRING with leading zeros
 */
function generateBibNumber(registrationNumber) {
  const bibNum = registrationNumber;
  const bibString = String(bibNum).padStart(4, '0'); // Pad with zeros to 4 digits
  
  Logger.log('Generated BIB: ' + bibString + ' for registration #' + registrationNumber);
  
  return bibString; // Return as STRING with padding
}

/**
 * Generate unique payment amount: 200001, 200002, 200003, ...
 */
function generatePaymentAmount(registrationNumber) {
  const baseAmount = 200000;
  const uniqueAmount = baseAmount + registrationNumber;
  
  return uniqueAmount;
}

/**
 * ✅ FIX 2 & 3: Upload payment proof to single main folder with format NamaPeserta_NomorKTP.ext
 * 
 * @param {string} orderId - Order ID (not used in filename anymore)
 * @param {object} fileData - File data object with name, mimeType, data
 * @param {string} userName - Nama peserta lengkap
 * @param {string} nationalId - Nomor KTP peserta
 * @returns {string} Google Drive file URL
 */
function uploadPaymentProof(orderId, fileData, userName, nationalId) {
  try {
    // ✅ FIX 2: SINGLE MAIN FOLDER (no month subfolders)
    const rootFolderName = 'Payment Proofs - Trail Run';
    let rootFolder;
    
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);
    }

    // Decode base64 and create blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.mimeType,
      fileData.name
    );

    // Get file extension
    const originalName = fileData.name;
    const lastDot = originalName.lastIndexOf('.');
    const extension = lastDot > 0 ? originalName.substring(lastDot) : '.jpg';

    // ✅ FIX 3: Format nama file: NamaPeserta_NomorKTP.ext
    // Clean userName and nationalId for filename (remove special characters)
    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');

    // Create filename: NamaPeserta_NomorKTP.ext
    const fileName = cleanUserName + '_' + cleanNationalId + extension;

    // Upload to main folder (NO SUBFOLDERS)
    const file = rootFolder.createFile(blob.setName(fileName));

    // Make file shareable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getUrl();
    Logger.log('Payment proof uploaded: ' + fileName + ' → ' + fileUrl);

    return fileUrl;

  } catch (error) {
    Logger.log('Error uploading to Drive: ' + error.toString());
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}

/**
 * Update payment proof URL in sheet by orderId (using email column as identifier)
 */
function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by email (since we don't have ORDER_ID column)
    // We'll update the last row as a simple approach
    const lastRow = sheet.getLastRow();

    // Update payment proof URL
    sheet.getRange(lastRow, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    // Update timestamp
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(lastRow, COLUMNS.UPDATED_AT).setValue(timestamp);

    Logger.log('Payment proof updated for row: ' + lastRow);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, driveLink: driveLink })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error updating payment proof: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get BIB number by orderId (email)
 */
function getBibNumber(orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by email
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][COLUMNS.EMAIL - 1] === orderId) {
        const bibNumber = values[i][COLUMNS.BIB_NUMBER - 1];
        
        // Remove apostrophe prefix if exists
        const cleanBibNumber = typeof bibNumber === 'string' && bibNumber.startsWith("'") 
          ? bibNumber.substring(1) 
          : String(bibNumber);
        
        return ContentService.createTextOutput(
          JSON.stringify({ 
            success: true, 
            bibNumber: cleanBibNumber 
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: 'Order ID not found' 
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error getting BIB number: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// TEST FUNCTIONS
// ========================================

/**
 * Test BIB and Payment generation
 */
function testGeneration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  const lastRow = sheet.getLastRow();
  const registrationNumber = lastRow;
  
  const bib = generateBibNumber(registrationNumber);
  const payment = generatePaymentAmount(registrationNumber);
  
  Logger.log('Registration #' + registrationNumber);
  Logger.log('BIB: ' + bib);
  Logger.log('Payment: ' + payment);
}

/**
 * Test file naming format
 */
function testFileNaming() {
  const userName = "John Doe";
  const nationalId = "1234567890123456";
  const extension = ".jpg";
  
  const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanNationalId = nationalId.replace(/[^0-9]/g, '');
  
  const fileName = cleanUserName + '_' + cleanNationalId + extension;
  
  Logger.log('Generated filename: ' + fileName);
  // Expected: John_Doe_1234567890123456.jpg
}
```

---

## 🚀 LANGKAH DEPLOYMENT

### 1. Backup Apps Script Lama
```
1. Buka Google Sheets → Extensions → Apps Script
2. Copy semua kode yang ada
3. Save di text file sebagai backup
```

### 2. Replace dengan Kode Baru
```
1. Delete semua kode yang ada di Apps Script Editor
2. Copy kode lengkap dari atas
3. Paste ke Apps Script Editor
4. Update SHEET_NAME jika perlu (baris 6)
5. Save (Ctrl+S / Cmd+S)
```

### 3. Test Function
```
1. Pilih function: testGeneration
2. Click Run (▶)
3. Check logs - harus tampil BIB dengan format 0001, 0002, dst
4. Pilih function: testFileNaming
5. Click Run
6. Check logs - harus tampil format: NamaPeserta_NomorKTP.jpg
```

### 4. Deploy Ulang
```
1. Click: Deploy → Manage deployments
2. Click Edit icon (✏️) pada deployment yang aktif
3. Version: New version
4. Description: "Fix BIB format, folder structure, and filename"
5. Click: Deploy
6. URL tetap sama, tidak perlu update .env.local
```

### 5. Test dari Frontend
```
1. Submit registrasi baru
2. Check Google Sheets - BIB harus format 0005 (bukan 5)
3. Upload bukti pembayaran
4. Check Google Drive:
   - Folder: "Payment Proofs - Trail Run" (tanpa subfolder)
   - Nama file: "NamaPeserta_NomorKTP.jpg"
```

---

## ✅ RINGKASAN PERUBAHAN

### 1. Format BIB Number (Baris 83)
**Sebelum:**
```javascript
bibNumber,  // Z: Nomor BIB
```

**Sesudah:**
```javascript
const bibNumberWithPrefix = "'" + bibNumber;
...
bibNumberWithPrefix,  // Z: Nomor BIB (dengan apostrophe prefix)
```

**Hasil:** BIB tersimpan sebagai `'0005` di sheet, tampil sebagai `0005` (bukan `5`)

---

### 2. Struktur Folder (Baris 128-140)
**Sebelum:**
```javascript
// Create month folder (YYYY-MM)
const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');
let monthFolder = rootFolder.getFoldersByName(monthFolderName)...
```

**Sesudah:**
```javascript
// ✅ SINGLE MAIN FOLDER (no subfolders)
const rootFolderName = 'Payment Proofs - Trail Run';
let rootFolder = DriveApp.getFoldersByName(rootFolderName)...
// Upload langsung ke rootFolder (NO SUBFOLDERS)
```

**Hasil:** Semua file di 1 folder utama: `Payment Proofs - Trail Run`

---

### 3. Format Nama File (Baris 150-159)
**Sebelum:**
```javascript
const fileName = orderId + '_' + fileData.name;
```

**Sesudah:**
```javascript
const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
const fileName = cleanUserName + '_' + cleanNationalId + extension;
```

**Hasil:** File bernama `JohnDoe_1234567890123456.jpg`

---

## 🧪 TESTING CHECKLIST

- [ ] BIB number tampil sebagai `0005` (bukan `5`) di Google Sheets
- [ ] Payment proof tersimpan di folder `Payment Proofs - Trail Run` (tanpa subfolder)
- [ ] Nama file format: `NamaPeserta_NomorKTP.ext`
- [ ] Registration baru masih berjalan normal
- [ ] Upload bukti pembayaran berhasil
- [ ] Link Google Drive muncul di sheet

---

## ⚠️ CATATAN PENTING

1. **URL Apps Script tidak berubah** setelah update → tidak perlu ganti `.env.local`
2. **Data lama tetap aman** → hanya registrasi baru yang menggunakan format baru
3. **Jika perlu migrate data lama**, bisa run script manual di Apps Script untuk update format BIB
4. **Next.js API juga perlu update** untuk mengirim `userName` dan `nationalId` saat upload

---

Lanjut ke update **Next.js API** untuk mengirim `userName` dan `nationalId`! 🚀
