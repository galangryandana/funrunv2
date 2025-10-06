# 🚀 APPS SCRIPT LENGKAP - FINAL VERSION
## ✅ Include Semua Fix: BIB Format, Indonesian Data, Update by KTP

Copy kode di bawah ini dan paste ke Google Apps Script Editor Anda.

---

```javascript
// ========================================
// GOOGLE APPS SCRIPT - FUN RUN REGISTRATION
// ========================================

const SHEET_NAME = 'Registrations'; // Nama sheet untuk data pendaftaran

// Column indexes (adjust based on your sheet structure)
const COLUMNS = {
  TIMESTAMP: 1,
  EMAIL: 2,
  NAME: 3,
  PHONE: 4,
  NATIONAL_ID: 5,
  ADDRESS: 6,
  EMERGENCY_CONTACT_NAME: 7,
  EMERGENCY_CONTACT_PHONE: 8,
  EMERGENCY_CONTACT_RELATION: 9,
  GENDER: 10,
  AGE: 11,
  PREVIOUS_EXPERIENCE: 12,
  HEARD_FROM: 13,
  JERSEY_SIZE: 14,
  RACE_PACK_DELIVERY: 15,
  DELIVERY_ADDRESS: 16,
  BIB_NUMBER: 17,
  PAYMENT_AMOUNT: 18,
  PAYMENT_PROOF_URL: 19,
  PAYMENT_STATUS: 20
};

// ========================================
// MAIN HANDLER
// ========================================

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    Logger.log('Received action: ' + action);

    switch (action) {
      case 'create':
        return createRegistration(requestData.formData);
      
      case 'update':
        return updateRegistration(requestData.orderId, requestData.formData);
      
      case 'uploadPaymentProof':
        const driveLink = uploadPaymentProof(
          requestData.orderId, 
          requestData.file,
          requestData.userName,
          requestData.nationalId
        );
        return updatePaymentProof(requestData.orderId, driveLink);
      
      default:
        return ContentService.createTextOutput(
          JSON.stringify({ success: false, error: 'Unknown action' })
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

function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Check if sheet exists
    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Generate auto-increment BIB and payment amount
    const lastRow = sheet.getLastRow();
    const registrationNumber = lastRow; // Row 2 = #1, Row 3 = #2, dst
    
    const bibNumber = generateBibNumber(registrationNumber);
    const paymentAmount = generatePaymentAmount(registrationNumber);

    Logger.log('Creating registration - BIB: ' + bibNumber + ' - Payment: ' + paymentAmount);

    // Prepare row data with Indonesian values (as received from API)
    const timestamp = new Date();
    const bibNumberWithPrefix = "'" + bibNumber; // ✅ Apostrophe prefix to preserve leading zeros

    const rowData = [
      timestamp,
      data.email || '',
      data.name || '',
      data.phone || '',
      data.nationalId || '',
      data.address || '',
      data.emergencyContactName || '',
      data.emergencyContactPhone || '',
      data.emergencyContactRelation || '',
      data.gender || '',
      data.age || '',
      data.previousExperience || '',
      data.heardFrom || '',
      data.jerseySize || '',
      data.racePackDelivery || '',
      data.deliveryAddress || '',
      bibNumberWithPrefix, // ✅ BIB dengan apostrophe prefix
      paymentAmount,
      '', // Payment proof URL (empty until uploaded)
      'Belum Bayar' // Payment status default
    ];

    // Append row to sheet
    sheet.appendRow(rowData);

    // ✅ FIX: Force format kolom BIB ke Plain Text
    const newLastRow = sheet.getLastRow();
    const bibCell = sheet.getRange(newLastRow, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@'); // Force plain text format

    Logger.log('Registration created - Row: ' + newLastRow);

    // Return orderId (using nationalId), bibNumber, and paymentAmount
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        orderId: data.nationalId, // ✅ orderId = National ID
        bibNumber: bibNumber, // Return without apostrophe
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
// UPDATE REGISTRATION
// ========================================

function updateRegistration(orderId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by National ID (orderId = nationalId)
    const lastRow = sheet.getLastRow();
    const nationalIdColumn = sheet.getRange(2, COLUMNS.NATIONAL_ID, lastRow - 1, 1).getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < nationalIdColumn.length; i++) {
      if (nationalIdColumn[i][0] === orderId) {
        rowIndex = i + 2; // +2 because array is 0-indexed and we skip header
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Registration not found for National ID: ' + orderId);
    }

    Logger.log('Found registration at row: ' + rowIndex);

    // Get existing data to preserve BIB, payment amount, payment proof, and status
    const existingRow = sheet.getRange(rowIndex, 1, 1, 20).getValues()[0];
    const existingTimestamp = existingRow[COLUMNS.TIMESTAMP - 1];
    const existingBib = existingRow[COLUMNS.BIB_NUMBER - 1];
    const existingPaymentAmount = existingRow[COLUMNS.PAYMENT_AMOUNT - 1];
    const existingPaymentProofUrl = existingRow[COLUMNS.PAYMENT_PROOF_URL - 1];
    const existingPaymentStatus = existingRow[COLUMNS.PAYMENT_STATUS - 1];

    // Update row data with new values (Indonesian data from API)
    const updatedRowData = [
      existingTimestamp, // Keep original timestamp
      data.email || '',
      data.name || '',
      data.phone || '',
      data.nationalId || '',
      data.address || '',
      data.emergencyContactName || '',
      data.emergencyContactPhone || '',
      data.emergencyContactRelation || '',
      data.gender || '',
      data.age || '',
      data.previousExperience || '',
      data.heardFrom || '',
      data.jerseySize || '',
      data.racePackDelivery || '',
      data.deliveryAddress || '',
      existingBib, // ✅ Preserve existing BIB
      existingPaymentAmount, // ✅ Preserve payment amount
      existingPaymentProofUrl || '', // Preserve payment proof URL
      existingPaymentStatus || 'Belum Bayar' // Preserve payment status
    ];

    // Update entire row
    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);

    // ✅ FIX: Force format kolom BIB ke Plain Text
    const bibCell = sheet.getRange(rowIndex, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@'); // Force plain text format

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
// UPLOAD PAYMENT PROOF TO GOOGLE DRIVE
// ========================================

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

    // ✅ Format nama file: NamaPeserta_NomorKTP.ext
    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanNationalId + extension;

    // Upload to main folder (NO SUBFOLDERS)
    const file = rootFolder.createFile(blob.setName(fileName));
    
    // Make file accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileUrl = file.getUrl();
    
    Logger.log('Payment proof uploaded: ' + fileName + ' → ' + fileUrl);
    
    return fileUrl;

  } catch (error) {
    Logger.log('Error uploading payment proof: ' + error.toString());
    throw new Error('Failed to upload payment proof: ' + error.toString());
  }
}

// ========================================
// UPDATE PAYMENT PROOF URL IN SHEET
// ========================================

function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // Find row by National ID (orderId = nationalId)
    const lastRow = sheet.getLastRow();
    const nationalIdColumn = sheet.getRange(2, COLUMNS.NATIONAL_ID, lastRow - 1, 1).getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < nationalIdColumn.length; i++) {
      if (nationalIdColumn[i][0] === orderId) {
        rowIndex = i + 2;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Registration not found for National ID: ' + orderId);
    }

    // Update payment proof URL and status
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_STATUS).setValue('Menunggu Verifikasi');

    Logger.log('Payment proof updated for row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        driveLink: driveLink,
        message: 'Payment proof uploaded successfully'
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error updating payment proof: ' + error.toString());
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
  const bibString = String(bibNum).padStart(4, '0');
  
  Logger.log('Generated BIB: ' + bibString + ' for registration #' + registrationNumber);
  
  return bibString;
}

/**
 * Generate unique payment amount: 200001, 200002, 200003, ...
 */
function generatePaymentAmount(registrationNumber) {
  const baseAmount = 200000;
  const uniqueAmount = baseAmount + registrationNumber;
  
  return uniqueAmount;
}

// ========================================
// BATCH FIX: Format Seluruh Kolom BIB
// ========================================

/**
 * Fix format kolom BIB untuk semua row existing
 * Run this ONCE to fix existing data
 * 
 * Cara run:
 * 1. Pilih function ini dari dropdown di Apps Script Editor
 * 2. Click Run (▶️)
 * 3. Check logs
 * 4. Verify di Google Sheets bahwa kolom BIB sudah Plain Text
 */
function fixAllBibFormats() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('No data to fix (only header row)');
      return;
    }
    
    // Get entire BIB column (skip header row)
    const bibRange = sheet.getRange(2, COLUMNS.BIB_NUMBER, lastRow - 1, 1);
    
    // Set format to plain text for all cells
    bibRange.setNumberFormat('@STRING@');
    
    Logger.log('✅ Fixed BIB format for ' + (lastRow - 1) + ' rows');
    Logger.log('Check Google Sheets - kolom BIB harus format "Plain text"');
    
  } catch (error) {
    Logger.log('Error fixing BIB formats: ' + error.toString());
  }
}
```

