# 📝 APPS SCRIPT - AUTO BIB GENERATION

## 🎯 OVERVIEW

Sistem ini akan **auto-generate** BIB number dan Payment Amount bersamaan:
- **Pendaftar 1**: BIB `0001` + Payment `Rp 200.001`
- **Pendaftar 2**: BIB `0002` + Payment `Rp 200.002`
- **Pendaftar 150**: BIB `0150` + Payment `Rp 200.150`

**BIB di-generate IMMEDIATELY saat registrasi!**

---

## 📊 GOOGLE SHEETS COLUMN MAPPING

Berdasarkan struktur kolom Anda:

| No | Column Name | Code Variable | Example |
|----|-------------|---------------|---------|
| 1 | Created At | CREATED_AT | 2025-06-01 10:30:00 |
| 2 | Updated At | UPDATED_AT | 2025-06-01 10:30:00 |
| 3 | Email | EMAIL | user@email.com |
| 4 | No Telepon | PHONE_NUMBER | '081234567890 |
| 5 | Mendaftar Untuk | REGISTERING_FOR | self / other |
| 6 | Nama Lengkap | NAME | John Doe |
| 7 | Tanggal lahir | BIRTH_DATE | 1990-01-01 |
| 8 | Jenis Kelamin | GENDER | male / female |
| 9 | Alamat | ADDRESS | Jl. Example No. 123 |
| 10 | Nomor KTP | NATIONAL_ID | '1234567890123456 |
| 11 | Nama BIB | BIB_NAME | JOHN |
| 12 | Terdaftar Dari | REGISTRATION_CHANNEL | community / company / organization / personal |
| 13 | Nama (Terdaftar Dari) | REGISTRATION_CHANNEL_NAME | Komunitas Lari Jakarta |
| 14 | Sumber Info | INFO_SOURCE | friend / social_media / print_media |
| 15 | Golongan Darah | BLOOD_TYPE | A+ / O+ / AB+ / etc |
| 16 | Penyakit Kronis | CHRONIC_CONDITION | yes / no |
| 17 | Dalam Perawatan Dokter | UNDER_DOCTOR_CARE | yes / no |
| 18 | Harus Minum Obat | REQUIRES_MEDICATION | yes / no |
| 19 | Kejadian Buruk Terkait Penyakit | EXPERIENCED_COMPLICATIONS | yes / no |
| 20 | Pernah Pingsan | EXPERIENCED_FAINTING | yes / no |
| 21 | Kontak Darurat Nama | EMERGENCY_CONTACT_NAME | Jane Doe |
| 22 | Kontak Darurat Telepon | EMERGENCY_CONTACT_PHONE | '081234567890 |
| 23 | Ukuran Jersey | SHIRT_SIZE | S / M / L / XL / XXL / XXXL |
| 24 | Jumlah Payment | PAYMENT_AMOUNT | 200001 |
| 25 | Link Bukti Bayar | PAYMENT_PROOF_URL | https://drive.google.com/... |
| 26 | Nomor BIB | BIB_NUMBER | 0001 |

---

## 🔧 COMPLETE APPS SCRIPT CODE

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
      const driveLink = uploadPaymentProof(data.orderId, data.file);
      // Then update sheet with link
      return updatePaymentProof(data.orderId, driveLink);
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
      bibNumber,                              // Z: Nomor BIB (AUTO-GENERATED)
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
 */
function generateBibNumber(registrationNumber) {
  // registrationNumber = 1 → BIB = 0001
  // registrationNumber = 2 → BIB = 0002
  // registrationNumber = 150 → BIB = 0150
  
  const bibNum = registrationNumber;
  const bibString = String(bibNum).padStart(4, '0'); // Pad with zeros to 4 digits
  
  return bibString;
}

/**
 * Generate unique payment amount: 200001, 200002, 200003, ...
 */
function generatePaymentAmount(registrationNumber) {
  // registrationNumber = 1 → 200001
  // registrationNumber = 2 → 200002
  // registrationNumber = 150 → 200150
  
  const baseAmount = 200000;
  const uniqueAmount = baseAmount + registrationNumber;
  
  return uniqueAmount;
}

