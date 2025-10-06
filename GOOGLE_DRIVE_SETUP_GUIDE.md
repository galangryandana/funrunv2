# 📁 GOOGLE DRIVE INTEGRATION - COMPLETE SETUP GUIDE

## 🎯 OVERVIEW

Google Drive akan digunakan untuk menyimpan **bukti pembayaran** peserta dengan struktur folder otomatis:

```
Google Drive (My Drive)
└── Payment Proofs - Trail Run/
    ├── 2025-06/
    │   ├── PROOF_FUN-RUN-xxx-123_bukti1.jpg
    │   ├── PROOF_FUN-RUN-xxx-456_bukti2.jpg
    │   └── ...
    ├── 2025-07/
    │   └── ...
    └── 2025-08/
        └── ...
```

**Folder dibuat otomatis** saat upload pertama kali!

---

## ✅ GOOD NEWS

**Google Drive API sudah built-in di Apps Script!**

Anda **TIDAK PERLU**:
- ❌ Buat API key terpisah
- ❌ Enable Google Drive API di Console
- ❌ Setup OAuth credentials
- ❌ Install library tambahan

Yang PERLU:
- ✅ Deploy Apps Script dengan permissions yang benar
- ✅ Authorize akses saat pertama kali deploy
- ✅ Test upload untuk create folder structure

---

## 📋 STEP-BY-STEP SETUP

### **STEP 1: Update Apps Script Code**

1. **Open Google Sheets** → Extensions → Apps Script
2. **Paste code** dari `UPDATE_APPS_SCRIPT_AUTO_BIB.md`
3. **Save** (Ctrl+S / Cmd+S)
4. **Verify** bahwa fungsi `uploadPaymentProof()` ada di code

Code yang penting (sudah ada di UPDATE_APPS_SCRIPT_AUTO_BIB.md):

```javascript
function uploadPaymentProof(orderId, fileData) {
  try {
    // Get or create root folder
    const rootFolderName = 'Payment Proofs - Trail Run';
    let rootFolder;
    
    const folders = DriveApp.getFoldersByName(rootFolderName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(rootFolderName);  // ← Auto-create!
    }

    // Create month folder (YYYY-MM)
    const now = new Date();
    const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');
    let monthFolder;
    
    const monthFolders = rootFolder.getFoldersByName(monthFolderName);
    if (monthFolders.hasNext()) {
      monthFolder = monthFolders.next();
    } else {
      monthFolder = rootFolder.createFolder(monthFolderName);  // ← Auto-create!
    }

    // Decode base64 and upload
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.mimeType,
      fileData.name
    );

    const fileName = 'PROOF_' + orderId + '_' + fileData.name;
    const file = monthFolder.createFile(blob.setName(fileName));

    // Make file shareable with link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (error) {
    Logger.log('Error uploading to Drive: ' + error.toString());
    throw new Error('Failed to upload to Google Drive: ' + error.toString());
  }
}
```

---

### **STEP 2: Deploy dengan Permissions yang Benar**

#### **2.1. Deploy Apps Script**

1. **Click**: Deploy → New deployment
2. **Type**: Web app
3. **Description**: "Auto BIB + Drive Upload"
4. **Execute as**: **Me (your-email@gmail.com)** ⚠️ **PENTING!**
5. **Who has access**: **Anyone**
6. **Click**: Deploy

#### **2.2. Authorize Permissions (First Time)**

Saat deploy pertama kali, akan muncul popup:

```
┌─────────────────────────────────────────┐
│ Authorization Required                  │
│                                         │
│ This app wants to:                      │
│ ✓ View and manage spreadsheets         │
│ ✓ View and manage files in Drive       │  ← PENTING INI!
│                                         │
│ [Cancel]           [Allow]              │
└─────────────────────────────────────────┘
```

**Actions:**