---

## 📋 CARA PAKAI

### 1. Copy Kode
- Copy semua kode di atas (dari `// ========` sampai bawah)

### 2. Paste ke Apps Script
1. Buka Google Sheets Anda
2. Extensions → Apps Script
3. **Delete** semua kode yang ada
4. **Paste** kode baru di atas
5. **Save** (Ctrl+S / Cmd+S)
6. **Rename** project (optional): "Fun Run Registration System"

### 3. Fix Data Lama (OPTIONAL)
Jika Anda sudah punya data lama dan ingin fix format BIB:

1. Di Apps Script Editor
2. Pilih function: `fixAllBibFormats` dari dropdown
3. Click **Run** (▶️)
4. **Authorize** jika diminta
5. Check logs: "✅ Fixed BIB format for X rows"
6. Check Google Sheets: kolom BIB harus format "Plain text"

### 4. Deploy
1. Click: **Deploy** → **New deployment**
2. Type: **Web app**
3. Description: "Fun Run Registration API - v1"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click: **Deploy**
7. **Copy URL** (Web app URL)
8. Paste URL ke file `.env.local` Next.js:
   ```
   GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXX/exec
   ```

### 5. Test
**Test CREATE:**
```
1. Clear localStorage di browser
2. Isi form → submit
3. Check Google Sheets:
   - BIB format: Plain text ✅
   - BIB value: 0001, 0002, dst ✅
```

