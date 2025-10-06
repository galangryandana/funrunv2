# 📝 APPS SCRIPT UPDATE - MANUAL PAYMENT VERIFICATION

## 🎯 OVERVIEW

Dokumen ini berisi update Apps Script untuk sistem pembayaran manual dengan:
1. **Unique payment amount** (200.001, 200.002, 200.003...)
2. **Google Drive integration** untuk upload bukti pembayaran
3. **Remove** kategori pelajar/umum
4. **Auto-increment** payment number

---

## 📊 GOOGLE SHEETS STRUCTURE UPDATE

### Kolom yang Diubah/Ditambah:

| Column | Name | Description | Example |
|--------|------|-------------|---------|
| AA (27) | PAYMENT_AMOUNT | Nominal unik | 200001, 200002, 200003 |
| AB (28) | STATUS | PENDING / SUCCESS / FAILED | PENDING |
| AC (29) | PAYMENT_PROOF_URL | Link Google Drive bukti transfer | https://drive.google.com/... |
| AD (30) | VERIFIED_AT | Tanggal verifikasi admin | 2025-06-01 10:30:00 |
| AE (31) | VERIFIED_BY | Admin yang verifikasi | admin@email.com |

### Kolom yang Dihapus:
- **Kategori Pendaftar** (student/general) → Dihapus karena semua sama Rp 200.000

---

## 🔧 APPS SCRIPT CODE

### 1. UPDATE COLUMN CONSTANTS

```javascript
const COLUMNS = {
  CREATED_AT: 1,          // A
  UPDATED_AT: 2,          // B
  ORDER_ID: 3,            // C
  EMAIL: 4,               // D
  PHONE_NUMBER: 5,        // E
  REGISTERING_FOR: 6,     // F
  BIB_NUMBER: 7,          // G - Will be assigned after payment verified
  NAME: 8,                // H
  BIRTH_DATE: 9,          // I
  GENDER: 10,             // J
  ADDRESS: 11,            // K
  NATIONAL_ID: 12,        // L
  BIB_NAME: 13,           // M
  REGISTRATION_CHANNEL: 14, // N
  REGISTRATION_CHANNEL_NAME: 15, // O
  INFO_SOURCE: 16,        // P
  BLOOD_TYPE: 17,         // Q
  CHRONIC_CONDITION: 18,  // R
  UNDER_DOCTOR_CARE: 19,  // S
  REQUIRES_MEDICATION: 20, // T
  EXPERIENCED_COMPLICATIONS: 21, // U
  EXPERIENCED_FAINTING: 22, // V
  EMERGENCY_CONTACT_NAME: 23, // W
  EMERGENCY_CONTACT_PHONE: 24, // X
  SHIRT_SIZE: 25,         // Y
  REGISTRANT_TYPE: 26,    // Z (Diri sendiri / Orang lain)
  PAYMENT_AMOUNT: 27,     // AA - UNIQUE amount
  STATUS: 28,             // AB - PENDING / SUCCESS / FAILED
  PAYMENT_PROOF_URL: 29,  // AC - Google Drive link
  VERIFIED_AT: 30,        // AD - Timestamp verification
  VERIFIED_BY: 31,        // AE - Admin email
};
```

---

### 2. UPDATE CREATE REGISTRATION FUNCTION

```javascript
/**
 * Create new registration with unique payment amount
 * Auto-increment: 200.001, 200.002, 200.003, ...
 */
function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
    }

    // Generate unique payment amount
    const paymentAmount = generateNextPaymentAmount(sheet);

    // Prepare row data (31 kolom total)
    const rowData = [
      data.createdAt || '',                    // A: Created At
      data.updatedAt || '',                    // B: Updated At
      data.orderId || '',                      // C: Order ID
      data.email || '',                        // D: Email
      data.phoneNumber || '',                  // E: Nomor Telepon
      data.registeringFor || '',               // F: Mendaftar Untuk
      '',                                      // G: Nomor BIB (akan diisi setelah verifikasi)
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
      data.registeringFor || '',               // Z: Tipe Pendaftar (self/other)
      paymentAmount,                           // AA: Nominal Pembayaran UNIK
      'PENDING',                               // AB: Status (default PENDING)
      '',                                      // AC: Payment Proof URL (kosong)
      '',                                      // AD: Verified At (kosong)
      ''                                       // AE: Verified By (kosong)
    ];

    // Append row
    sheet.appendRow(rowData);

    Logger.log('Registration created: ' + data.orderId + ' - Amount: ' + paymentAmount);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        paymentAmount: paymentAmount  // Return payment amount ke frontend
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error creating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### 3. NEW FUNCTION: Generate Unique Payment Amount

```javascript
/**
 * Generate unique payment amount
 * Format: 200.001, 200.002, 200.003, ..., 200.999, 201.000, dst
 * Based on total registration count
 */
function generateNextPaymentAmount(sheet) {
  try {
    // Get last row number (excluding header)
    const lastRow = sheet.getLastRow();
    const registrationNumber = lastRow; // Row 2 = 1st registration, Row 3 = 2nd, dst

    // Base amount: 200.000
    const baseAmount = 200000;
    
    // Unique amount: baseAmount + registrationNumber
    const uniqueAmount = baseAmount + registrationNumber;

    Logger.log('Generated payment amount: ' + uniqueAmount + ' for registration #' + registrationNumber);

    return uniqueAmount;

  } catch (error) {
    Logger.log('Error generating payment amount: ' + error.toString());
    return 200001; // Default to first amount if error
  }
}
```

---

### 4. NEW FUNCTION: Upload Payment Proof to Google Drive

```javascript
/**
 * Upload payment proof image to Google Drive
 * Create folder structure: PaymentProofs / YYYY-MM / OrderID
 */