1. **Click**: "Review Permissions" atau "Authorize"
2. **Choose**: Your Google account
3. Jika muncul warning "This app isn't verified":
   - Click: **"Advanced"**
   - Click: **"Go to [Your Project Name] (unsafe)"**
   - **This is safe** karena ini script Anda sendiri!
4. **Click**: **"Allow"**
5. Akan kembali ke Apps Script
6. **Copy**: Web app URL yang muncul

**Web App URL Example:**
```
https://script.google.com/macros/s/AKfycbxxx.../exec
```

---

### **STEP 3: Update Environment Variable**

**File**: `.env.local` (di root project)

```bash
# Google Sheets Apps Script URL
GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
```

⚠️ **Ganti dengan URL Anda!**

---

### **STEP 4: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

Environment variables perlu reload!

---

### **STEP 5: Test Upload (CRITICAL)**

#### **5.1. Test dari Apps Script Editor**

Create test function:

```javascript
function testUploadToDrive() {
  try {
    // Simulate file data
    const testFile = {
      name: 'test-bukti.jpg',
      mimeType: 'image/jpeg',
      data: Utilities.base64Encode('Test file content for Drive upload')
    };
    
    const url = uploadPaymentProof('TEST-ORDER-123', testFile);
    
    Logger.log('✅ Upload SUCCESS!');
    Logger.log('Drive URL: ' + url);
    Logger.log('Check your Google Drive for folder: Payment Proofs - Trail Run');
  } catch (error) {
    Logger.log('❌ Upload FAILED!');
    Logger.log('Error: ' + error.toString());
  }
}
```

**Run test:**

1. Select function: **testUploadToDrive**
2. Click: **Run** (▶️ button)
3. Check **Execution log** (View → Logs)
4. Should see: "✅ Upload SUCCESS!" + Drive URL

**Check Google Drive:**

1. Open: https://drive.google.com
2. Look for folder: **"Payment Proofs - Trail Run"**
3. Inside: Subfolder **"2025-06"** (current month)
4. Inside: File **"PROOF_TEST-ORDER-123_test-bukti.jpg"**

✅ **If you see the file, Drive integration is working!**

---

#### **5.2. Test dari Frontend**

1. **Open**: http://localhost:3000
2. **Fill** registration form
3. **Submit**
4. **Upload** real image file (JPG/PNG, max 5MB)
5. **Click**: "Kirim Bukti Pembayaran"
6. **Wait**: Loading indicator
7. **Should see**: Success page

**Check Drive:**
- New file in folder: `Payment Proofs - Trail Run / YYYY-MM /`
- File name: `PROOF_FUN-RUN-xxx-yyy_yourfile.jpg`

**Check Sheets:**
- Column 25 (Link Bukti Bayar) filled with Drive URL
- Click link → Should open file in browser

---

## 🔧 KONFIGURASI ADVANCED

### Customize Folder Name

Edit di Apps Script (line ~195):

```javascript
// Change this:
const rootFolderName = 'Payment Proofs - Trail Run';

// To:
const rootFolderName = 'Bukti Transfer Trail Run 2025';
```

### Customize Month Format

Edit di Apps Script (line ~202):

```javascript
// Current: 2025-06
const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM');

// Options:
// June 2025
const monthFolderName = Utilities.formatDate(now, 'Asia/Jakarta', 'MMMM yyyy');

// 2025-Q2 (Quarter)
const monthFolderName = 'Q' + Math.ceil((now.getMonth() + 1) / 3) + '-' + now.getFullYear();
```

### Customize File Naming

Edit di Apps Script (line ~223):

```javascript
// Current: PROOF_FUN-RUN-xxx-123_bukti.jpg
const fileName = 'PROOF_' + orderId + '_' + fileData.name;

// Options:
// 20250601-103045_FUN-RUN-xxx-123_bukti.jpg (with timestamp)
const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyyyMMdd-HHmmss');
const fileName = timestamp + '_' + orderId + '_' + fileData.name;

// bukti-transfer-0001-John-Doe.jpg (with BIB and name)
const fileName = 'bukti-transfer-' + bibNumber + '-' + userName + '.jpg';
```

