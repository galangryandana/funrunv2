# ⚡ QUICK START - Manual Payment System

## 🎯 5-MINUTE SETUP GUIDE

### Step 1: Update Apps Script (Most Important!)

```bash
1. Open: Google Sheets → Extensions → Apps Script
2. Open: UPDATE_APPS_SCRIPT_MANUAL_PAYMENT.md
3. Copy ALL code sections from the documentation
4. Paste into Apps Script editor
5. Save (Ctrl+S)
6. Deploy → New deployment → Web app
7. Copy the Web app URL
```

### Step 2: Update Environment Variable

```bash
# .env.local
GOOGLE_SHEETS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
```

### Step 3: Update Bank Account (Optional - Currently Template)

```typescript
// src/app/page.tsx (line ~470)
// Current:
Bank: Bank BCA
Nomor Rekening: 1234567890
Atas Nama: Panitia Trail Run

// Update with real values:
Bank: Your Bank Name
Nomor Rekening: Your Account Number
Atas Nama: Your Account Name
```

### Step 4: Test Locally

```bash
npm run dev
# Open http://localhost:3000
# Fill form → Submit → Check payment page → Upload file → Success!
```

### Step 5: Deploy

```bash
git add -A
git commit -m "Update bank account info and Apps Script URL"
git push origin main
# Vercel auto-deploys
```

---

## 📋 WHAT CHANGED?

### Before (Midtrans):
```
User → Fill Form → Midtrans Popup → Pay → Auto Success → Get BIB
```

### After (Manual):
```
User → Fill Form → Payment Instructions → Upload Proof → Waiting
                                                            ↓
                                                    Admin Verifies
                                                            ↓
                                                     Assign BIB
```

---

## 💰 PAYMENT AMOUNTS

```
Registration #1  → Rp 200.001
Registration #2  → Rp 200.002
Registration #3  → Rp 200.003
...
Registration #150 → Rp 200.150
```

**Why unique?** Easy to match with bank transfer!

---

## 🗂️ NEW GOOGLE SHEETS COLUMNS

```
AA (27): Payment Amount    → 200001, 200002, 200003...
AB (28): Status            → PENDING / SUCCESS / FAILED
AC (29): Payment Proof URL → Google Drive link
AD (30): Verified At       → Timestamp
AE (31): Verified By       → Admin email
```

**Removed:** Kategori Pendaftar (Pelajar/Umum)

---

## 🚀 QUICK TEST

### Test Registration:
1. Go to your app
2. Fill form completely
3. Click "Selesaikan Pendaftaran"
4. Should see: "Instruksi Pembayaran" page
5. Should see: Unique amount (e.g., Rp 200.001)

### Test Upload:
1. Click "Choose File"
2. Select any image (max 5MB)
3. Click "Kirim Bukti Pembayaran"
4. Should see: Success page
5. Check Sheets: Payment Proof URL filled
6. Check Drive: File uploaded

### Test Admin Verification (Manual):
1. Open Google Sheets
2. Find the row (Status: PENDING)
3. Open Payment Proof URL
4. Verify the transfer
5. Change Status to SUCCESS
6. Add BIB number manually (0001, 0002, etc)
7. Fill Verified At and Verified By

---

## ⚠️ IMPORTANT NOTES

1. **Apps Script MUST be updated** - System won't work without it!
2. **Payment Amount** is auto-generated - Don't edit manually!
3. **BIB Numbers** are assigned AFTER admin verification
4. **Payment Proof** stored in Google Drive folder "Payment Proofs - Trail Run"
5. **All payments** are Rp 200.000 base (no student/general)

---

## 🔗 RESOURCES

- **Full Documentation**: `UPDATE_APPS_SCRIPT_MANUAL_PAYMENT.md`
- **Implementation Summary**: `MANUAL_PAYMENT_IMPLEMENTATION_SUMMARY.md`
- **Apps Script Editor**: Google Sheets → Extensions → Apps Script
- **Drive Folder**: Check after first upload

---

## 🆘 NEED HELP?

### Common Errors:

**"Google Sheets Script URL not configured"**
→ Update `.env.local` with Apps Script URL

**"Failed to create registration"**
→ Apps Script not updated or not deployed

**"Failed to upload payment proof"**
→ Check file size (max 5MB) and type (images only)

**"Payment amount wrong"**
→ Check `generateNextPaymentAmount()` function in Apps Script

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Apps Script updated
- [ ] Apps Script deployed (new Web app URL)
- [ ] `.env.local` updated with new URL
- [ ] Bank account info updated (optional)
- [ ] Tested registration flow
- [ ] Tested file upload
- [ ] Tested Google Sheets update
- [ ] Tested Google Drive upload
- [ ] Pushed to GitHub
- [ ] Vercel deployed
- [ ] Tested on production URL

---

**Total Setup Time: ~20 minutes**

**Ready to launch! 🚀**
