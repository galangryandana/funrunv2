const SHEET_NAME = 'Registrations';

const COLUMNS = {
  CREATED_AT: 1,
  UPDATED_AT: 2,
  EMAIL: 3,
  PHONE_NUMBER: 4,
  REGISTERING_FOR: 5,
  NAME: 6,
  BIRTH_DATE: 7,
  GENDER: 8,
  ADDRESS: 9,
  NATIONAL_ID: 10,
  BIB_NAME: 11,
  REGISTRATION_CHANNEL: 12,
  REGISTRATION_CHANNEL_NAME: 13,
  INFO_SOURCE: 14,
  BLOOD_TYPE: 15,
  CHRONIC_CONDITION: 16,
  UNDER_DOCTOR_CARE: 17,
  REQUIRES_MEDICATION: 18,
  EXPERIENCED_COMPLICATIONS: 19,
  EXPERIENCED_FAINTING: 20,
  EMERGENCY_CONTACT_NAME: 21,
  EMERGENCY_CONTACT_PHONE: 22,
  SHIRT_SIZE: 23,
  PAYMENT_AMOUNT: 24,
  PAYMENT_PROOF_URL: 25,
  BIB_NUMBER: 26,
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
        requestData.nationalId
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
      timestamp,
      timestamp,
      data.email || '',
      "'" + (data.phoneNumber || ''),
      data.registeringFor || '',
      data.name || '',
      data.birthDate || '',
      data.gender || '',
      data.address || '',
      "'" + (data.nationalId || ''),
      data.bibName || '',
      data.registrationChannel || '',
      data.registrationChannelName || '',
      data.infoSource || '',
      data.bloodType || '',
      data.chronicCondition || '',
      data.underDoctorCare || '',
      data.requiresMedication || '',
      data.experiencedComplications || '',
      data.experiencedFainting || '',
      data.emergencyContactName || '',
      "'" + (data.emergencyContactPhone || ''),
      data.shirtSize || '',
      paymentAmount,
      '',
      bibNumberWithPrefix,
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
      values[rowIndex - 1][COLUMNS.CREATED_AT - 1],
      timestamp,
      data.email || '',
      "'" + (data.phoneNumber || ''),
      data.registeringFor || '',
      data.name || '',
      data.birthDate || '',
      data.gender || '',
      data.address || '',
      "'" + (data.nationalId || ''),
      data.bibName || '',
      data.registrationChannel || '',
      data.registrationChannelName || '',
      data.infoSource || '',
      data.bloodType || '',
      data.chronicCondition || '',
      data.underDoctorCare || '',
      data.requiresMedication || '',
      data.experiencedComplications || '',
      data.experiencedFainting || '',
      data.emergencyContactName || '',
      "'" + (data.emergencyContactPhone || ''),
      data.shirtSize || '',
      existingPaymentAmount,
      existingPaymentProofUrl || '',
      existingBibNumber,
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

function uploadPaymentProof(orderId, fileData, userName, nationalId) {
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
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanNationalId + extension;

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
