# 📝 Google Apps Script Code untuk Google Sheets

## 🎯 Instruksi Setup

### **Langkah 1: Buka Google Sheets Anda**
1. Buka Google Sheet yang sudah Anda buat
2. Pastikan sheet bernama **"Registrations"** (atau sesuaikan nama di script)

### **Langkah 2: Buka Apps Script Editor**
1. Di Google Sheets, klik **Extensions** → **Apps Script**
2. Hapus kode default yang ada
3. Copy-paste kode di bawah ini

### **Langkah 3: Setup Kolom di Sheet**

Pastikan kolom di sheet **"Registrations"** sesuai urutan ini:

```
A: Created At
B: Updated At
C: ID Pendaftaran
D: Email
E: Nomor Telepon
F: Mendaftar Untuk
G: Nama Lengkap
H: Tanggal Lahir
I: Jenis Kelamin
J: Alamat
K: Nomor KTP
L: Nama BIB
M: Terdaftar Dari
N: Nama (Terdaftar Dari)
O: Sumber Info
P: Golongan Darah
Q: Penyakit Kronis
R: Dalam Perawatan Dokter
S: Harus Minum Obat
T: Kejadian Buruk Terkait Penyakit
U: Kontak Darurat Nama
V: Kontak Darurat Telepon
W: Ukuran Jersey
X: Kategori Peserta
Y: Jumlah Payment
Z: Status Pembayaran
AA: Payment Date
AB: Transaction ID
AC: Payment Type
```

**PENTING**: Baris 1 harus berisi header kolom!

---

## 📜 KODE APPS SCRIPT

Copy kode ini ke Apps Script Editor:

```javascript
// ===================================
// FUN RUN REGISTRATION - APPS SCRIPT
// ===================================

// Nama sheet yang digunakan
const SHEET_NAME = 'Registrations';

// Index kolom (0-based)
const COLUMNS = {
  CREATED_AT: 0,              // A
  UPDATED_AT: 1,              // B
  ORDER_ID: 2,                // C
  EMAIL: 3,                   // D
  PHONE_NUMBER: 4,            // E
  REGISTERING_FOR: 5,         // F
  NAME: 6,                    // G
  BIRTH_DATE: 7,              // H
  GENDER: 8,                  // I
  ADDRESS: 9,                 // J
  NATIONAL_ID: 10,            // K
  BIB_NAME: 11,               // L
  REGISTRATION_CHANNEL: 12,   // M
  REGISTRATION_CHANNEL_NAME: 13, // N
  INFO_SOURCE: 14,            // O
  BLOOD_TYPE: 15,             // P
  CHRONIC_CONDITION: 16,      // Q
  UNDER_DOCTOR_CARE: 17,      // R
  REQUIRES_MEDICATION: 18,    // S
  EXPERIENCED_COMPLICATIONS: 19, // T
  EMERGENCY_CONTACT_NAME: 20, // U
  EMERGENCY_CONTACT_PHONE: 21, // V
  SHIRT_SIZE: 22,             // W
  PARTICIPANT_CATEGORY: 23,   // X
  AMOUNT: 24,                 // Y
  STATUS: 25,                 // Z
  PAYMENT_DATE: 26,           // AA
  TRANSACTION_ID: 27,         // AB
  PAYMENT_TYPE: 28            // AC
};

/**
 * Main POST handler
 * Dipanggil saat ada request POST dari Next.js
 */
function doPost(e) {
  try {
    const requestBody = JSON.parse(e.postData.contents);
    const action = requestBody.action;
    
    Logger.log('Received request - Action: ' + action);
    
    let result;
    
    if (action === 'create') {
      // Create new registration (status: PENDING)
      result = createRegistration(requestBody.data);
    } else if (action === 'update') {
      // Update existing registration status
      result = updateRegistrationStatus(requestBody.orderId, requestBody.data);
    } else {
      throw new Error('Invalid action: ' + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test endpoint untuk memastikan script berjalan
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Fun Run Registration Apps Script is active',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CREATE: Insert data registrasi baru dengan status PENDING
 */
function createRegistration(data) {
  const sheet = getSheet();
  
  // Prepare row data sesuai urutan kolom
  const row = [
    data.createdAt || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    data.updatedAt || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    data.orderId,
    data.email,
    data.phoneNumber,
    data.registeringFor,
    data.name,
    data.birthDate,
    data.gender,
    data.address,
    data.nationalId,
    data.bibName,
    data.registrationChannel,
    data.registrationChannelName || '',
    data.infoSource,
    data.bloodType,
    data.chronicCondition,
    data.underDoctorCare,
    data.requiresMedication,
    data.experiencedComplications,
    data.emergencyContactName,
    data.emergencyContactPhone,
    data.shirtSize,
    data.participantCategory,
    data.amount,
    'PENDING', // Status default
    '', // Payment Date (kosong)
    '', // Transaction ID (kosong)
    ''  // Payment Type (kosong)
  ];
  
  // Append row ke sheet
  sheet.appendRow(row);
  
  Logger.log('Registration created: ' + data.orderId);
  
  return {
    success: true,
    message: 'Registration created successfully',
    orderId: data.orderId
  };
}

/**
 * UPDATE: Update status pembayaran berdasarkan Order ID
 */
function updateRegistrationStatus(orderId, data) {
  const sheet = getSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Cari row dengan Order ID yang sesuai (skip header row)
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][COLUMNS.ORDER_ID] === orderId) {
      rowIndex = i + 1; // +1 karena sheet 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Order ID not found: ' + orderId);
  }
  
  // Update kolom yang relevan
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
  
  // Updated At
  sheet.getRange(rowIndex, COLUMNS.UPDATED_AT + 1).setValue(now);
  
  // Status Pembayaran
  if (data.status) {
    sheet.getRange(rowIndex, COLUMNS.STATUS + 1).setValue(data.status);
  }
  
  // Payment Date
  if (data.paymentDate) {
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_DATE + 1).setValue(data.paymentDate);
  }
  
  // Transaction ID
  if (data.transactionId) {
    sheet.getRange(rowIndex, COLUMNS.TRANSACTION_ID + 1).setValue(data.transactionId);
  }
  
  // Payment Type
  if (data.paymentType) {
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_TYPE + 1).setValue(data.paymentType);
  }
  
  Logger.log('Registration updated: ' + orderId + ' - Status: ' + data.status);
  
  return {
    success: true,
    message: 'Registration status updated successfully',
    orderId: orderId,
    status: data.status
  };
}

/**
 * Helper: Get sheet object
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + SHEET_NAME);
  }
  
  return sheet;
}

/**
 * OPTIONAL: Function untuk test manual
 * Bisa dijalankan dari Apps Script Editor
 */
function testCreateRegistration() {
  const testData = {
    orderId: 'TEST-' + Date.now(),
    email: 'test@example.com',
    phoneNumber: '081234567890',
    registeringFor: 'Diri Sendiri',
    name: 'John Doe',
    birthDate: '1990-01-01',
    gender: 'Pria',
    address: 'Jl. Test No. 123',
    nationalId: '1234567890123456',
    bibName: 'JOHN',
    registrationChannel: 'Personal',
    registrationChannelName: '',
    infoSource: 'Sosial Media',
    bloodType: 'O',
    chronicCondition: 'Tidak',
    underDoctorCare: 'Tidak',
    requiresMedication: 'Tidak',
    experiencedComplications: 'Tidak',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '089876543210',
    shirtSize: 'L',
    participantCategory: 'Umum',
    amount: 200000,
    createdAt: new Date().toISOString()
  };
  
  const result = createRegistration(testData);
  Logger.log(result);
}

/**
 * OPTIONAL: Function untuk test update manual
 */
function testUpdateStatus() {
  const orderId = 'TEST-1234567890'; // Ganti dengan Order ID yang valid
  
  const updateData = {
    status: 'SUCCESS',
    paymentDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    transactionId: 'MT-TEST-123456',
    paymentType: 'credit_card'
  };
  
  const result = updateRegistrationStatus(orderId, updateData);
  Logger.log(result);
}
```

