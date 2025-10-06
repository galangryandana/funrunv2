# 🔄 UPDATE APPS SCRIPT - Support UPDATE Action

## 🎯 MASALAH

Saat user klik "Ubah Data Diri" dan submit ulang, sistem membuat **baris baru** di Google Sheets alih-alih **mengupdate baris yang sudah ada**.

## ✅ SOLUSI

Tambahkan action `update` di Apps Script untuk:
1. Cari row berdasarkan `orderId` (email)
2. Update row tersebut dengan data baru
3. **BIB number dan Payment Amount TETAP SAMA** (tidak berubah)

---

## 🔧 KODE APPS SCRIPT LENGKAP (WITH UPDATE SUPPORT)

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
// ✅ UPDATE REGISTRATION (NEW FUNCTION)
// ========================================

/**
 * Update existing registration data
 * Find row by email (orderId) and update with new data
 * BIB number and Payment Amount TIDAK berubah
 */
function updateRegistration(orderId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by email (orderId)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][COLUMNS.EMAIL - 1] === orderId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Registration not found for email: ' + orderId);
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
      data.registeringFor || '',              // E: Mendaftar Untuk
      data.name || '',                        // F: Nama Lengkap
      data.birthDate || '',                   // G: Tanggal lahir
      data.gender || '',                      // H: Jenis Kelamin
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP
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
 * Update payment proof URL in sheet by orderId
 */
function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find last row (most recent registration)
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
 * Test UPDATE function
 */
function testUpdate() {
  const testData = {
    email: 'test@example.com', // Email yang sudah ada di sheet
    phoneNumber: '081234567890',
    registeringFor: 'self',
    name: 'John Doe UPDATED', // Data yang diubah
    birthDate: '1990-01-01',
    gender: 'male',
    address: 'Jl. Updated No. 123', // Data yang diubah
    nationalId: '1234567890123456',
    bibName: 'JOHN',
    registrationChannel: 'personal',
    registrationChannelName: '',
    infoSource: 'social_media',
    bloodType: 'O+',
    chronicCondition: 'no',
    underDoctorCare: 'no',
    requiresMedication: 'no',
    experiencedComplications: 'no',
    experiencedFainting: 'no',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '081234567890',
    shirtSize: 'XL', // Data yang diubah
  };
  
  const result = updateRegistration('test@example.com', testData);
  Logger.log(result.getContent());
}
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Backup Current Script
```
1. Open: Google Sheets → Extensions → Apps Script
2. Copy all existing code
3. Save to text file as backup
```

### 2. Replace with New Code
```
1. Delete all existing code in Apps Script Editor
2. Copy COMPLETE code from above
3. Paste into Apps Script Editor
4. Update SHEET_NAME if needed (line 6)
5. Save (Ctrl+S / Cmd+S)
```

### 3. Test UPDATE Function
```
1. Create a test registration first (via frontend)
2. Note the email used
3. In Apps Script Editor, run: testUpdate()
4. Check logs - should show success
5. Check sheet - data should be updated (same row)
6. BIB number and Payment amount should NOT change
```

### 4. Deploy
```
1. Click: Deploy → Manage deployments
2. Click: Edit icon (✏️) on active deployment
3. Version: New version
4. Description: "Add UPDATE action support"
5. Click: Deploy
6. URL tetap sama - tidak perlu update .env.local
```

---

## 🧪 TESTING GUIDE

### Test 1: Create New Registration
```
1. Isi form baru dari awal
2. Submit → Payment page
3. Check sheet: Row baru dibuat
4. Note: Email, BIB, Payment Amount
```

### Test 2: Edit Existing Registration
```
1. Di payment page, klik "Ubah Data Diri"
2. Edit beberapa field (nama, alamat, ukuran jersey)
3. Submit ulang
4. Check console: Harus muncul "🔄 Update mode"
5. Check sheet:
   - ✅ Row yang sama ter-update (TIDAK buat row baru)
   - ✅ BIB number TETAP SAMA
   - ✅ Payment Amount TETAP SAMA
   - ✅ Data lain ter-update sesuai perubahan
   - ✅ "Updated At" timestamp berubah
```

### Test 3: Multiple Edits
```
1. Edit data → submit
2. Edit lagi → submit lagi
3. Check sheet: Tetap 1 row saja, tidak ada row baru
```

---

## 📊 EXPECTED BEHAVIOR

### Scenario: User Create New Registration
```
Sheet before:
Row 1: Header
Row 2: User A data

User B submit form
↓
Sheet after:
Row 1: Header
Row 2: User A data
Row 3: User B data ✅ NEW ROW
```

### Scenario: User Edit Existing Registration
```
Sheet before:
Row 1: Header
Row 2: User A data (name: "John", shirt: "L")

User A klik "Ubah Data Diri"
User A change name to "John Doe" and shirt to "XL"
User A submit
↓
Sheet after:
Row 1: Header
Row 2: User A data (name: "John Doe", shirt: "XL") ✅ UPDATED, NOT NEW ROW

BIB number: 0001 (tetap sama)
Payment amount: 200001 (tetap sama)
```

---

## ⚠️ IMPORTANT NOTES

1. **BIB Number dan Payment Amount TIDAK berubah** saat update
2. **Created At timestamp TIDAK berubah** saat update
3. **Updated At timestamp BERUBAH** setiap kali update
4. **Email (orderId) digunakan** untuk cari row yang akan di-update
5. Jika email tidak ditemukan, error "Registration not found"

---

## 🐛 TROUBLESHOOTING

### Error: "Registration not found for email"
**Cause:** Email tidak ada di sheet atau typo
**Solution:** 
- Check email di localStorage
- Check email di sheet (case sensitive)
- Pastikan exact match

### BIB number atau Payment amount berubah saat edit
**Cause:** Bug di updateRegistration function
**Solution:**
- Check baris 228-229 di script
- Pastikan `existingBibNumber` dan `existingPaymentAmount` di-retrieve dengan benar

### Row baru tetap dibuat saat edit
**Cause:** 
- Frontend tidak set `isEditMode = true`
- API route salah (hit `/create` instead of `/update`)

**Solution:**
- Check console logs saat submit
- Harus muncul "🔄 Update mode"
- Jika muncul "➕ Create mode", berarti `isEditMode` masih `false`

---

**Ready to deploy!** 🚀

Setelah deploy, test flow lengkap:
1. Create registration → check sheet (row baru)
2. Edit data → submit → check sheet (row yang sama, updated)
3. Edit lagi → submit → check sheet (masih row yang sama)
