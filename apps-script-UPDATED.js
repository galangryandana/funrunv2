const SHEET_NAME = 'Registrations';

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
  PROFESSION: 12,                   // L - NEW COLUMN!
  REGISTRATION_CHANNEL: 13,         // M - Was 12
  REGISTRATION_CHANNEL_NAME: 14,    // N - Was 13
  INFO_SOURCE: 15,                  // O - Was 14
  BLOOD_TYPE: 16,                   // P - Was 15
  CHRONIC_CONDITION: 17,            // Q - Was 16
  UNDER_DOCTOR_CARE: 18,            // R - Was 17
  REQUIRES_MEDICATION: 19,          // S - Was 18
  EXPERIENCED_COMPLICATIONS: 20,    // T - Was 19
  EXPERIENCED_FAINTING: 21,         // U - Was 20
  EMERGENCY_CONTACT_NAME: 22,       // V - Was 21
  EMERGENCY_CONTACT_PHONE: 23,      // W - Was 22
  SHIRT_SIZE: 24,                   // X - Was 23
  PAYMENT_AMOUNT: 25,               // Y - Was 24
  PAYMENT_PROOF_URL: 26,            // Z - Was 25
  BIB_NUMBER: 27,                   // AA - Was 26
};

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    if (action === 'create') {
      return createRegistration(requestData.data);
    } else if (action === 'update') {
      return updateRegistration(requestData.orderId, requestData.data);
    } else if (action === 'uploadPaymentProof') {
      const driveLink = uploadPaymentProof(
        requestData.orderId, 
        requestData.file,
        requestData.userName,
        requestData.bibNumber
      );
      return updatePaymentProof(requestData.orderId, driveLink);
    } else if (action === 'getBib') {
      return getBibNumber(requestData.orderId);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Unknown action' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function createRegistration(data) {
  try {
    if (!data || !data.email) {
      throw new Error('Email is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    const registrationNumber = sheet.getLastRow();
    const bibNumber = generateBibNumber(registrationNumber);
    const paymentAmount = generatePaymentAmount(registrationNumber);

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    const bibNumberWithPrefix = "'" + bibNumber;

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
      data.profession || '',                  // L: Profesi - NEW!
      data.registrationChannel || '',         // M: Terdaftar Dari
      data.registrationChannelName || '',     // N: Nama Channel
      data.infoSource || '',                  // O: Sumber Info
      data.bloodType || '',                   // P: Golongan Darah
      data.chronicCondition || '',            // Q: Penyakit Kronis
      data.underDoctorCare || '',             // R: Perawatan Dokter
      data.requiresMedication || '',          // S: Minum Obat
      data.experiencedComplications || '',    // T: Komplikasi
      data.experiencedFainting || '',         // U: Pingsan
      data.emergencyContactName || '',        // V: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // W: Kontak Darurat Phone
      data.shirtSize || '',                   // X: Ukuran Jersey
      paymentAmount,                          // Y: Payment Amount
      '',                                     // Z: Payment Proof URL
      bibNumberWithPrefix,                    // AA: BIB Number
    ];

    sheet.appendRow(rowData);

    const lastRow = sheet.getLastRow();
    const bibCell = sheet.getRange(lastRow, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@');

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        bibNumber: bibNumber,
        paymentAmount: paymentAmount
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateRegistration(orderId, data) {
  try {
    if (!data) {
      throw new Error('Data is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet not found');
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
      throw new Error('Registration not found');
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    const existingBibNumber = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
    const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];
    const existingPaymentProofUrl = values[rowIndex - 1][COLUMNS.PAYMENT_PROOF_URL - 1];

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
      data.profession || '',                  // L: Profesi - NEW!
      data.registrationChannel || '',         // M: Terdaftar Dari
      data.registrationChannelName || '',     // N: Nama Channel
      data.infoSource || '',                  // O: Sumber Info
      data.bloodType || '',                   // P: Golongan Darah
      data.chronicCondition || '',            // Q: Penyakit Kronis
      data.underDoctorCare || '',             // R: Perawatan Dokter
      data.requiresMedication || '',          // S: Minum Obat
      data.experiencedComplications || '',    // T: Komplikasi
      data.experiencedFainting || '',         // U: Pingsan
      data.emergencyContactName || '',        // V: Kontak Darurat Nama
      "'" + (data.emergencyContactPhone || ''), // W: Kontak Darurat Phone
      data.shirtSize || '',                   // X: Ukuran Jersey
      existingPaymentAmount,                  // Y: Payment Amount (PRESERVE)
      existingPaymentProofUrl || '',          // Z: Payment Proof URL (preserve)
      existingBibNumber,                      // AA: BIB Number (PRESERVE)
    ];

    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);

    const bibCell = sheet.getRange(rowIndex, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@');

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        message: 'Registration updated successfully'
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateBibNumber(registrationNumber) {
  return String(registrationNumber).padStart(4, '0');
}

function generatePaymentAmount(registrationNumber) {
  return 200000 + registrationNumber;
}

function uploadPaymentProof(orderId, fileData, userName, bibNumber) {
  try {
    const rootFolderName = 'Bukti Pembayaran - Trail Run';
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
    const cleanBibNumber = (bibNumber || '0000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanBibNumber + extension;

    const file = rootFolder.createFile(blob.setName(fileName));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();

  } catch (error) {
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}

function updatePaymentProof(orderId, driveLink) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet not found');
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
      throw new Error('Registration not found');
    }

    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(timestamp);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, driveLink: driveLink })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
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
      throw new Error('Sheet not found');
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
        error: 'Registration not found'
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
