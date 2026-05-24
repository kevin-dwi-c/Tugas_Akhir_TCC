# API Contract Ringkas

Base URL lokal:

```text
/api/v1
```

Semua response sukses memakai envelope:

```json
{
  "success": true,
  "data": {}
}
```

Response error:

```json
{
  "success": false,
  "code": "REQUEST_NOT_FOUND",
  "message": "Permintaan tidak ditemukan."
}
```

## Auth

`POST /auth/admin/login`

Body:

```json
{
  "username": "operator",
  "password": "pmi123"
}
```

## Stock

- `GET /stock`
- `PUT /stock/:blood_type/:product_type`

Body update stok:

```json
{
  "mode": "add",
  "quantity": 3,
  "reference": "request-001"
}
```

`mode`: `add`, `subtract`, atau `set`.

## Emergency

- `GET /emergency/requests`
- `POST /emergency/requests`
- `GET /emergency/requests/:id/eligible-donors`
- `POST /emergency/requests/:id/broadcast`
- `GET /emergency/requests/:id/live-responses`

Body request emergency:

```json
{
  "hospitalName": "RS Bethesda Yogyakarta",
  "picName": "dr. Nadya",
  "picPhone": "+628123450011",
  "bloodType": "O-",
  "productType": "PRC",
  "quantityNeeded": 3,
  "urgencyLevel": "CRITICAL",
  "notes": "Perdarahan pascaoperasi"
}
```

## Donor

- `GET /donors?search=rian`
- `GET /donors/:uuid`
- `POST /donors`
- `PUT /donors/:id`
- `PUT /donors/:id/status`

## Donation

`POST /donations/checkin`

Body:

```json
{
  "donorUuid": "QR-DEMO-001",
  "requestId": "request-001",
  "systolic": 122,
  "diastolic": 80,
  "hemoglobin": 13.4,
  "weight": 62
}
```

Validasi mock mengikuti PRD:

- Hemoglobin minimal 12.5 g/dL untuk perempuan.
- Hemoglobin minimal 13.0 g/dL untuk laki-laki.
- Sistolik 100-170 mmHg.
- Diastolik 70-100 mmHg.
- Berat minimal 45 kg.
- Donor harus aktif dan eligible.

## Hospital

- `GET /hospitals`
- `POST /hospitals`
- `PUT /hospitals/:id`
