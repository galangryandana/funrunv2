```javascript
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
  EXPERIENCED_COMPlications: 19,
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
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'create') {
      return createRegistration(data.data);
    } else if (action === 'update') {
      return updateRegistration(data.orderId, data.data);
    } else if (action === 'uploadPaymentProof') {
      const driveLink = uploadPaymentProof(
        data.orderId,
        data.file,
        data.userName,
        data.nationalId
      );
      return updatePaymentProof(data.orderId, driveLink);
    } else if (action === 'getBib') {
      return getBibNumber(data.orderId);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet "' + SHEET_NAME + '" not found');
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

    Logger.log('Registration created - BIB: ' + bibNumber + ' - Payment: ' + paymentAmount);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        bibNumber: bibNumber,
        paymentAmount: paymentAmount,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error creating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function updateRegistration(orderId, data) {
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

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    const existingBibValue = values[rowIndex - 1][COLUMNS.BIB_NUMBER - 1];
    const bibNumberString = String(existingBibValue).replace(/^'/, '').padStart(4, '0');
    const bibNumberWithPrefix = "'" + bibNumberString;

    const existingPaymentAmount = values[rowIndex - 1][COLUMNS.PAYMENT_AMOUNT - 1];

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
      values[rowIndex - 1][COLUMNS.PAYMENT_PROOF_URL - 1],
      bibNumberWithPrefix,
    ];

    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);

    Logger.log('Registration updated - Row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Registration updated successfully',
        rowIndex: rowIndex,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error updating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateBibNumber(registrationNumber) {
  const bibNum = registrationNumber;
  return String(bibNum).padStart(4, '0');
}

function generatePaymentAmount(registrationNumber) {
  const baseAmount = 200000;
  return baseAmount + registrationNumber;
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

    const fileUrl = file.getUrl();
    Logger.log('Payment proof uploaded: ' + fileName + ' → ' + fileUrl);

    return fileUrl;
  } catch (error) {
    Logger.log('Error uploading to Drive: ' + error.toString());
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
    Logger.log('Error updating payment proof: ' + error.toString());
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

        const cleanBibNumber =
          typeof bibNumber === 'string' && bibNumber.startsWith("'")
            ? bibNumber.substring(1)
            : String(bibNumber);

        return ContentService.createTextOutput(
          JSON.stringify({ success: true, bibNumber: cleanBibNumber })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Registration not found for Nomor KTP: ' + orderId })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error getting BIB number: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

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

function testUpdate() {
  const testNationalId = '1234567890123456';

  const testData = {
    email: 'updated@example.com',
    phoneNumber: '081234567890',
    registeringFor: 'Diri Sendiri',
    name: 'John Doe UPDATED',
    birthDate: '1990-01-01',
    gender: 'Pria',
    address: 'Jl. Updated No. 123',
    nationalId: testNationalId,
    bibName: 'JOHN',
    registrationChannel: 'Personal',
    registrationChannelName: '',
    infoSource: 'Sosial Media',
    bloodType: 'O+',
    chronicCondition: 'Tidak',
    underDoctorCare: 'Tidak',
    requiresMedication: 'Tidak',
    experiencedComplications: 'Tidak',
    experiencedFainting: 'Tidak',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '081234567890',
    shirtSize: 'XL',
  };

  const result = updateRegistration(testNationalId, testData);
  Logger.log(result.getContent());
}
```
