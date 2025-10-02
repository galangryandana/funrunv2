# 🧪 Test Webhook Manual - Simulasi Update Status

## Apa Ini?

Endpoint khusus untuk **testing** yang bisa trigger update status tanpa harus:
- Bayar lagi
- Setup ngrok
- Tunggu webhook dari Midtrans

**⚠️ HANYA UNTUK DEVELOPMENT!** Endpoint ini tidak tersedia di production.

---

## Cara Pakai

### Metode 1: Via Browser / Postman

#### Langkah 1: Cari Order ID

Buka Google Sheets, copy Order ID yang mau diupdate.

Contoh: `FUN-RUN-1696146625-123`

#### Langkah 2: Kirim Request

**Menggunakan cURL (Terminal):**
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId":"FUN-RUN-1696146625-123","status":"SUCCESS"}'
```

**Menggunakan Postman:**
- Method: POST
- URL: `http://localhost:3000/api/test-webhook`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "orderId": "FUN-RUN-1696146625-123",
  "status": "SUCCESS"
}
```

#### Langkah 3: Cek Response

Response sukses:
```json
{
  "success": true,
  "message": "Status updated to SUCCESS",
  "orderId": "FUN-RUN-1696146625-123"
}
```

#### Langkah 4: Cek Google Sheets

Refresh Google Sheets → Status harus berubah jadi SUCCESS!

---

### Metode 2: Via Browser Extension (Simple)

Install extension **RESTer** atau **Talend API Tester** di browser.

Atau bisa pakai fetch di browser console (F12):

```javascript
fetch('http://localhost:3000/api/test-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'FUN-RUN-1696146625-123',
    status: 'SUCCESS'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

### Metode 3: Buat UI Test Button (Advanced)

Tambahkan test button di halaman success (development only).

Tapi untuk sekarang, pakai metode 1 atau 2 saja lebih simple.

---

## Parameter

### `orderId` (required)
Order ID yang mau diupdate. Harus sudah ada di Google Sheets.

### `status` (optional)
Status yang mau di-set. Default: `SUCCESS`

**Nilai yang valid:**
- `SUCCESS` - Pembayaran sukses
- `FAILED` - Pembayaran gagal
- `PENDING` - Pending (jarang dipakai untuk test)
- `EXPIRED` - Transaksi expired

---

## Contoh Use Cases

### Update ke SUCCESS
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId":"FUN-RUN-xxx","status":"SUCCESS"}'
```

### Update ke FAILED
```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"orderId":"FUN-RUN-xxx","status":"FAILED"}'
```

### Bulk Update (Via Script)

Buat file `test-update.sh`:
```bash
#!/bin/bash

# List Order IDs
ORDER_IDS=(
  "FUN-RUN-1696146625-123"
  "FUN-RUN-1696146626-456"
  "FUN-RUN-1696146627-789"
)

# Update each
for ORDER_ID in "${ORDER_IDS[@]}"; do
  echo "Updating $ORDER_ID..."
  curl -X POST http://localhost:3000/api/test-webhook \
    -H "Content-Type: application/json" \
    -d "{\"orderId\":\"$ORDER_ID\",\"status\":\"SUCCESS\"}"
  echo ""
done

echo "Done!"
```

Jalankan:
```bash
chmod +x test-update.sh
./test-update.sh
```

---

## Monitoring

### Cek Terminal Next.js

Akan muncul log:
```
[TEST] Manually updating status: FUN-RUN-xxx -> SUCCESS
Google Sheets updated: FUN-RUN-xxx - SUCCESS
[TEST] Successfully updated: FUN-RUN-xxx
```

### Cek Google Sheets

Refresh sheets, kolom yang berubah:
- Status Pembayaran: SUCCESS
- Payment Date: [timestamp]
- Transaction ID: MANUAL-TEST-[timestamp]
- Payment Type: manual_test
- Updated At: [timestamp]

---

## Troubleshooting

### Error: "orderId is required"
→ Pastikan JSON body ada field `orderId`

### Error: "Order ID not found"
→ Order ID tidak ada di Google Sheets, cek lagi

### Error: "Endpoint not available in production"
→ Endpoint ini memang hanya untuk development

### Error: "Failed to update Google Sheets"
→ Cek Apps Script URL di .env.local
→ Test manual di Apps Script Editor

---

## Security Notes

⚠️ **PENTING**:
- Endpoint ini **HANYA untuk development** (NODE_ENV !== 'production')
- Di production, endpoint akan return 403 Forbidden
- Jangan deploy endpoint ini ke production dengan NODE_ENV=development
- Untuk production, gunakan webhook real dari Midtrans

---

## Alternative: Get Info Endpoint

Untuk lihat cara pakai endpoint:

```bash
curl http://localhost:3000/api/test-webhook
```

atau buka di browser: http://localhost:3000/api/test-webhook

---

**Happy testing! 🚀**