---

## 🔐 PERMISSIONS & SECURITY

### Apps Script Permissions

Apps Script memerlukan permissions:

| Permission | Why? | Safe? |
|------------|------|-------|
| View & manage spreadsheets | Read/write registration data | ✅ Yes - Your own sheet |
| View & manage files in Drive | Upload payment proofs | ✅ Yes - Your own Drive |

### File Sharing Settings

Files di-set ke **"Anyone with link can VIEW"**:

```javascript
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
```

**Artinya:**
- ✅ Anyone dengan link bisa **view** file
- ✅ Good untuk admin verification
- ❌ Cannot edit/delete (VIEW only)
- ❌ Not searchable di Google (hidden from search)

**To change** (if needed):

```javascript
// Only you can view (more private)
file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.VIEW);

// Anyone can edit (NOT recommended)
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
```

---

## 🧪 TESTING CHECKLIST

### ✅ Pre-Deployment Tests

- [ ] Apps Script code complete
- [ ] `uploadPaymentProof()` function exists
- [ ] `testUploadToDrive()` runs successfully
- [ ] Folder created in Drive
- [ ] Test file visible in Drive
- [ ] Test file shareable (open link in incognito)

### ✅ Post-Deployment Tests

- [ ] `.env.local` updated with Apps Script URL
- [ ] Dev server restarted
- [ ] Registration form submits successfully
- [ ] Payment page shows BIB + Amount
- [ ] File upload works (< 5MB images)
- [ ] Success page shows after upload
- [ ] Drive folder has new file
- [ ] Sheets has Drive link in column 25
- [ ] Link opens file in browser
- [ ] File viewable without login (incognito test)

---

## 🚨 TROUBLESHOOTING

### Issue 1: "Apps Script needs authorization"

**Cause:** First time deployment

**Solution:**
1. Click "Review Permissions"
2. Choose your Google account
3. Click "Advanced" → "Go to [app] (unsafe)"
4. Click "Allow"

---

### Issue 2: "Failed to upload to Google Drive"

**Possible causes:**

**A. Apps Script not authorized**
```
Check: Apps Script Executions log
Look for: "Insufficient permissions"
Fix: Re-deploy and authorize
```

**B. Deploy settings wrong**
```
Check: Deploy settings
Should be: Execute as "Me"
Fix: Re-deploy with correct settings
```

**C. Code error**
```
Check: Apps Script Execution log
Look for: Error message
Fix: Check code, compare with documentation
```

---

### Issue 3: Folder not created

**Cause:** Permission issue or code error

**Debug steps:**

1. **Run test function**:
```javascript
testUploadToDrive()
```

2. **Check Execution log**:
   - View → Logs
   - Look for errors

3. **Check Drive permissions**:
   - Apps Script → Project Settings
   - Scopes → Should include `https://www.googleapis.com/auth/drive`

4. **Manually create folder** (temporary workaround):
   - Go to Drive
   - Create folder: "Payment Proofs - Trail Run"
   - Try upload again

---

### Issue 4: File uploaded but link not in Sheets

**Cause:** Update function failed

**Debug:**

1. **Check Apps Script log**:
```
Look for: "Payment proof updated for row: X"
If not found: updatePaymentProof() failed
```

2. **Check return value**:
```javascript
// Add logging in updatePaymentProof()
Logger.log('Updating row: ' + lastRow);
Logger.log('Drive link: ' + driveLink);
```

3. **Manual fix** (temporary):
   - Copy Drive link from log
   - Paste manually to Sheets column 25

---

### Issue 5: "File too large"

**Error**: Upload fails with large files

**Causes:**
- File > 5MB (frontend validation)
- File > 50MB (Apps Script limit)
- Timeout (Apps Script max 6 minutes)

**Solutions:**

1. **Compress image** before upload:
```javascript
// User should compress image using:
- TinyPNG.com
- Squoosh.app
- Phone's "reduce file size" option
```