**Test UPDATE:**
```
1. Klik "Ubah Data Diri"
2. Edit data → submit
3. Check Google Sheets:
   - BIB format: tetap Plain text ✅
   - BIB value: tetap 0001 (tidak jadi 1) ✅
```

---

## ✅ FEATURES INCLUDE

1. ✅ **BIB Format Fix** - Format Plain Text via `setNumberFormat('@STRING@')`
2. ✅ **Indonesian Data** - Semua data di sheet dalam Bahasa Indonesia
3. ✅ **Update by KTP** - Lookup registration by National ID (Nomor KTP)
4. ✅ **File Naming** - Format: `NamaPeserta_NomorKTP.ext`
5. ✅ **Single Folder** - No monthly subfolders
6. ✅ **Preserve BIB & Amount** - BIB dan Payment Amount tidak berubah saat update
7. ✅ **Batch Fix Function** - `fixAllBibFormats()` untuk fix data lama

---

## 🔧 CONFIGURATION

### Adjust Column Indexes
Jika struktur sheet Anda berbeda, adjust `COLUMNS` object:

```javascript
const COLUMNS = {
  TIMESTAMP: 1,
  EMAIL: 2,
  NAME: 3,
  // ... adjust sesuai sheet Anda
  BIB_NUMBER: 17,  // ← Kolom BIB di kolom ke-17
  PAYMENT_AMOUNT: 18,
  // ...
};
```

### Adjust Folder Name
Untuk ganti nama folder Google Drive:

```javascript
const rootFolderName = 'Payment Proofs - Trail Run'; // ← Ganti ini
```

---

## 📊 HEADER SHEET YANG DIPERLUKAN

Pastikan Google Sheets Anda punya header di row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Email | Nama Lengkap | No. HP | Nomor KTP | Alamat | Nama Kontak Darurat | No. HP Kontak Darurat | Hubungan | Jenis Kelamin | Usia | Pengalaman | Sumber Info | Ukuran Jersey | Pengambilan Race Pack | Alamat Pengiriman | Nomor BIB | Jumlah Transfer | Bukti Pembayaran | Status Pembayaran |

---

**Silakan copy dan test!** 🚀
