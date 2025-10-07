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
  PROFESSION: 12,                   // L
  REGISTRATION_CHANNEL: 13,         // M
  REGISTRATION_CHANNEL_NAME: 14,    // N
  INFO_SOURCE: 15,                  // O
  BLOOD_TYPE: 16,                   // P
  CHRONIC_CONDITION: 17,            // Q
  UNDER_DOCTOR_CARE: 18,            // R
  REQUIRES_MEDICATION: 19,          // S
  EXPERIENCED_COMPLICATIONS: 20,    // T
  EXPERIENCED_FAINTING: 21,         // U
  EMERGENCY_CONTACT_NAME: 22,       // V
  EMERGENCY_CONTACT_PHONE: 23,      // W
  SHIRT_SIZE: 24,                   // X
  PAYMENT_AMOUNT: 25,               // Y
  PAYMENT_PROOF_URL: 26,            // Z
  BIB_NUMBER: 27,                   // AA
};

// Transform data to Indonesian/readable format
function transformToIndonesian(data) {
  const transformed = Object.assign({}, data);
  
  // Transform Gender
  const genderMap = {
    'male': 'Pria',
    'female': 'Wanita'
  };
  if (transformed.gender && genderMap[transformed.gender]) {
    transformed.gender = genderMap[transformed.gender];
  }
  
  // Transform Profession
  const professionMap = {
    'student_smp_sma': 'Pelajar SMP/SMA',
    'student_university': 'Mahasiswa',
    'employee': 'Karyawan',
    'entrepreneur': 'Wiraswasta',
    'civil_servant': 'Pegawai Negeri',
    'other': 'Lain Lain'
  };
  if (transformed.profession && professionMap[transformed.profession]) {
    transformed.profession = professionMap[transformed.profession];
  }
  
  // Transform Registration Channel
  const channelMap = {
    'community': 'Komunitas',
    'company': 'Perusahaan',
    'organization': 'Organisasi',
    'personal': 'Personal'
  };
  if (transformed.registrationChannel && channelMap[transformed.registrationChannel]) {
    transformed.registrationChannel = channelMap[transformed.registrationChannel];
  }
  
  // Transform Info Source
  const infoSourceMap = {
    'friend': 'Teman',
    'social_media': 'Media Sosial',
    'billboard': 'Baliho'
  };
  if (transformed.infoSource && infoSourceMap[transformed.infoSource]) {
    transformed.infoSource = infoSourceMap[transformed.infoSource];
  }
  
  // Transform Registering For
  const registeringForMap = {
    'self': 'Diri Sendiri',
    'other': 'Orang Lain'
  };
  if (transformed.registeringFor && registeringForMap[transformed.registeringFor]) {
    transformed.registeringFor = registeringForMap[transformed.registeringFor];
  }
  
  // Transform Yes/No values
  const yesNoMap = {
    'yes': 'Ya',
    'no': 'Tidak'
  };
  
  if (transformed.chronicCondition && yesNoMap[transformed.chronicCondition]) {
    transformed.chronicCondition = yesNoMap[transformed.chronicCondition];
  }
  if (transformed.underDoctorCare && yesNoMap[transformed.underDoctorCare]) {
    transformed.underDoctorCare = yesNoMap[transformed.underDoctorCare];
  }
  if (transformed.requiresMedication && yesNoMap[transformed.requiresMedication]) {
    transformed.requiresMedication = yesNoMap[transformed.requiresMedication];
  }
  if (transformed.experiencedComplications && yesNoMap[transformed.experiencedComplications]) {
    transformed.experiencedComplications = yesNoMap[transformed.experiencedComplications];
  }
  if (transformed.experiencedFainting && yesNoMap[transformed.experiencedFainting]) {
    transformed.experiencedFainting = yesNoMap[transformed.experiencedFainting];
  }
  
  return transformed;
}

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

    // Transform data to Indonesian
    const transformedData = transformToIndonesian(data);

    const registrationNumber = sheet.getLastRow();
    const bibNumber = generateBibNumber(registrationNumber);
    const paymentAmount = generatePaymentAmount(registrationNumber);

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    const bibNumberWithPrefix = "'" + bibNumber;

    const rowData = [
      timestamp,                                      // A: Created At
      timestamp,                                      // B: Updated At
      transformedData.email || '',                    // C: Email
      "'" + (transformedData.phoneNumber || ''),      // D: Phone
      transformedData.registeringFor || '',           // E: Mendaftar Untuk
      transformedData.name || '',                     // F: Nama
      transformedData.birthDate || '',                // G: Tanggal Lahir
      transformedData.gender || '',                   // H: Jenis Kelamin
      transformedData.address || '',                  // I: Alamat
      "'" + (transformedData.nationalId || ''),       // J: Nomor KTP
      transformedData.bibName || '',                  // K: Nama BIB
      transformedData.profession || '',               // L: Profesi
      transformedData.registrationChannel || '',      // M: Terdaftar Dari
      transformedData.registrationChannelName || '',  // N: Nama Channel
      transformedData.infoSource || '',               // O: Sumber Info
      transformedData.bloodType || '',                // P: Golongan Darah
      transformedData.chronicCondition || '',         // Q: Penyakit Kronis
      transformedData.underDoctorCare || '',          // R: Perawatan Dokter
      transformedData.requiresMedication || '',       // S: Minum Obat
      transformedData.experiencedComplications || '', // T: Komplikasi
      transformedData.experiencedFainting || '',      // U: Pingsan
      transformedData.emergencyContactName || '',     // V: Kontak Darurat Nama
      "'" + (transformedData.emergencyContactPhone || ''), // W: Kontak Darurat Phone
      transformedData.shirtSize || '',                // X: Ukuran Jersey
      paymentAmount,                                  // Y: Payment Amount
      '',                                             // Z: Payment Proof URL
      bibNumberWithPrefix,                            // AA: BIB Number
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

    // Transform data to Indonesian
    const transformedData = transformToIndonesian(data);

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    const existingBibNumber = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
    const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];
    const existingPaymentProofUrl = values[rowIndex - 1][COLUMNS.PAYMENT_PROOF_URL - 1];

    const updatedRowData = [
      values[rowIndex - 1][COLUMNS.CREATED_AT - 1],      // A: Created At (preserve)
      timestamp,                                          // B: Updated At (update)
      transformedData.email || '',                        // C: Email
      "'" + (transformedData.phoneNumber || ''),          // D: Phone
      transformedData.registeringFor || '',               // E: Mendaftar Untuk
      transformedData.name || '',                         // F: Nama
      transformedData.birthDate || '',                    // G: Tanggal Lahir
      transformedData.gender || '',                       // H: Jenis Kelamin
      transformedData.address || '',                      // I: Alamat
      "'" + (transformedData.nationalId || ''),           // J: Nomor KTP
      transformedData.bibName || '',                      // K: Nama BIB
      transformedData.profession || '',                   // L: Profesi
      transformedData.registrationChannel || '',          // M: Terdaftar Dari
      transformedData.registrationChannelName || '',      // N: Nama Channel
      transformedData.infoSource || '',                   // O: Sumber Info
      transformedData.bloodType || '',                    // P: Golongan Darah
      transformedData.chronicCondition || '',             // Q: Penyakit Kronis
      transformedData.underDoctorCare || '',              // R: Perawatan Dokter
      transformedData.requiresMedication || '',           // S: Minum Obat
      transformedData.experiencedComplications || '',     // T: Komplikasi
      transformedData.experiencedFainting || '',          // U: Pingsan
      transformedData.emergencyContactName || '',         // V: Kontak Darurat Nama
      "'" + (transformedData.emergencyContactPhone || ''), // W: Kontak Darurat Phone
      transformedData.shirtSize || '',                    // X: Ukuran Jersey
      existingPaymentAmount,                              // Y: Payment Amount (PRESERVE)
      existingPaymentProofUrl || '',                      // Z: Payment Proof URL (preserve)
      existingBibNumber,                                  // AA: BIB Number (PRESERVE)
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

    const fileUrl = file.getUrl();
    
    return fileUrl;

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
      throw new Error('Registration not found for orderId: ' + orderId);
    }

    // Update Payment Proof URL
    sheet.getRange(rowIndex, COLUMNS.PAYMENT_PROOF_URL).setValue(driveLink);

    // Update timestamp
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(rowIndex, COLUMNS.UPDATED_AT).setValue(timestamp);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        driveLink: driveLink,
        message: 'Payment proof uploaded successfully'
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        error: error.toString() 
      })
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
