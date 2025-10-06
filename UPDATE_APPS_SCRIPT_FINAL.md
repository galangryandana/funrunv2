# 🔧 UPDATE APPS SCRIPT - FINAL VERSION

## 🎯 PERUBAHAN

1. ✅ **orderId = Nomor KTP** (bukan email)
2. ✅ **Cari row berdasarkan NATIONAL_ID** (kolom J)
3. ✅ **Data di sheet dalam Bahasa Indonesia**

---

## 📋 DATA MAPPING (English → Indonesian)

### Mendaftar Untuk:
- `self` → `Diri Sendiri`
- `other` → `Orang Lain`

### Jenis Kelamin:
- `male` → `Pria`
- `female` → `Wanita`

### Terdaftar Dari:
- `community` → `Komunitas`
- `company` → `Perusahaan`
- `organization` → `Organisasi`
- `personal` → `Personal`

### Sumber Info:
- `friend` → `Teman`
- `social_media` → `Sosial Media`
- `print_media` → `Media Cetak`

### Yes/No Fields:
- `yes` → `Ya`
- `no` → `Tidak`

---

## 🔧 KODE APPS SCRIPT LENGKAP

Copy kode ini ke Google Apps Script Editor, **REPLACE semua kode yang ada**:

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
  NATIONAL_ID: 10,                  // J ✅ DIGUNAKAN UNTUK CARI ROW
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
      // CREATE new registration
      return createRegistration(data.data);
      
    } else if (action === 'update') {
      // ✅ UPDATE existing registration
      return updateRegistration(data.orderId, data.data);
      
    } else if (action === 'uploadPaymentProof') {
      // Upload payment proof to Drive
      const driveLink = uploadPaymentProof(
        data.orderId, 
        data.file, 
        data.userName,
        data.nationalId
      );
      return updatePaymentProof(data.orderId, driveLink);
      
    } else if (action === 'getBib') {
      // Get BIB number by orderId
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
 * ✅ Data sudah dalam Bahasa Indonesia dari Frontend
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

    // ✅ Tambahkan apostrophe (') di depan BIB number agar tersimpan sebagai text
    const bibNumberWithPrefix = "'" + bibNumber;

    // Prepare row data (26 kolom)
    const rowData = [
      timestamp,                              // A: Created At
      timestamp,                              // B: Updated At
      data.email || '',                       // C: Email
      "'" + (data.phoneNumber || ''),         // D: No Telepon (with apostrophe)
      data.registeringFor || '',              // E: Mendaftar Untuk (✅ Bahasa Indonesia)
      data.name || '',                        // F: Nama Lengkap
      data.birthDate || '',                   // G: Tanggal lahir
      data.gender || '',                      // H: Jenis Kelamin (✅ Bahasa Indonesia)
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP (with apostrophe) ✅ UNIQUE IDENTIFIER
      data.bibName || '',                     // K: Nama BIB
      data.registrationChannel || '',         // L: Terdaftar Dari (✅ Bahasa Indonesia)
      data.registrationChannelName || '',     // M: Nama (Terdaftar Dari)
      data.infoSource || '',                  // N: Sumber Info (✅ Bahasa Indonesia)
      data.bloodType || '',                   // O: Golongan Darah
      data.chronicCondition || '',            // P: Penyakit Kronis (✅ Bahasa Indonesia: Ya/Tidak)
      data.underDoctorCare || '',             // Q: Dalam Perawatan Dokter (✅ Bahasa Indonesia: Ya/Tidak)
      data.requiresMedication || '',          // R: Harus Minum Obat (✅ Bahasa Indonesia: Ya/Tidak)
      data.experiencedComplications || '',    // S: Kejadian Buruk Terkait Penyakit (✅ Bahasa Indonesia: Ya/Tidak)
      data.experiencedFainting || '',         // T: Pernah Pingsan (✅ Bahasa Indonesia: Ya/Tidak)
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
// ✅ UPDATE REGISTRATION (CARI BERDASARKAN NATIONAL_ID)
// ========================================

/**
 * Update existing registration data
 * ✅ Find row by NATIONAL_ID (Nomor KTP) - orderId
 * ✅ Data sudah dalam Bahasa Indonesia dari Frontend
 * BIB number dan Payment Amount TIDAK berubah
 */
function updateRegistration(orderId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // ✅ Find row by NATIONAL_ID (orderId = Nomor KTP)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) { // Skip header row
      // Remove apostrophe dari stored value untuk comparison
      const storedNationalId = String(values[i][COLUMNS.NATIONAL_ID - 1]).replace(/^'/, '');
      const searchNationalId = String(orderId).replace(/^'/, '');
      
      if (storedNationalId === searchNationalId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Registration not found for Nomor KTP: ' + orderId);
    }

    Logger.log('Found registration at row: ' + rowIndex);

    // Format timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // ✅ Update HANYA data yang berubah, BIB & Payment Amount TETAP
    // Get existing BIB and Payment Amount (tidak berubah)
    const existingBibNumber = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
    const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];

    // Update row data (keep same structure as create)
    const updatedRowData = [
      values[rowIndex - 1][COLUMNS.CREATED_AT - 1], // A: Created At (tidak berubah)
      timestamp,                              // B: Updated At (UPDATE)
      data.email || '',                       // C: Email
      "'" + (data.phoneNumber || ''),         // D: No Telepon
      data.registeringFor || '',              // E: Mendaftar Untuk (✅ Bahasa Indonesia)
      data.name || '',                        // F: Nama Lengkap
      data.birthDate || '',                   // G: Tanggal lahir
      data.gender || '',                      // H: Jenis Kelamin (✅ Bahasa Indonesia)
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP
      data.bibName || '',                     // K: Nama BIB
      data.registrationChannel || '',         // L: Terdaftar Dari (✅ Bahasa Indonesia)
      data.registrationChannelName || '',     // M: Nama (Terdaftar Dari)
      data.infoSource || '',                  // N: Sumber Info (✅ Bahasa Indonesia)
      data.bloodType || '',                   // O: Golongan Darah
      data.chronicCondition || '',            // P: Penyakit Kronis (✅ Bahasa Indonesia)
      data.underDoctorCare || '',             // Q: Dalam Perawatan Dokter (✅ Bahasa Indonesia)
      data.requiresMedication || '',          // R: Harus Minum Obat (✅ Bahasa Indonesia)
      data.experiencedComplications || '',    // S: Kejadian Buruk Terkait Penyakit (✅ Bahasa Indonesia)
      data.experiencedFainting || '',         // T: Pernah Pingsan (✅ Bahasa Indonesia)
      data.emergencyContactName || '',        // U: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // V: Kontak Darurat Telepon
      data.shirtSize || '',                   // W: Ukuran Jersey
      existingPaymentAmount,                  // X: Payment Amount (TIDAK BERUBAH)
      values[rowIndex - 1][COLUMNS.PAYMENT_PROOF_URL - 1], // Y: Payment Proof URL (tidak berubah)
      existingBibNumber,                      // Z: BIB Number (TIDAK BERUBAH)
    ];

    // Update entire row
    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);

    Logger.log('Registration updated - Row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        message: 'Registration updated successfully',
        rowIndex: rowIndex
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error updating registration: ' + error.toString());
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
 * Upload payment proof to single main folder with format NamaPeserta_NomorKTP.ext
 */
function uploadPaymentProof(orderId, fileData, userName, nationalId) {
  try {
    // SINGLE MAIN FOLDER (no month subfolders)
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

    // Format nama file: NamaPeserta_NomorKTP.ext
    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
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
 * ✅ Update payment proof URL in sheet by NATIONAL_ID (orderId)
 */
function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // ✅ Find row by NATIONAL_ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      const storedNationalId = String(values[i][COLUMNS.NATIONAL_ID - 1]).replace(/^'/, '');
      const searchNationalId = String(orderId).replace(/^'/, '');
      
      if (storedNationalId === searchNationalId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Registration not found for Nomor KTP: ' + orderId);
    }

    // Update payment proof URL
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    // Update timestamp
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(timestamp);

    Logger.log('Payment proof updated for row: ' + rowIndex);

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
 * ✅ Get BIB number by NATIONAL_ID (orderId)
 */
function getBibNumber(orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // ✅ Find row by NATIONAL_ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      const storedNationalId = String(values[i][COLUMNS.NATIONAL_ID - 1]).replace(/^'/, '');
      const searchNationalId = String(orderId).replace(/^'/, '');
      
      if (storedNationalId === searchNationalId) {
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
        error: 'Registration not found for Nomor KTP: ' + orderId 
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
 * Test UPDATE function by NATIONAL_ID
 */
function testUpdate() {
  const testNationalId = '1234567890123456'; // Ganti dengan Nomor KTP yang ada di sheet
  
  const testData = {
    email: 'updated@example.com',
    phoneNumber: '081234567890',
    registeringFor: 'Diri Sendiri', // ✅ Bahasa Indonesia
    name: 'John Doe UPDATED',
    birthDate: '1990-01-01',
    gender: 'Pria', // ✅ Bahasa Indonesia
    address: 'Jl. Updated No. 123',
    nationalId: testNationalId,
    bibName: 'JOHN',
    registrationChannel: 'Personal', // ✅ Bahasa Indonesia
    registrationChannelName: '',
    infoSource: 'Sosial Media', // ✅ Bahasa Indonesia
    bloodType: 'O+',
    chronicCondition: 'Tidak', // ✅ Bahasa Indonesia
    underDoctorCare: 'Tidak', // ✅ Bahasa Indonesia
    requiresMedication: 'Tidak', // ✅ Bahasa Indonesia
    experiencedComplications: 'Tidak', // ✅ Bahasa Indonesia
    experiencedFainting: 'Tidak', // ✅ Bahasa Indonesia
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '081234567890',
    shirtSize: 'XL',
  };
  
  const result = updateRegistration(testNationalId, testData);
  Logger.log(result.getContent());
}
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Backup Current Script
1. Open: Google Sheets → Extensions → Apps Script
2. Copy all existing code
3. Save to text file as backup

### 2. Replace with New Code
1. Delete all existing code in Apps Script Editor
2. Copy COMPLETE code from above
3. Paste into Apps Script Editor
4. **Update SHEET_NAME** if needed (line 6)
5. Save (Ctrl+S / Cmd+S)

### 3. Test UPDATE Function
1. Isi form dari frontend → submit (create row baru)
2. Note the Nomor KTP yang digunakan
3. In Apps Script Editor:
   - Edit `testUpdate()` function
   - Ganti `testNationalId` dengan Nomor KTP yang ada
   - Run `testUpdate()`
4. Check logs - should show success
5. Check sheet - data should be updated (same row)

### 4. Deploy
1. Click: Deploy → Manage deployments
2. Click: Edit icon (✏️) on active deployment
3. Version: **New version**
4. Description: "Use NATIONAL_ID as orderId + Indonesian data"
5. Click: **Deploy**
6. URL tetap sama - tidak perlu update `.env.local`

---

## 🧪 TESTING GUIDE

### Test 1: Data Bahasa Indonesia di Sheet

**Steps:**
1. Clear localStorage (F12 console):
   ```javascript
   localStorage.removeItem('funrun_registration_data');
   ```
2. Refresh page
3. Isi form baru lengkap
4. Submit → payment page
5. **Check Google Sheets:**
   - Kolom "Mendaftar Untuk": `Diri Sendiri` atau `Orang Lain` ✅
   - Kolom "Jenis Kelamin": `Pria` atau `Wanita` ✅
   - Kolom "Terdaftar Dari": `Komunitas` / `Perusahaan` / `Organisasi` / `Personal` ✅
   - Kolom "Sumber Info": `Teman` / `Sosial Media` / `Media Cetak` ✅
   - Kolom "Penyakit Kronis": `Ya` atau `Tidak` ✅
   - Semua kolom yes/no: `Ya` atau `Tidak` ✅

### Test 2: Update Berdasarkan Nomor KTP

**Steps:**
1. **Dari Test 1**, note Nomor KTP yang diinput
2. Klik "Ubah Data Diri"
3. Edit beberapa field
4. Submit ulang
5. **Check console:** `🔄 Update mode: updating existing registration`
6. **Check sheet:**
   - Row yang sama ter-update ✅
   - BIB number TETAP SAMA ✅
   - Payment Amount TETAP SAMA ✅
   - Data ter-update dengan Bahasa Indonesia ✅

---

## ✅ EXPECTED RESULT

### Contoh Data di Sheet (Bahasa Indonesia):

| Mendaftar Untuk | Jenis Kelamin | Terdaftar Dari | Sumber Info | Penyakit Kronis |
|----------------|---------------|----------------|-------------|-----------------|
| Diri Sendiri   | Pria          | Komunitas      | Sosial Media | Tidak          |
| Orang Lain     | Wanita        | Personal       | Teman        | Ya             |

**Bukan lagi:**
| Mendaftar Untuk | Jenis Kelamin | Terdaftar Dari | Sumber Info | Penyakit Kronis |
|----------------|---------------|----------------|-------------|-----------------|
| self           | male          | community      | social_media | no             |

---

## 📝 CATATAN PENTING

1. **orderId sekarang = Nomor KTP** (16 digit)
2. **Semua data di sheet dalam Bahasa Indonesia**
3. **Update registration cari row berdasarkan Nomor KTP**
4. **Data lama (sebelum update ini) tidak otomatis ter-convert** ke Bahasa Indonesia
5. **Registrasi baru** (mulai sekarang) otomatis dalam Bahasa Indonesia

---

**Ready to deploy!** 🚀
