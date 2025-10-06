# 🚀 APPS SCRIPT - FINAL FIXED VERSION
## ✅ Include: BIB Format Fix + Correct Data Structure + Logging

**PENTING:** Copy SEMUA kode di bawah ini dan REPLACE semua kode di Apps Script Editor Anda.

---

```javascript
// ========================================
// CONFIGURATION
// ========================================

const SHEET_NAME = 'Sheet1'; // ⚠️ GANTI dengan nama sheet Anda!

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
  NATIONAL_ID: 10,                  // J - UNIQUE IDENTIFIER
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

function doPost(e) {
  try {
    Logger.log('=== doPost START ===');
    Logger.log('Raw postData: ' + e.postData.contents);
    
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    Logger.log('Action: ' + action);
    Logger.log('Request data keys: ' + Object.keys(requestData).join(', '));

    if (action === 'create') {
      Logger.log('Calling createRegistration with data: ' + JSON.stringify(requestData.data));
      return createRegistration(requestData.data);
      
    } else if (action === 'update') {
      Logger.log('Calling updateRegistration with orderId: ' + requestData.orderId);
      return updateRegistration(requestData.orderId, requestData.data);
      
    } else if (action === 'uploadPaymentProof') {
      const driveLink = uploadPaymentProof(
        requestData.orderId, 
        requestData.file,
        requestData.userName,
        requestData.nationalId
      );
      return updatePaymentProof(requestData.orderId, driveLink);
      
    } else if (action === 'getBib') {
      return getBibNumber(requestData.orderId);
      
    } else {
      Logger.log('Unknown action: ' + action);
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Unknown action: ' + action })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
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
    Logger.log('=== createRegistration START ===');
    Logger.log('Received data type: ' + typeof data);
    Logger.log('Data keys: ' + (data ? Object.keys(data).join(', ') : 'data is null/undefined'));
    
    if (!data) {
      throw new Error('Data is undefined or null');
    }
    
    if (!data.email) {
      Logger.log('ERROR: data.email is missing!');
      Logger.log('Full data: ' + JSON.stringify(data));
      throw new Error('Email is required but not found in data');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Generate BIB and payment amount
    const registrationNumber = sheet.getLastRow();
    const bibNumber = generateBibNumber(registrationNumber);
    const paymentAmount = generatePaymentAmount(registrationNumber);

    Logger.log('Generated BIB: ' + bibNumber + ', Payment: ' + paymentAmount);

    // Format timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // Apostrophe prefix for BIB to preserve leading zeros
    const bibNumberWithPrefix = "'" + bibNumber;

    // Prepare row data
    const rowData = [
      timestamp,                              // A: Created At
      timestamp,                              // B: Updated At
      data.email || '',                       // C: Email
      "'" + (data.phoneNumber || ''),         // D: Phone
      data.registeringFor || '',              // E: Mendaftar Untuk
      data.name || '',                        // F: Nama
      data.birthDate || '',                   // G: Tanggal Lahir
      data.gender || '',                      // H: Jenis Kelamin
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP
      data.bibName || '',                     // K: Nama BIB
      data.registrationChannel || '',         // L: Terdaftar Dari
      data.registrationChannelName || '',     // M: Nama Channel
      data.infoSource || '',                  // N: Sumber Info
      data.bloodType || '',                   // O: Golongan Darah
      data.chronicCondition || '',            // P: Penyakit Kronis
      data.underDoctorCare || '',             // Q: Perawatan Dokter
      data.requiresMedication || '',          // R: Minum Obat
      data.experiencedComplications || '',    // S: Komplikasi
      data.experiencedFainting || '',         // T: Pingsan
      data.emergencyContactName || '',        // U: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // V: Kontak Darurat Phone
      data.shirtSize || '',                   // W: Ukuran Jersey
      paymentAmount,                          // X: Payment Amount
      '',                                     // Y: Payment Proof URL
      bibNumberWithPrefix,                    // Z: BIB Number
    ];

    // Append row
    sheet.appendRow(rowData);

    // ✅ FIX: Force BIB column format to Plain Text
    const lastRow = sheet.getLastRow();
    const bibCell = sheet.getRange(lastRow, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@');

    Logger.log('✅ Registration created at row: ' + lastRow);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        bibNumber: bibNumber,
        paymentAmount: paymentAmount
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in createRegistration: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
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
    Logger.log('=== updateRegistration START ===');
    Logger.log('OrderId: ' + orderId);
    Logger.log('Data keys: ' + (data ? Object.keys(data).join(', ') : 'data is null'));
    
    if (!data) {
      throw new Error('Data is undefined or null');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find row by NATIONAL_ID
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

    Logger.log('Found registration at row: ' + rowIndex);

    // Format timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // Get existing BIB and Payment Amount (preserve)
    const existingBibNumber = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
    const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];
    const existingPaymentProofUrl = values[rowIndex - 1][COLUMNS.PAYMENT_PROOF_URL - 1];

    // Update row data
    const updatedRowData = [
      values[rowIndex - 1][COLUMNS.CREATED_AT - 1], // A: Created At (preserve)
      timestamp,                              // B: Updated At (update)
      data.email || '',                       // C: Email
      "'" + (data.phoneNumber || ''),         // D: Phone
      data.registeringFor || '',              // E: Mendaftar Untuk
      data.name || '',                        // F: Nama
      data.birthDate || '',                   // G: Tanggal Lahir
      data.gender || '',                      // H: Jenis Kelamin
      data.address || '',                     // I: Alamat
      "'" + (data.nationalId || ''),          // J: Nomor KTP
      data.bibName || '',                     // K: Nama BIB
      data.registrationChannel || '',         // L: Terdaftar Dari
      data.registrationChannelName || '',     // M: Nama Channel
      data.infoSource || '',                  // N: Sumber Info
      data.bloodType || '',                   // O: Golongan Darah
      data.chronicCondition || '',            // P: Penyakit Kronis
      data.underDoctorCare || '',             // Q: Perawatan Dokter
      data.requiresMedication || '',          // R: Minum Obat
      data.experiencedComplications || '',    // S: Komplikasi
      data.experiencedFainting || '',         // T: Pingsan
      data.emergencyContactName || '',        // U: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // V: Kontak Darurat Phone
      data.shirtSize || '',                   // W: Ukuran Jersey
      existingPaymentAmount,                  // X: Payment Amount (PRESERVE)
      existingPaymentProofUrl || '',          // Y: Payment Proof URL (preserve)
      existingBibNumber,                      // Z: BIB Number (PRESERVE)
    ];

    // Update entire row
    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);

    // ✅ FIX: Force BIB column format to Plain Text
    const bibCell = sheet.getRange(rowIndex, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@');

    Logger.log('✅ Registration updated at row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        message: 'Registration updated successfully',
        rowIndex: rowIndex
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR in updateRegistration: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateBibNumber(registrationNumber) {
  const bibNum = registrationNumber;
  const bibString = String(bibNum).padStart(4, '0');
  return bibString;
}

function generatePaymentAmount(registrationNumber) {
  const baseAmount = 200000;
  const uniqueAmount = baseAmount + registrationNumber;
  return uniqueAmount;
}

function uploadPaymentProof(orderId, fileData, userName, nationalId) {
  try {
    const rootFolderName = 'Payment Proofs - Trail Run';
    let rootFolder;
    
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);
    }

    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.mimeType,
      fileData.name
    );

    const originalName = fileData.name;
    const lastDot = originalName.lastIndexOf('.');
    const extension = lastDot > 0 ? originalName.substring(lastDot) : '.jpg';

    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanNationalId + extension;

    const file = rootFolder.createFile(blob.setName(fileName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getUrl();
    Logger.log('Payment proof uploaded: ' + fileName + ' → ' + fileUrl);

    return fileUrl;

  } catch (error) {
    Logger.log('ERROR uploading to Drive: ' + error.toString());
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}

function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

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

    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(timestamp);

    Logger.log('Payment proof updated for row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, driveLink: driveLink })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERROR updating payment proof: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getBibNumber(orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    for (let i = 1; i < values.length; i++) {
      const storedNationalId = String(values[i][COLUMNS.NATIONAL_ID - 1]).replace(/^'/, '');
      const searchNationalId = String(orderId).replace(/^'/, '');
      
      if (storedNationalId === searchNationalId) {
        const bibNumber = values[i][COLUMNS.BIB_NUMBER - 1];
        
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
    Logger.log('ERROR getting BIB number: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// UTILITY: Fix All BIB Formats
// ========================================

/**
 * Run this ONCE to fix BIB format for all existing rows
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
    
    const bibRange = sheet.getRange(2, COLUMNS.BIB_NUMBER, lastRow - 1, 1);
    bibRange.setNumberFormat('@STRING@');
    
    Logger.log('✅ Fixed BIB format for ' + (lastRow - 1) + ' rows');
    
  } catch (error) {
    Logger.log('ERROR fixing BIB formats: ' + error.toString());
  }
}
```

