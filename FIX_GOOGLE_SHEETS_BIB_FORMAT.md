# 🔧 FIX: Format Nomor BIB di Google Sheets

## 🐛 MASALAH

1. Kolom Nomor BIB sudah di-set ke **Plain Text** di Google Sheets
2. Saat **CREATE** registration via Apps Script:
   - Format berubah ke **Automatic** (bukan Plain Text)
   - Nomor masih tampil `0004` (karena pakai apostrophe prefix)
3. Saat **UPDATE** registration via Apps Script:
   - Format tetap **Automatic**
   - Nomor BIB berubah jadi `4` (kehilangan leading zeros) ❌

## 🔍 ROOT CAUSE

**Google Sheets behavior:**
- Saat kita `sheet.appendRow(data)` atau `range.setValues(data)`, Google Sheets **MENGABAIKAN** format kolom yang sudah di-set
- Format otomatis berubah ke **"Automatic"**
- Automatic format detection: `'0004` (string dengan apostrophe) → Sheets convert jadi number `4`

**Kenapa CREATE masih OK:**
- Kita pakai apostrophe prefix: `'0004`
- Sheets masih recognize sebagai text dan tampil sebagai `0004`

**Kenapa UPDATE jadi `4`:**
- Saat UPDATE, kita ambil existing value: `'0004`
- Kita set ulang dengan `range.setValues()`
- Sheets re-evaluate format → convert ke number → jadi `4` ❌

---

## ✅ SOLUSI: Force Format Kolom ke Plain Text

### Approach: Set Number Format via Apps Script

Setelah insert/update data, **explicitly set format kolom BIB ke Plain Text** menggunakan:
```javascript
range.setNumberFormat('@STRING@');
// atau
range.setNumberFormat('@');
```

**Format `@STRING@` atau `@`:**
- Force cell ke plain text format
- Prevent automatic number conversion
- Preserve leading zeros

---

## 🔧 KODE APPS SCRIPT LENGKAP (UPDATED)

Tambahkan fix ini ke Apps Script Anda:

### 1. Update Function: createRegistration

**Tambahkan setelah `sheet.appendRow(rowData)`:**

```javascript
function createRegistration(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // ... existing code ...
    
    // Append row
    sheet.appendRow(rowData);
    
    // ✅ FIX: Force format kolom BIB ke Plain Text
    const lastRow = sheet.getLastRow();
    const bibCell = sheet.getRange(lastRow, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@'); // Force plain text format
    
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
```

---

### 2. Update Function: updateRegistration

**Tambahkan setelah `range.setValues([updatedRowData])`:**