function uploadPaymentProof(orderId, fileData) {
  try {
    // Get or create root folder for payment proofs
    const rootFolderName = 'Payment Proofs - Trail Run';
    let rootFolder;
    
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);
    }

    // Create month folder (YYYY-MM format)
    const now = new Date();
    const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');
    let monthFolder;
    
    const monthFolders = rootFolder.getFoldersByName(monthFolderName);
    if (monthFolders.hasNext()) {
      monthFolder = monthFolders.next();
    } else {
      monthFolder = rootFolder.createFolder(monthFolderName);
    }

    // Decode base64 file data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.mimeType,
      fileData.name
    );

    // Upload file with orderId in name
    const fileName = orderId + '_' + fileData.name;
    const file = monthFolder.createFile(blob.setName(fileName));

    // Make file accessible with link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Get shareable link
    const fileUrl = file.getUrl();

    Logger.log('Payment proof uploaded: ' + fileUrl);

    return fileUrl;

  } catch (error) {
    Logger.log('Error uploading to Drive: ' + error.toString());
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}
```

---

### 5. NEW FUNCTION: Update Payment Proof

```javascript
/**
 * Update registration with payment proof URL
 * Called after file uploaded to Drive
 */
function updatePaymentProof(orderId, driveLink) {
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
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Order ID not found: ' + orderId);
    }

    // Update payment proof URL
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    // Update timestamp
    const updatedAt = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(updatedAt);

    Logger.log('Payment proof updated for: ' + orderId);

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
```

---

### 6. UPDATE doPost FUNCTION

```javascript
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
```

---

## 🧪 TESTING

### Test Function 1: Generate Payment Amount

```javascript
function testGeneratePaymentAmount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  const amount = generateNextPaymentAmount(sheet);
  Logger.log('Generated amount: ' + amount);
  
  // Expected: 200.001 (if 1st registration)
  // Expected: 200.002 (if 2nd registration)
  // dst...
}
```

### Test Function 2: Upload to Drive

```javascript
function testUploadToDrive() {
  // Create test file
  const testData = {
    name: 'test-bukti.jpg',
    mimeType: 'image/jpeg',
    data: Utilities.base64Encode('test content') // Simplified for testing
  };
  
  try {
    const url = uploadPaymentProof('TEST-ORDER-123', testData);
    Logger.log('Upload success: ' + url);
  } catch (error) {
    Logger.log('Upload failed: ' + error.toString());
  }
}
```

---

## 📋 DEPLOYMENT STEPS

### Step 1: Backup Current Apps Script
1. Copy semua code Apps Script yang ada
2. Simpan di file text sebagai backup

### Step 2: Update Constants
1. Update `COLUMNS` constant sesuai struktur baru
2. Hapus reference ke `participantCategory`

### Step 3: Update Functions
1. Update `createRegistration()` function
2. Tambah `generateNextPaymentAmount()` function
3. Tambah `uploadPaymentProof()` function
4. Tambah `updatePaymentProof()` function
5. Update `doPost()` function

### Step 4: Test
1. Run `testGeneratePaymentAmount()`
2. Run `testUploadToDrive()`
3. Test dari frontend (submit form)

### Step 5: Deploy
1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**
6. Copy **Web app URL**
7. Update `.env.local` dengan URL baru

---

## ⚙️ ENVIRONMENT VARIABLES

Update `.env.local`:

```bash
# Google Sheets Apps Script URL
GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## 🎯 EXPECTED BEHAVIOR

### Registration Flow:

```
1. User fill form → Submit
   ↓
2. API: /api/registration/create
   - Save to Sheets with STATUS: PENDING
   - Generate unique amount: 200.001, 200.002, dst
   - Return orderId + paymentAmount
   ↓
3. Show payment instruction page
   - Display nominal: Rp 200.001
   - Display bank account
   - Upload bukti transfer
   ↓
4. API: /api/upload/payment-proof
   - Convert image to base64
   - Send to Apps Script
   - Apps Script upload to Drive
   - Apps Script update Sheet with Drive link
   ↓
5. Show success page
   - "Pendaftaran berhasil!"
   - "Bukti pembayaran sedang diverifikasi"
   ↓
6. Admin verify manually (future feature)
   - Check Drive link
   - Check transfer amount
   - Update STATUS: SUCCESS
   - Generate BIB number
```

---

## 🔐 SECURITY NOTES

1. **Google Drive folder** harus di-set dengan proper permissions
2. **Apps Script** harus deployed dengan "Execute as: Me" untuk akses Drive
3. **Payment proof files** di-set ke "Anyone with link can view"
4. **Admin email** untuk verifikasi harus di-set di Apps Script properties

---

## 📞 SUPPORT

Jika ada masalah:
1. Check Apps Script **Executions** logs
2. Check Frontend Console logs
3. Check Google Sheets data
4. Verify Drive folder structure

---

**Happy Coding!** 🚀
