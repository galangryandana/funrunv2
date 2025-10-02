# 🔧 Manual Update Status Pembayaran

## Kapan Digunakan?

Untuk **local development** ketika webhook tidak bisa jalan (karena localhost tidak publicly accessible).

---

## Cara Manual Update Status

### Langkah 1: Cari Order ID

Di Google Sheets, cari Order ID transaksi yang sudah dibayar.

Contoh: `FUN-RUN-1696146625-123`

### Langkah 2: Buka Apps Script Editor

1. Buka Google Sheets Anda
2. **Extensions** → **Apps Script**

### Langkah 3: Jalankan Test Function

1. Scroll ke function **`testUpdateStatus()`** (paling bawah kode)

2. **Edit Order ID**:
```javascript
function testUpdateStatus() {
  const orderId = 'FUN-RUN-1696146625-123'; // ← GANTI dengan Order ID yang valid
  
  const updateData = {
    status: 'SUCCESS',  // ← Status yang mau di-set
    paymentDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    transactionId: 'MANUAL-UPDATE',
    paymentType: 'manual'
  };
  
  const result = updateRegistrationStatus(orderId, updateData);
  Logger.log(result);
}
```

3. **Ganti `orderId`** dengan Order ID dari sheets

4. **Select function**: Pilih `testUpdateStatus` dari dropdown

5. **Klik Run** (▶️)

6. **Cek Execution Log**: View → Logs (harus muncul "success: true")

7. **Refresh Google Sheets** → Status harus berubah jadi SUCCESS

---

## Cara Cepat (Copy-Paste)

Tambahkan function ini di Apps Script untuk update cepat (paste di bawah kode yang ada):

```javascript
/**
 * UPDATE STATUS - Copy paste Order ID dari Sheets
 * Ganti ORDER_ID_NYA di baris 5
 */
function quickUpdateSuccess() {
  const orderId = 'PASTE_ORDER_ID_DI_SINI'; // ← Edit ini
  
  const updateData = {
    status: 'SUCCESS',
    paymentDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    transactionId: 'MANUAL-' + Date.now(),
    paymentType: 'manual_test'
  };
  
  const result = updateRegistrationStatus(orderId, updateData);
  Logger.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    Logger.log('✅ Status berhasil diupdate ke SUCCESS!');
  } else {
    Logger.log('❌ Gagal update: ' + result.error);
  }
}
```

**Cara pakai:**
1. Copy function di atas
2. Paste di Apps Script Editor (paling bawah)
3. Save (Ctrl+S)
4. Ganti `PASTE_ORDER_ID_DI_SINI` dengan Order ID dari sheets
5. Select function `quickUpdateSuccess`
6. Klik Run (▶️)
7. Refresh sheets → Status berubah!

---

## Bulk Update (Untuk Banyak Transaksi)

Jika ada banyak transaksi pending yang sebenarnya sudah bayar:

```javascript
/**
 * BULK UPDATE - Update beberapa Order ID sekaligus
 */
function bulkUpdateSuccess() {
  // List Order ID yang mau diupdate
  const orderIds = [
    'FUN-RUN-1696146625-123',
    'FUN-RUN-1696146626-456',
    'FUN-RUN-1696146627-789'
    // Tambahkan Order ID lain di sini
  ];
  
  const updateData = {
    status: 'SUCCESS',
    paymentDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
    transactionId: 'BULK-' + Date.now(),
    paymentType: 'bulk_manual_test'
  };
  
  orderIds.forEach(orderId => {
    const result = updateRegistrationStatus(orderId, updateData);
    Logger.log(orderId + ': ' + (result.success ? 'SUCCESS' : 'FAILED'));
  });
  
  Logger.log('✅ Bulk update selesai!');
}
```

---

## Tips

1. **Selalu refresh Sheets** setelah run function
2. **Cek Execution Log** jika ada error (View → Executions)
3. **Jangan edit manual di sheets** untuk kolom timestamp/ID (biar konsisten)

---

## Untuk Production

Di production (server publicly accessible), webhook akan otomatis jalan dan Anda **tidak perlu** manual update lagi.
