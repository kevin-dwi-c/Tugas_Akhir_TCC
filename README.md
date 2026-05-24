# Aplikasi Bank Darah PMI

Aplikasi Bank Darah PMI adalah web admin lokal untuk mengelola stok darah, permintaan darah darurat dari rumah sakit, daftar pendonor, check-in donor QR, dan monitoring respons donor. Project ini dibuat sebagai aplikasi demo tugas akhir TCC dengan frontend React + TypeScript dan backend mock REST API Node.js.

Project ini masih berjalan lokal. Belum ada konfigurasi hosting atau deployment cloud di repository ini.

## Tujuan Aplikasi

Aplikasi ini membantu petugas/admin PMI dalam simulasi alur operasional bank darah:

- Melihat stok darah berdasarkan golongan darah dan jenis produk.
- Menandai stok yang aman, menipis, atau kritis.
- Membuat permintaan darah darurat dari rumah sakit.
- Mencari donor eligible sesuai golongan darah dan radius simulasi.
- Mengirim broadcast darurat ke donor eligible.
- Memantau respons donor secara live.
- Melakukan check-in donor dengan QR atau token manual.
- Memverifikasi kondisi medis donor sebelum donor diterima.
- Mengelola data pendonor dan rumah sakit mitra.
- Melihat rekap/laporan operasional sederhana.

## Teknologi

Frontend:

- React 18
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- Lucide React
- html5-qrcode

Backend:

- Node.js
- Native HTTP server
- REST API lokal dengan prefix `/api/v1`
- Data mock in-memory
- Struktur MVC sederhana

Database:

- Belum memakai database runtime.
- Folder `backend/database/migrations` berisi rancangan awal skema SQL.
- Data aplikasi saat ini berasal dari seed mock di backend dan akan kembali ke data awal saat server di-restart.

## Struktur Folder

```text
tugas akhir praktikum/
  README.md
  .gitignore
  index.js
  backend/
    package.json
    server.js
    Dockerfile
    .env.example
    database/
      migrations/
        001_init.sql
    src/
      app.js
      config/
        appConfig.js
      controllers/
        authController.js
        donationController.js
        donorController.js
        emergencyController.js
        healthController.js
        hospitalController.js
        stockController.js
      models/
        adminModel.js
        dataStore.js
        donationModel.js
        donorFactory.js
        donorModel.js
        emergencyRequestModel.js
        hospitalModel.js
        stockModel.js
      routes/
        apiRoutes.js
      utils/
        date.js
        httpResponse.js
        id.js
        requestBody.js
  frontend/
    package.json
    package-lock.json
    index.html
    vite.config.ts
    tsconfig.json
    tailwind.config.js
    postcss.config.js
    Dockerfile
    .env.example
    src/
      App.tsx
      main.tsx
      styles.css
      controllers/
        AppRoutes.tsx
        bankDarahController.ts
      models/
        apiClient.ts
        authStore.ts
        status.ts
        types.ts
      views/
        components/
        layout/
        pages/
```

## Pola MVC

Backend memakai pola MVC agar kode lebih mudah dirawat:

- `routes`: menentukan endpoint API dan mengarahkan request ke controller.
- `controllers`: membaca request, memanggil model, lalu mengirim response.
- `models`: menyimpan data mock dan fungsi domain seperti donor, stok, rumah sakit, emergency request, dan check-in.
- `utils`: helper umum untuk response JSON, parsing body, tanggal, dan ID.
- `config`: konfigurasi port, host, CORS, dan prefix API.

Frontend juga disusun mendekati MVC:

- `models`: tipe data, state auth, status helper, dan API client.
- `controllers`: route aplikasi dan controller akses data.
- `views`: tampilan halaman, layout, dan komponen UI.

## Fitur Frontend

### Login Admin

Admin dapat login menggunakan akun demo:

```text
Username: operator
Password: pmi123
```

Setelah login, token mock disimpan di state frontend dan dikirim ke backend lewat header Authorization.

### Dashboard

Dashboard menampilkan:

- Total kantong darah.
- Jumlah stok kritis.
- Jumlah stok menipis.
- Jumlah request aktif.
- Kartu stok per golongan darah.
- Tabel permintaan darah terbaru.

### Permintaan Darurat

Admin dapat membuat request darah darurat dengan data:

- Nama rumah sakit.
- Nama PIC.
- Nomor kontak.
- Golongan darah.
- Jenis produk darah.
- Jumlah kantong.
- Tingkat urgensi.
- Catatan kebutuhan.

Setelah request dibuat, aplikasi menampilkan daftar donor eligible.

### Broadcast Donor

Halaman broadcast menampilkan donor yang cocok berdasarkan:

