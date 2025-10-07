# ⚠️ APPS SCRIPT UPDATE REQUIRED!

## 🎯 CRITICAL: Manual Apps Script Update Needed

**Context:** Filename format untuk upload payment proof berubah dari `Nama_NomorKTP` ke `Nama_NomorBIB`.

**What Changed:**
- Frontend now sends `bibNumber` instead of `nationalId`
- API route now expects `bibNumber` parameter
- Apps Script needs to update filename format

---

## 📝 REQUIRED CHANGES IN APPS SCRIPT

### 1. Update `doPost()` Function

**Find this line:**
```javascript
    } else if (action === 'uploadPaymentProof') {
      const driveLink = uploadPaymentProof(
        requestData.orderId, 
        requestData.file,
        requestData.userName,
        requestData.nationalId  // ← CHANGE THIS!
      );
```

**Change to:**
```javascript
    } else if (action === 'uploadPaymentProof') {
      const driveLink = uploadPaymentProof(
        requestData.orderId, 
        requestData.file,
        requestData.userName,
        requestData.bibNumber  // ← CHANGED!
      );
```

### 2. Update `uploadPaymentProof()` Function Signature

**Find this line:**
```javascript
function uploadPaymentProof(orderId, fileData, userName, nationalId) {
```

**Change to:**
```javascript
function uploadPaymentProof(orderId, fileData, userName, bibNumber) {
```

### 3. Update Filename Generation Logic

**Find these lines:**
```javascript
    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNationalId = (nationalId || '0000000000000000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanNationalId + extension;
```

**Change to:**
```javascript
    const cleanUserName = (userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanBibNumber = (bibNumber || '0000').replace(/[^0-9]/g, '');
    const fileName = cleanUserName + '_' + cleanBibNumber + extension;
```

---

## ✅ COMPLETE UPDATED `uploadPaymentProof()` FUNCTION

Replace entire function with this:

```javascript
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
```

---

## 🧪 TESTING AFTER UPDATE

**Test upload payment proof:**
1. Complete registration form
2. Upload payment proof image
3. Check Google Drive folder
4. Verify filename format: `NamaLengkap_0001.jpg`
   - Example: `JOHN_DOE_0001.jpg` (BIB number 0001)
   - NOT: `JOHN_DOE_1234567890123456.jpg` (National ID)

**Expected Results:**
```
✅ Filename: NamaLengkap_NomorBIB.jpg
✅ Example: BUDI_SANTOSO_0023.jpg
✅ BIB: 4 digits (0001, 0002, 0023, etc.)
❌ NOT: 16 digits National ID
```

---

## 📊 BEFORE vs AFTER

### Before (Old Format):
```
Filename: BUDI_SANTOSO_3201234567890123.jpg
          ^Name       ^16-digit National ID

Problem:
- National ID is sensitive data
- File name too long
- Not user-friendly
```

### After (New Format):
```
Filename: BUDI_SANTOSO_0023.jpg
          ^Name       ^4-digit BIB Number

Benefits:
✅ BIB number is public identifier
✅ Short, clean filename
✅ Easy to find by BIB
✅ No sensitive data exposed
```

---

## ⚠️ IMPORTANT NOTES

1. **Don't forget to deploy** after making changes:
   - Click **Deploy → New deployment**
   - Or click **Deploy → Manage deployments → Edit**
   
2. **Test immediately** after deploying:
   - Try uploading payment proof
   - Check filename in Google Drive
   
3. **Fallback value** is set to `'0000'` if BIB is missing:
   ```javascript
   const cleanBibNumber = (bibNumber || '0000').replace(/[^0-9]/g, '');
   ```

4. **Frontend changes already deployed:**
   - ✅ page.tsx: sends bibNumber
   - ✅ route.ts: expects bibNumber
   - ⚠️ Apps Script: needs manual update

---

## 🔍 VERIFICATION CHECKLIST

After updating Apps Script:

- [ ] Update `doPost()` function parameter
- [ ] Update `uploadPaymentProof()` function signature
- [ ] Update filename generation logic
- [ ] Save Apps Script
- [ ] Deploy new version
- [ ] Test upload payment proof
- [ ] Verify filename format in Google Drive
- [ ] Confirm BIB number (4 digits) in filename
- [ ] No errors in execution logs

---

## 📞 IF ISSUES OCCUR

**If upload fails after update:**
1. Check Apps Script **Executions** tab for errors
2. Verify `bibNumber` is received in `requestData`
3. Check filename generation logic
4. Verify Drive folder permissions
5. Test with manual execution

**Common Issues:**
```
Error: "bibNumber is undefined"
Fix: Frontend not sending bibNumber, check deployment

Error: "Invalid filename"
Fix: Check cleanBibNumber regex and formatting

Error: "Permission denied"
Fix: Re-authorize Apps Script permissions
```

---

## 🎯 SUMMARY

**What needs to be done:**
1. Open Google Apps Script editor
2. Find `doPost()` function → Change `nationalId` to `bibNumber`
3. Find `uploadPaymentProof()` signature → Change parameter name
4. Update filename generation logic → Use `bibNumber` instead of `nationalId`
5. Save and deploy new version
6. Test upload functionality

**Estimated time:** 5 minutes

**Risk level:** Low (simple parameter rename)

**Impact:** Critical for proper filename format

---

**Date:** 2024-10-07  
**Status:** ⚠️ Manual Update Required  
**Priority:** High (before production use)

---

🎯 **Update Apps Script sebelum production deployment untuk ensure filename format correct!**
