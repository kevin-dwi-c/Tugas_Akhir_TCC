# Aplikasi Bank Darah PMI

Web admin Bank Darah PMI untuk mengelola stok darah, permintaan darurat dari rumah sakit, donor eligible radius 10 KM, broadcast, live response dashboard, QR check-in donor, data pendonor, rumah sakit mitra, dan laporan operasional.

Backend sudah direfactor dari mock Node.js in-memory menjadi REST API Go dengan PostgreSQL/PostGIS sesuai PRD v1.0. Untuk kebutuhan demo lokal, data real-time `emergency_broadcasts` dan `live_responses` yang di PRD direkomendasikan di Firestore disimpan dulu di PostgreSQL agar seluruh stack bisa jalan lewat Docker.

## Stack

Frontend:

- React 18 + TypeScript
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- html5-qrcode

Backend:

- Go 1.22
- Native `net/http`
- PostgreSQL driver `pgx`
- JWT HMAC untuk sesi admin
- PostGIS untuk filter donor radius 10 KM

Database:

- PostgreSQL 15 + PostGIS via Docker
- Migrasi idempotent di `backend/database/migrations/001_init.sql`
- Seed admin, rumah sakit, donor demo, stok darah, request demo, dan riwayat donasi

## Menjalankan Dengan Docker

Pastikan Docker Desktop sudah aktif, lalu dari root project:

```bash
docker compose up --build
```

URL aplikasi:

```text
Frontend: http://127.0.0.1:5173
Backend : http://127.0.0.1:8080/api/v1
Postgres: localhost:5432
```

Login demo:

```text
Username: operator
Password: pmi123
```

Token QR demo untuk check-in manual:

```text
QR-DEMO-001
```

## Menjalankan Manual

Jalankan PostgreSQL/PostGIS sendiri atau gunakan service database dari compose:

```bash
docker compose up postgres
```

Backend:

```bash
cd backend
go run ./cmd/api
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite sudah mem-proxy `/api` ke `http://127.0.0.1:8080`.

## Environment Backend

Contoh konfigurasi ada di `backend/.env.example`.

```text
PORT=8080
DATABASE_URL=postgres://bank_darah:bank_darah@127.0.0.1:5432/bank_darah?sslmode=disable
JWT_SECRET=replace-with-long-random-secret
AUTH_REQUIRED=true
PMI_NAME=PMI Kota Yogyakarta
PMI_LOCATION=UDD PMI Kota Yogyakarta
PMI_LATITUDE=-7.7839
PMI_LONGITUDE=110.3798
ELIGIBLE_RADIUS_KM=10
```

## Endpoint Utama

Base URL:

```text
/api/v1
```

Endpoint:

```text
GET    /health
POST   /auth/admin/login
GET    /stock
PUT    /stock/:bloodType/:productType
GET    /emergency/requests
POST   /emergency/requests
GET    /emergency/requests/:id/eligible-donors
POST   /emergency/requests/:id/broadcast
GET    /emergency/requests/:id/live-responses
GET    /donors
POST   /donors
GET    /donors/:idOrQrToken
PUT    /donors/:id
PUT    /donors/:id/status
POST   /donations/checkin
GET    /hospitals
POST   /hospitals
PUT    /hospitals/:id
```

Semua response memakai envelope:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error"
}
```

## Kesesuaian PRD v1.0

Sudah dicakup:

- FR-A01 dashboard stok darah per golongan dan produk
- FR-A02 input permintaan darurat RS
- FR-A03 filter donor eligible berdasarkan golongan, status, dan radius PostGIS 10 KM
- FR-A04 broadcast darurat dengan rate limit 10 request/menit per admin
- FR-A05 live response dashboard berbasis tabel `live_responses`
- FR-A06 QR check-in donor via token QR
- FR-A07 verifikasi kelaikan medis sederhana
- FR-A08 transaksi tambah/kurang/set stok darah
- FR-A09 CRUD dasar pendonor
- FR-A10 CRUD dasar rumah sakit
- FR-A11 laporan operasional dari data request/stok/donor

Catatan:

- Push notification FCM dan Firestore real-time listener belum diaktifkan; backend menyimpan broadcast dan live response di PostgreSQL sebagai adapter lokal.
- QR token demo belum memakai AES-256-GCM end-to-end mobile karena aplikasi mobile Flutter belum ada di repo ini.
- Field medis sensitif siap dipusatkan di `donation_history`; enkripsi field-level bisa ditambahkan saat key management produksi sudah ditentukan.
