# Aplikasi Bank Darah PMI

Web Admin PMI untuk project akhir TCC berdasarkan lampiran PRD dan Prompt Kit Aplikasi Bank Darah v1.0. Aplikasi ini dibuat sebagai demo runnable: React + TypeScript untuk admin web, serta mock REST API lokal sesuai kontrak `/api/v1` agar alur utama bisa dicoba tanpa menunggu backend produksi.

## Fitur yang Sudah Dibuat

- Login admin dengan sesi JWT mock dan cookie `HttpOnly`.
- Dashboard stok darah per golongan dan produk: `WB`, `PRC`, `FFP`, `THROMBOCYTE`.
- Indikator stok Aman, Menipis, Kritis berdasarkan threshold.
- Form permintaan darah darurat dari rumah sakit.
- Review donor eligible berdasarkan golongan darah, status eligible, status aktif, dan radius simulasi 10 KM.
- Broadcast emergency dengan rate limit 10 kali per menit.
- Live response dashboard auto-update untuk status donor.
- QR scanner check-in donor memakai `html5-qrcode` dengan fallback token manual.
- Form verifikasi medis: tekanan darah, hemoglobin, berat badan, dan jeda donor.
- Input/update stok darah dengan log transaksi di mock API.
- CRUD ringan pendonor dan rumah sakit.
- Riwayat emergency dan export CSV laporan.

## Akun Demo

```text
Username: operator
Password: pmi123
```

Token QR demo untuk check-in:

```text
QR-DEMO-001
```

## Struktur Folder Baru

```text
tugas akhir praktikum/
  index.js                  Runner untuk backend dan frontend
  backend/
    server.js               Mock REST API /api/v1
    package.json
    database/migrations/    Skema SQL PostgreSQL/PostGIS
    docs/                   API contract, deployment, dan lampiran PRD
  frontend/
    src/                    React + TypeScript Web Admin PMI
    package.json
    vite.config.ts
    Dockerfile
```

## Cara Menjalankan Lokal dari Folder Induk

Masuk ke folder:

```bash
cd "tugas akhir praktikum"
```

Jalankan backend dan frontend sekaligus:

```bash
node index.js
```

## Cara Menjalankan Manual

Backend:

```bash
cd "tugas akhir praktikum/backend"
npm install
npm run dev
```

Frontend:

```bash
cd "tugas akhir praktikum/frontend"
npm install
npm run dev
```

Buka:

```text
http://127.0.0.1:5173
```

API lokal:

```text
http://127.0.0.1:8080/api/v1
```

## Alur Demo Cepat

1. Login sebagai `operator`.
2. Buka Dashboard untuk melihat status stok darah.
3. Klik `Permintaan Baru`, simpan request emergency.
4. Review donor eligible, lalu klik `Kirim Broadcast`.
5. Lihat halaman monitor untuk live response donor.
6. Buka `Check-in QR`, pakai token `QR-DEMO-001`, isi verifikasi medis, lalu konfirmasi.
7. Buka `Laporan`, export CSV riwayat emergency.

## Build Produksi

```bash
cd "tugas akhir praktikum/frontend"
npm run build
```

Output frontend ada di folder `frontend/dist/`.

## Catatan Implementasi

Mock API memakai data in-memory, sehingga data kembali ke seed awal saat server di-restart. Untuk production, ganti `backend/server.js` dengan backend Go/Node yang memakai PostgreSQL + PostGIS, Redis, Firestore, dan FCM sesuai PRD.