---

## 📋 CARA DEPLOY

### 1. Copy Kode
- Select ALL kode di atas (dari `//===` sampai bawah)
- Copy (Ctrl+C / Cmd+C)

### 2. Paste ke Apps Script
1. Buka Google Sheets
2. Extensions → Apps Script
3. **DELETE** semua kode yang ada
4. **PASTE** kode baru
5. **IMPORTANT:** Line 6 - ganti `SHEET_NAME = 'Sheet1'` sesuai nama sheet Anda
6. **Save** (Ctrl+S / Cmd+S)

### 3. Deploy
1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (✏️) pada deployment yang aktif
3. Version: **New version**
4. Description: "Fix data structure + BIB format + logging"
5. Click **Deploy**
6. URL tetap sama

### 4. Test
1. Clear localStorage di browser
2. Refresh page
3. Isi form → submit
4. **Check console** browser - should no longer show "undefined" error
5. **Check Apps Script logs**:
   - Go to Apps Script Editor
   - View → Logs (or Executions)
   - Should see detailed logs
6. **Check Google Sheets** - data should be saved

---

## 🔍 DEBUGGING

### Jika masih error, check Apps Script Logs:

1. **Buka Apps Script Editor**
2. Click: **Executions** (icon jam di sidebar)
3. Click execution terbaru (failed)
4. **Read logs:**
   - `=== doPost START ===`
   - `Raw postData: ...` → Check payload structure
   - `Action: create`
   - `Request data keys: ...` → Should show `action, data`
   - `=== createRegistration START ===`
   - `Received data type: object`
   - `Data keys: ...` → Should show all field names
   
### Expected Logs (Success):

```
=== doPost START ===
Raw postData: {"action":"create","data":{...}}
Action: create
Request data keys: action, data
Calling createRegistration with data: {...}
=== createRegistration START ===
Received data type: object
Data keys: email, phoneNumber, registeringFor, name, ...
Generated BIB: 0001, Payment: 200001
✅ Registration created at row: 2
```

### If Error Logs Show:

```
ERROR: data.email is missing!
Full data: {...}
```

→ **Kirim screenshot logs ke saya untuk debug lebih lanjut**

---

## ✅ WHAT'S NEW

1. ✅ **Enhanced Logging** - Detailed logs di setiap step
2. ✅ **Error Handling** - Better error messages
3. ✅ **Data Validation** - Check data exists before accessing
4. ✅ **BIB Format Fix** - `setNumberFormat('@STRING@')`
5. ✅ **Correct Structure** - Match frontend payload

---

**Deploy kode ini sekarang dan test!** 🚀

Jika masih error, check Apps Script Executions logs dan screenshot ke saya.