```javascript
function updateRegistration(orderId, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    // ... existing code untuk find row ...
    
    // Update entire row
    const range = sheet.getRange(rowIndex, 1, 1, updatedRowData.length);
    range.setValues([updatedRowData]);
    
    // ✅ FIX: Force format kolom BIB ke Plain Text
    const bibCell = sheet.getRange(rowIndex, COLUMNS.BIB_NUMBER);
    bibCell.setNumberFormat('@STRING@'); // Force plain text format
    
    Logger.log('Registration updated - Row: ' + rowIndex);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true,
        message: 'Registration updated successfully',
        rowIndex: rowIndex
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error updating registration: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### 3. (OPTIONAL) Batch Fix: Format Seluruh Kolom BIB

Jika ingin fix semua row sekaligus, tambahkan function ini:

```javascript
/**
 * Fix format kolom BIB untuk semua row
 * Run this once to fix existing data
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
    
    // Get entire BIB column (skip header)
    const bibRange = sheet.getRange(2, COLUMNS.BIB_NUMBER, lastRow - 1, 1);
    
    // Set format to plain text for all cells
    bibRange.setNumberFormat('@STRING@');
    
    Logger.log('Fixed BIB format for ' + (lastRow - 1) + ' rows');
    
  } catch (error) {
    Logger.log('Error fixing BIB formats: ' + error.toString());
  }
}
```

**Cara run:**
1. Buka Apps Script Editor
2. Pilih function `fixAllBibFormats` dari dropdown
3. Click **Run** (▶️)
4. Check logs - should show: "Fixed BIB format for X rows"
5. Check Google Sheets - kolom BIB harus format Plain Text

---

## 📋 DEPLOYMENT STEPS

### Step 1: Update Apps Script

1. **Buka** Google Sheets → Extensions → Apps Script
2. **Backup** kode yang ada (copy ke text file)
3. **Update** function `createRegistration`:
   - Tambahkan 3 baris setelah `sheet.appendRow(rowData)`
4. **Update** function `updateRegistration`:
   - Tambahkan 3 baris setelah `range.setValues([updatedRowData])`
5. **Tambahkan** function `fixAllBibFormats` (optional, untuk fix data lama)
6. **Save** (Ctrl+S / Cmd+S)

### Step 2: Test Function

**Test fixAllBibFormats:**
```
1. Run fixAllBibFormats() di Apps Script Editor
2. Check logs
3. Check Google Sheets - kolom BIB harus Plain Text
4. Verify nomor BIB tampil dengan leading zeros (0001, 0002, dst)
```

### Step 3: Deploy Ulang

```
1. Click: Deploy → Manage deployments
2. Click: Edit (✏️) pada deployment aktif
3. Version: New version
4. Description: "Fix BIB format to Plain Text"
5. Click: Deploy
6. URL tetap sama
```

### Step 4: Test dari Frontend

**Test CREATE:**
```
1. Clear localStorage
2. Isi form → submit
3. Check Google Sheets:
   - Kolom BIB harus format "Plain text"
   - Nomor tampil: 0001, 0002, dst
```

**Test UPDATE:**
```
1. Klik "Ubah Data Diri"
2. Edit data → submit
3. Check Google Sheets:
   - Kolom BIB tetap format "Plain text" ✅
   - Nomor tetap: 0001, 0002, dst ✅
   - TIDAK berubah jadi: 1, 2, dst ❌
```

---

## 🔍 VERIFICATION

### Check Format di Google Sheets

**Manual check:**
1. Buka Google Sheets
2. Click cell di kolom BIB (contoh: cell Z2)
3. Check menu: Format → Number
4. Harus tercentang: **"Plain text"** ✅
5. Jika masih "Automatic" → format belum ter-apply

**Verify nomor tampil dengan benar:**
- ✅ `0001`, `0002`, `0003`, dst
- ❌ Bukan: `1`, `2`, `3`, dst

---

## 🧪 TESTING GUIDE

### Test 1: Fix Existing Data

**Steps:**
1. **Sebelum fix**, check Google Sheets:
   - Select cell di kolom BIB
   - Format menu → Harus "Automatic"
   - Beberapa nomor mungkin sudah jadi `1`, `2`, dst

2. **Run fixAllBibFormats()** di Apps Script Editor

3. **Setelah fix**, check Google Sheets:
   - Select cell di kolom BIB
   - Format menu → Harus "Plain text" ✅
   - Semua nomor harus `0001`, `0002`, dst ✅

---

### Test 2: Create New Registration

**Steps:**
1. Clear localStorage
2. Isi form lengkap → submit
3. Check Google Sheets (row baru):
   - Click cell kolom BIB
   - Format → Harus "Plain text" ✅
   - Nomor tampil: `0001` ✅

---

### Test 3: Update Registration (CRITICAL!)

**Steps:**
1. Dari Test 2, klik "Ubah Data Diri"
2. Edit beberapa field
3. Submit ulang
4. **Check Google Sheets:**
   - Click cell kolom BIB (row yang sama)
   - Format → Harus tetap "Plain text" ✅
   - Nomor tetap: `0001` ✅
   - **TIDAK berubah jadi:** `1` ❌

**Expected Result:**
- ✅ Format tetap Plain text
- ✅ Nomor tetap dengan leading zeros

---

## 📊 BEFORE vs AFTER

### BEFORE (Bug)

**Sheet Format:**
| Row | ... | Nomor BIB | Format |
|-----|-----|-----------|---------|
| 2   | ... | 0003      | Automatic ❌ |
| 3   | ... | 0010      | Automatic ❌ |

**Setelah UPDATE:**
| Row | ... | Nomor BIB | Format |
|-----|-----|-----------|---------|
| 2   | ... | 3         | Automatic ❌ |
| 3   | ... | 10        | Automatic ❌ |

---

### AFTER (Fixed)

**Sheet Format:**
| Row | ... | Nomor BIB | Format |
|-----|-----|-----------|---------|
| 2   | ... | 0003      | Plain text ✅ |
| 3   | ... | 0010      | Plain text ✅ |

**Setelah UPDATE:**
| Row | ... | Nomor BIB | Format |
|-----|-----|-----------|---------|
| 2   | ... | 0003      | Plain text ✅ |
| 3   | ... | 0010      | Plain text ✅ |

---

## 🎯 KEY POINTS

### Why `.setNumberFormat('@STRING@')`?

**Format codes:**
- `@` = Text format (simple)
- `@STRING@` = Force text format (more explicit)
- Both work the same way
- Prevent automatic number conversion

**Kenapa perlu set format via Apps Script?**
- Manual format di Sheets UI tidak persist saat insert/update via script
- `appendRow()` dan `setValues()` reset format ke "Automatic"
- Must explicitly set format via `setNumberFormat()` after insert/update

**Alternative approach:**
- Could use `setNumberFormats()` for batch (multiple cells at once)
- Could format entire column before insert/update
- But setting per-cell after insert/update is more reliable

---

## ⚠️ TROUBLESHOOTING

### Format masih berubah ke Automatic

**Possible causes:**
1. Apps Script belum di-update dengan fix
2. Apps Script belum di-deploy ulang
3. Format di-set BEFORE insert/update (should be AFTER)

**Solution:**
1. Verify fix sudah ditambahkan di Apps Script
2. Deploy ulang (New version)
3. Ensure `setNumberFormat` dipanggil AFTER `appendRow` atau `setValues`

---

### Nomor masih berubah jadi 1, 2, dst

**Possible causes:**
1. Format belum di-apply (masih Automatic)
2. Data tidak pakai apostrophe prefix

**Solution:**
1. Run `fixAllBibFormats()` untuk fix data existing
2. Verify Apps Script pakai apostrophe prefix:
   ```javascript
   const bibNumberWithPrefix = "'" + bibNumber;
   ```
3. Check cell format di Sheets (harus Plain text)

---

### Data lama sudah corrupt (jadi 1, 2, dst)

**Solution:**
1. **Tidak bisa auto-recover** leading zeros dari number
2. **Manual fix** diperlukan:
   - If BIB should be `0001` but shows `1`:
   - Manually edit cell: `'0001`
   - Or re-register users (if few users only)
3. **Prevention**: Fix Apps Script sebelum more data corrupted

---

## 📝 SUMMARY

### Problem:
- Format kolom BIB berubah ke Automatic saat insert/update via Apps Script
- Leading zeros hilang saat update registration

### Solution:
```javascript
// After appendRow or setValues:
const bibCell = sheet.getRange(row, COLUMNS.BIB_NUMBER);
bibCell.setNumberFormat('@STRING@'); // Force Plain Text
```

### Where to Add:
1. ✅ `createRegistration()` - after `sheet.appendRow()`
2. ✅ `updateRegistration()` - after `range.setValues()`
3. ✅ `fixAllBibFormats()` - run once to fix existing data

### Result:
- ✅ Format tetap Plain text
- ✅ Leading zeros preserved: `0001`, `0002`, dst
- ✅ Works for CREATE and UPDATE

---

## 🎉 NEXT STEPS

1. **Update Apps Script** dengan fix di atas
2. **Run `fixAllBibFormats()`** untuk fix data existing
3. **Deploy ulang** Apps Script
4. **Test**:
   - Create registration → check format
   - Update registration → verify BIB tidak berubah
5. **Verify** semua nomor BIB dengan leading zeros

---

**Setelah fix ini, masalah format Nomor BIB akan teratasi!** 🚀