---

## 🚀 LANGKAH 4: Deploy Apps Script

1. **Klik Save** (💾 icon)
2. **Klik Deploy** → **New deployment**
3. **Type**: Pilih **Web app**
4. **Configuration**:
   - Description: "Fun Run Registration API"
   - Execute as: **Me** (your email)
   - Who has access: **Anyone** ⚠️ (penting!)
5. **Klik Deploy**
6. **Authorize access**: Klik "Authorize access" dan login dengan Google account Anda
7. **Copy Web App URL** yang muncul (format: `https://script.google.com/macros/s/.../exec`)

---

## 🔑 LANGKAH 5: Update .env.local

Paste URL Apps Script ke `.env.local`:

```env
APPS_SCRIPT_ENTRYPOINT=https://script.google.com/macros/s/AKfycby.../exec
```

⚠️ **PENTING**: URL harus diakhiri dengan `/exec`

---

## ✅ LANGKAH 6: Test Apps Script

### Test via Browser:
Buka URL Apps Script di browser. Harus muncul:
```json
{
  "success": true,
  "message": "Fun Run Registration Apps Script is active",
  "timestamp": "2025-10-01T14:30:00.000Z"
}
```

### Test Create Registration:
Di Apps Script Editor:
1. Pilih function **testCreateRegistration** dari dropdown
2. Klik **Run** (▶️)
3. Cek Google Sheet, harus ada data baru muncul

### Test Update Status:
Di Apps Script Editor:
1. Edit function **testUpdateStatus**, ganti `orderId` dengan ID yang valid
2. Pilih function **testUpdateStatus** dari dropdown
3. Klik **Run** (▶️)
4. Cek Google Sheet, status harus berubah

---

## 🐛 TROUBLESHOOTING

### Error: "Sheet not found: Registrations"
→ Pastikan sheet bernama **"Registrations"** (huruf besar semua)

### Error: "Authorization required"
→ Jalankan test function sekali untuk authorize access

### Data tidak muncul di sheet
→ Cek Execution log di Apps Script Editor (View → Logs)

### URL Apps Script tidak work
→ Pastikan:
- Deploy ulang jika ada perubahan kode
- URL diakhiri dengan `/exec`
- Setting "Who has access" = **Anyone**

---

## 📌 CATATAN PENTING

1. **Setiap kali edit kode Apps Script**, Anda harus **Deploy ulang** (Deploy → Manage deployments → Edit version → Deploy)
2. **URL Apps Script tetap sama** setelah update (tidak perlu ganti di .env.local)
3. **Baris 1 di sheet** harus berisi header kolom
4. **Nama kolom di sheet boleh berbeda**, yang penting urutan kolom sesuai

---

Setelah Apps Script setup, lanjut ke implementasi Next.js! 🚀