2. **Increase frontend limit** (not recommended):
```javascript
// In page.tsx, line ~495
if (file.size > 10 * 1024 * 1024) {  // 10MB instead of 5MB
  alert('Ukuran file maksimal 10MB');
}
```

---

### Issue 6: "Cannot open file" (Drive link broken)

**Cause:** File permissions not set

**Fix in Apps Script:**

```javascript
// Make sure this line exists:
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
```

**Manual fix:**

1. Open Drive
2. Right-click file
3. Share → Change to "Anyone with link"
4. Set permission: Viewer

---

## 📊 MONITORING & LOGS

### Where to Check Logs

**1. Apps Script Execution Log:**
```
Apps Script Editor → View → Logs
Shows: Function calls, errors, custom logs
```

**2. Apps Script Executions:**
```
Apps Script Editor → Executions (left sidebar)
Shows: All executions with status (Success/Error)
Time taken, errors
```

**3. Frontend Console:**
```
Browser → F12 → Console tab
Shows: API responses, upload progress, errors
```

**4. Google Sheets:**
```
Column 25: Link Bukti Bayar
Should be filled after successful upload
```

**5. Google Drive:**
```
Payment Proofs - Trail Run folder
Should contain uploaded files
```

---

## 📁 FOLDER STRUCTURE RESULT

After successful setup:

```
Google Drive (My Drive)
│
└── Payment Proofs - Trail Run/          ← Root folder (auto-created)
    │
    ├── 2025-06/                          ← Month folder (auto-created)
    │   ├── PROOF_FUN-RUN-1759469025308-273_bukti1.jpg
    │   ├── PROOF_FUN-RUN-1759469025308-456_bukti2.jpg
    │   ├── PROOF_FUN-RUN-1759469025308-789_transfer.png
    │   └── ... (all June 2025 proofs)
    │
    ├── 2025-07/                          ← Next month (auto-created)
    │   ├── PROOF_FUN-RUN-xxx-xxx_bukti3.jpg
    │   └── ... (all July 2025 proofs)
    │
    └── 2025-08/                          ← Next month (auto-created)
        └── ... (all August 2025 proofs)
```

**Benefits:**
- ✅ Organized by month
- ✅ Easy to find files
- ✅ Auto-created (no manual work)
- ✅ Searchable by order ID
- ✅ All in one place

---

## 🎯 SUCCESS CRITERIA

✅ **Setup is complete when:**

1. **Apps Script deployed** with Drive permissions
2. **Test function** `testUploadToDrive()` succeeds
3. **Folder created** in Google Drive
4. **Test file** visible in folder
5. **Frontend upload** works end-to-end
6. **Sheets updated** with Drive link
7. **Link opens** file in browser (incognito test works)

---

## 📞 NEED HELP?

If stuck, provide these details:

1. **Apps Script Execution log** (copy error message)
2. **Browser Console log** (copy error from F12)
3. **Screenshot** of Deploy settings
4. **Screenshot** of Drive folder (if created)
5. **Test function result** (testUploadToDrive log)

---

## 🚀 QUICK START SUMMARY

```bash
# 1. Update Apps Script
# - Paste code from UPDATE_APPS_SCRIPT_AUTO_BIB.md
# - Save

# 2. Deploy
# - Deploy → New deployment → Web app
# - Execute as: Me
# - Allow Drive permissions

# 3. Update .env.local
GOOGLE_SHEETS_SCRIPT_URL=your_apps_script_url_here

# 4. Restart dev server
npm run dev

# 5. Test
# - Run testUploadToDrive() in Apps Script
# - Check Drive for folder
# - Test upload from frontend
# - Verify file in Drive
# - Verify link in Sheets

# ✅ Done!
```

---

**Total setup time: ~10-15 minutes**

**Most common issue: Forgetting to authorize Drive permissions on first deploy!**

**Just click "Allow" when prompted and you're good to go!** 🎉
