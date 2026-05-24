# Deployment GCP

Dokumen ini mengikuti lampiran PRD untuk target Google Cloud Platform.

## 1. Setup Project

```bash
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable vpcaccess.googleapis.com
gcloud services enable firestore.googleapis.com
```

Region yang direkomendasikan:

```text
asia-southeast2
```

## 2. Artifact Registry

```bash
gcloud artifacts repositories create bank-darah \
  --repository-format=docker \
  --location=asia-southeast2
```

## 3. Cloud SQL PostgreSQL + PostGIS

```bash
gcloud sql instances create bank-darah-postgres \
  --database-version=POSTGRES_15 \
  --region=asia-southeast2 \
  --tier=db-g1-small \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase

gcloud sql databases create bank_darah --instance=bank-darah-postgres
```

Jalankan migrasi:

```bash
psql "$DATABASE_URL" -f backend/database/migrations/001_init.sql
```

## 4. Secret Manager

```bash
printf "change-me" | gcloud secrets create JWT_SECRET --data-file=-
printf "change-me-32-byte-key" | gcloud secrets create QR_ENCRYPTION_KEY --data-file=-
printf "postgres://..." | gcloud secrets create DATABASE_URL --data-file=-
printf "redis://..." | gcloud secrets create REDIS_URL --data-file=-
```

## 5. Deploy Backend

Backend production direkomendasikan memakai modul Go/Node produksi sesuai PRD. Untuk mock API demo ini:

```bash
gcloud builds submit \
  --tag asia-southeast2-docker.pkg.dev/PROJECT_ID/bank-darah/mock-api \
  backend

gcloud run deploy bank-darah-api \
  --image asia-southeast2-docker.pkg.dev/PROJECT_ID/bank-darah/mock-api \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --port 8080
```

## 6. Deploy Web App

Build:

```bash
cd frontend
npm run build
```

Upload ke Cloud Storage:

```bash
gsutil mb -l asia-southeast2 gs://PROJECT_ID-bank-darah-web
gsutil -m rsync -r -d dist gs://PROJECT_ID-bank-darah-web
gsutil web set -m index.html -e index.html gs://PROJECT_ID-bank-darah-web
```

Untuk production, pasang HTTPS Load Balancer + Cloud CDN + Google-managed SSL certificate di depan bucket.

## 7. Monitoring

Minimal alert:

- Cloud Run P95 latency > 500 ms selama 5 menit.
- Cloud Run error rate > 1%.
- Cloud SQL CPU > 80%.
- Redis memory > 80%.
- Uptime check `GET /api/v1/health` setiap 1 menit.
