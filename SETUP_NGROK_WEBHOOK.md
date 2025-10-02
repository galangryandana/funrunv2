# 🌐 Setup Ngrok untuk Testing Webhook

## Apa itu Ngrok?

Ngrok membuat tunnel dari internet ke localhost Anda, sehingga Midtrans bisa kirim webhook notification.

```
Midtrans Server → Internet → Ngrok Tunnel → localhost:3000
```

---

## Langkah Setup Ngrok

### 1. Install Ngrok

**Mac (via Homebrew):**
```bash
brew install ngrok
```

**Windows/Linux:**
Download dari: https://ngrok.com/download

### 2. Sign Up (Free)

1. Buka https://dashboard.ngrok.com/signup
2. Daftar dengan email (gratis)
3. Copy authtoken dari dashboard

### 3. Authenticate Ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Ganti `YOUR_AUTH_TOKEN` dengan token dari dashboard ngrok.

### 4. Jalankan Dev Server

Di terminal pertama:
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/vibecode/fun-run-v2
npm run dev
```

Pastikan server running di http://localhost:3000

### 5. Start Ngrok Tunnel

Di terminal kedua (buka terminal baru):
```bash
ngrok http 3000
```

Output akan seperti ini:
```
ngrok                                                                    

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abcd1234.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy Forwarding URL**: `https://abcd1234.ngrok.io` ← URL ini yang penting!

### 6. Set Webhook URL di Midtrans Dashboard

1. Login ke https://dashboard.midtrans.com/
2. Pastikan di mode **Sandbox** (jika pakai sandbox keys)
3. Pergi ke **Settings** → **Configuration**
4. Di bagian **Payment Notification URL**, masukkan:
   ```
   https://abcd1234.ngrok.io/api/webhook/midtrans
   ```
   Ganti `abcd1234.ngrok.io` dengan URL ngrok Anda

5. **Klik Update Settings**

### 7. Test Payment

1. Buka app Anda: https://abcd1234.ngrok.io (atau tetap pakai localhost:3000)
2. Isi form dan bayar
3. **Monitor terminal ngrok** → akan muncul request webhook
4. **Monitor terminal Next.js** → akan muncul log "Midtrans Notification received"
5. **Cek Google Sheets** → Status harus update jadi SUCCESS

---

## Monitoring Webhook

### Di Ngrok Web Interface

Buka http://127.0.0.1:4040 di browser untuk melihat:
- Semua request yang masuk
- Request body (JSON dari Midtrans)
- Response dari server Anda

### Di Terminal Next.js

Lihat console log:
```
Midtrans Notification received: { orderId: 'FUN-RUN-...', ... }
Transaction status verified: { ... }
Order FUN-RUN-... status: SUCCESS
Google Sheets updated: FUN-RUN-... - SUCCESS
```

Jika ada error, akan muncul di sini.

---

## Troubleshooting

### Issue: "Invalid signature from Midtrans"

**Penyebab**: Server key tidak match dengan environment (sandbox vs production)

**Solusi**: 
- Pastikan di dashboard cek mode yang sama (sandbox atau production)
- Pastikan `.env.local` pakai keys yang sesuai

---

### Issue: "Failed to update Google Sheets"

**Penyebab**: Apps Script URL salah atau error

**Solusi**:
1. Cek `.env.local`, pastikan `APPS_SCRIPT_ENTRYPOINT` benar
2. Test Apps Script manual (run testUpdateStatus)
3. Cek Apps Script Executions log (View → Executions)

---

### Issue: Ngrok URL berubah setiap restart

**Solusi**:
- **Free plan**: URL berubah setiap restart (normal)
- Setiap kali restart ngrok, update webhook URL di Midtrans dashboard
- **Paid plan**: Bisa reserve fixed domain

---

## Tips

1. **Jangan close terminal ngrok** saat testing
2. **Update webhook URL di Midtrans** setiap kali ngrok restart (free plan)
3. **Monitor ngrok web interface** (127.0.0.1:4040) untuk debug
4. **Clear webhook URL** di Midtrans saat selesai testing (optional)

---

## Kapan Pakai Ngrok?

✅ **Pakai ngrok jika**:
- Ingin test full flow (termasuk webhook)
- Ingin test notification dari Midtrans
- Debugging webhook issues

❌ **Tidak perlu ngrok jika**:
- Hanya test frontend/form
- Test payment UI saja
- Sudah deploy ke server production

---

## Production

Di production (deployed ke server dengan domain public), **TIDAK PERLU ngrok**.

Webhook URL di production:
```
https://yourdomain.com/api/webhook/midtrans
```

Set langsung di Midtrans dashboard production settings.

---

**Selamat mencoba! 🚀**