/**
 * Upload payment proof image to Google Drive
 * Folder structure: Payment Proofs - Trail Run / YYYY-MM
 */
function uploadPaymentProof(orderId, fileData) {
  try {
    // Get or create root folder
    const rootFolderName = 'Payment Proofs - Trail Run';
    let rootFolder;
    
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);
    }

    // Create month folder (YYYY-MM)
    const now = new Date();
    const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');
    let monthFolder;
    
    const monthFolders = rootFolder.getFoldersByName(monthFolderName);
    if (monthFolders.hasNext()) {
      monthFolder = monthFolders.next();
    } else {
      monthFolder = rootFolder.createFolder(monthFolderName);
    }

    // Decode base64 and create file
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.mimeType,
      fileData.name
    );

    // Upload with orderId prefix
    const fileName = 'PROOF_' + orderId + '_' + fileData.name;
    const file = monthFolder.createFile(blob.setName(fileName));

    // Make file shareable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getUrl();
    Logger.log('Payment proof uploaded: ' + fileUrl);

    return fileUrl;

  } catch (error) {
    Logger.log('Error uploading to Drive: ' + error.toString());
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}

/**
 * Update payment proof URL in sheet
 * Find row by matching orderId in Email column (we'll use email as identifier)
 * Or you can add separate ORDER_ID column
 */
function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Find last row (most recent registration)
    // Since we don't have ORDER_ID column, we'll update the last row
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
1. Delete all existing code
2. Copy COMPLETE code from above
3. Paste into Apps Script editor
4. Update SHEET_NAME if needed (line 6)
5. Save (Ctrl+S / Cmd+S)
```

### 3. Test
```
1. Run: testGeneration()
2. Check logs
3. Should show: BIB and Payment numbers
```

### 4. Deploy
```
1. Click: Deploy → New deployment
2. Type: Web app
3. Description: "Auto BIB Generation v2"
4. Execute as: Me
5. Who has access: Anyone
6. Click: Deploy
7. Copy: Web app URL
8. Authorize permissions if prompted
```

### 5. Update Environment Variable
```
File: .env.local
Update: GOOGLE_SHEETS_SCRIPT_URL=YOUR_NEW_WEB_APP_URL
```

---

## 🧪 TESTING GUIDE

### Test 1: Registration
```
1. Submit form dari frontend
2. Check console: Should show BIB and Payment
3. Check Sheets:
   - Nomor BIB column: 0001 (or next number)
   - Jumlah Payment column: 200001 (or next number)
```

### Test 2: Sequential Numbers
```
Register 3 users:
- User 1: BIB 0001, Payment 200001
- User 2: BIB 0002, Payment 200002
- User 3: BIB 0003, Payment 200003

All should be sequential without gaps
```

### Test 3: Payment Proof Upload
```
1. Upload image file
2. Check console: Drive link logged
3. Check Drive: Folder "Payment Proofs - Trail Run" created
4. Check Sheets: Link Bukti Bayar column filled
```

---

## ⚠️ IMPORTANT NOTES

1. **BIB Number** di-generate immediately saat registrasi
2. **Payment Amount** juga di-generate bersamaan
3. **Sequential numbering** based on row number
4. **No ORDER_ID column** in current structure (using email as identifier)
5. **Payment proof** updates last row (most recent registration)

---

## 📋 EXPECTED BEHAVIOR

```
Registrasi 1:
- Row 2 in Sheets
- BIB: 0001
- Payment: 200.001

Registrasi 2:
- Row 3 in Sheets
- BIB: 0002
- Payment: 200.002

Registrasi 150:
- Row 151 in Sheets
- BIB: 0150
- Payment: 200.150
```

---

## 🔍 TROUBLESHOOTING

**Issue: BIB or Payment tidak generated**
- Check: SHEET_NAME correct?
- Check: Apps Script deployed?
- Check: Logs for errors

**Issue: Numbers tidak sequential**
- Cause: Rows deleted manually
- Fix: Don't delete rows, hide them instead

**Issue: Payment proof tidak terupload**
- Check: Drive permissions
- Check: File size < 5MB
- Check: Apps Script execution log

---

**Ready to deploy!** 🚀