- Golongan darah.
- Status eligible.
- Status akun aktif.
- Radius simulasi maksimal 10 KM.

Backend mock menerapkan rate limit broadcast 10 kali per menit.

### Monitor Respons

Halaman monitor menampilkan respons donor secara otomatis setiap beberapa detik:

- Siap donor.
- Menuju PMI.
- Check-in.
- Tidak bisa.

Data respons masih berupa simulasi dari backend mock.

### Check-in QR Donor

Check-in donor dapat dilakukan dengan kamera QR scanner atau token manual.

Token demo:

```text
QR-DEMO-001
```

Setelah donor ditemukan, admin dapat mengisi verifikasi medis:

- Sistolik.
- Diastolik.
- Hemoglobin.
- Berat badan.
- Referensi request.

Backend akan menentukan apakah donor lolos berdasarkan aturan sederhana.

### Manajemen Pendonor

Halaman pendonor menyediakan:

- Pencarian donor.
- Tambah donor.
- Lihat detail donor.
- Aktif/nonaktifkan donor.
- Riwayat donasi donor.

### Manajemen Rumah Sakit

Halaman rumah sakit menyediakan:

- Daftar rumah sakit mitra.
- Tambah rumah sakit.
- Informasi PIC rumah sakit.
- Status rumah sakit aktif/nonaktif.

### Laporan

Halaman laporan menampilkan rekap sederhana:

- Total stok.
- Stok kritis.
- Request aktif.
- Donor eligible.
- Tabel permintaan darurat.
- Tabel ringkasan stok.

## Endpoint Backend Lokal

Base URL backend:

```text
http://127.0.0.1:8080/api/v1
```

Endpoint utama:

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
GET    /donors/:idOrUuid
PUT    /donors/:id
PUT    /donors/:id/status
POST   /donations/checkin
GET    /hospitals
POST   /hospitals
PUT    /hospitals/:id
```

Semua response API memakai format umum:

```json
{
  "success": true,
  "data": {}
}
```

Jika error:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Pesan error"
}
```

## Cara Menjalankan Project

Pastikan Node.js dan npm sudah terpasang.

Install dependency frontend dari folder root project:

```bash
cd frontend
npm install
```

Kembali ke root lalu install dependency backend. Backend saat ini tidak membutuhkan dependency tambahan, tetapi command ini aman dijalankan jika nanti dependency backend ditambahkan:

```bash
cd ..
cd backend
npm install
```

Kembali ke folder root project:

```bash
cd ..
```

Jalankan backend dan frontend sekaligus:

```bash
node index.js
```

URL aplikasi:

```text
Frontend: http://127.0.0.1:5173
Backend : http://127.0.0.1:8080/api/v1
```

## Cara Menjalankan Manual

Terminal 1 untuk backend:

```bash
cd backend
npm run dev
```

Terminal 2 untuk frontend:

```bash
cd frontend
npm run dev
```

Buka frontend di browser:

```text
http://127.0.0.1:5173
```

## Build Frontend

Untuk mengecek apakah frontend siap di-build:

```bash
cd frontend
npm run build
```

Hasil build akan masuk ke folder:

```text
frontend/dist
```

Folder `dist` tidak perlu dipush ke GitHub karena bisa dibuat ulang dari source.

## File yang Tidak Dipush

Repository memakai `.gitignore` agar file lokal/generated tidak ikut ke GitHub:

- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `.env`
- file log
- cache
- `*.tsbuildinfo`
- PDF lokal di folder `requirements/`

Catatan: `node_modules` tetap boleh ada di komputer lokal untuk menjalankan aplikasi, tetapi tidak perlu dipush karena ukurannya besar dan bisa dibuat ulang dengan `npm install`.

## Catatan Pengembangan

Project ini masih versi lokal/demo. Beberapa hal yang perlu diperhatikan:

- Data backend masih in-memory, jadi data berubah akan hilang saat server restart.
- Belum ada autentikasi produksi.
- Token login masih mock.
- Broadcast donor masih simulasi.
- Live response donor masih simulasi.
- Database SQL belum dihubungkan ke backend runtime.
- Belum ada hosting/deployment cloud.

## Rekomendasi Pengembangan Berikutnya

- Hubungkan backend ke database sungguhan.
- Tambahkan validasi request yang lebih ketat.
- Tambahkan autentikasi dan otorisasi produksi.
- Tambahkan fitur edit/hapus untuk data donor dan rumah sakit.
- Tambahkan riwayat transaksi stok yang bisa dilihat dari frontend.
- Tambahkan test backend dan frontend.
- Tambahkan konfigurasi deployment setelah aplikasi siap dihosting.
