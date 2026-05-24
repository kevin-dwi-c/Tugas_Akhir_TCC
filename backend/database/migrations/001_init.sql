CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level_enum') THEN
    CREATE TYPE urgency_level_enum AS ENUM ('CRITICAL', 'URGENT', 'NORMAL');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status_enum') THEN
    CREATE TYPE request_status_enum AS ENUM ('PENDING', 'ACTIVE', 'FULFILLED', 'EXPIRED', 'CLOSED');
  END IF;
END $$;

ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'CLOSED';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status_enum') THEN
    CREATE TYPE donation_status_enum AS ENUM ('CHECKED_IN', 'REJECTED', 'COMPLETED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'response_status_enum') THEN
    CREATE TYPE response_status_enum AS ENUM ('ACCEPTED', 'ON_THE_WAY', 'DECLINED', 'CHECKED_IN', 'NO_RESPONSE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  blood_type VARCHAR(3) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  birth_date DATE NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  address TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  photo_url VARCHAR(500),
  device_token VARCHAR(500),
  last_donation DATE,
  next_eligible DATE GENERATED ALWAYS AS (last_donation + INTERVAL '60 days') STORED,
  is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_token VARCHAR(100);
UPDATE users SET qr_token = 'QR-' || UPPER(SUBSTRING(id::TEXT, 1, 8)) WHERE qr_token IS NULL;
ALTER TABLE users ALTER COLUMN qr_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_qr_token ON users(qr_token);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_users_blood_type ON users(blood_type);
CREATE INDEX IF NOT EXISTS idx_users_eligible ON users(is_eligible, next_eligible);

CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  pic_name VARCHAR(100),
  pic_phone VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id),
  requested_by VARCHAR(100),
  blood_type VARCHAR(3) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  product_type VARCHAR(15) NOT NULL DEFAULT 'PRC' CHECK (product_type IN ('WB', 'PRC', 'FFP', 'THROMBOCYTE')),
  quantity_needed INT NOT NULL CHECK (quantity_needed > 0),
  urgency_level urgency_level_enum NOT NULL DEFAULT 'NORMAL',
  notes TEXT,
  broadcast_id VARCHAR(100),
  broadcast_sent_at TIMESTAMPTZ,
  eligible_count INT NOT NULL DEFAULT 0,
  status request_status_enum NOT NULL DEFAULT 'PENDING',
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS broadcast_sent_at TIMESTAMPTZ;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS eligible_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES users(id) NOT NULL,
  request_id UUID REFERENCES blood_requests(id),
  donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pmi_location VARCHAR(200),
  blood_pressure VARCHAR(20),
  hemoglobin DECIMAL(4,1),
  weight DECIMAL(5,2),
  volume_ml INT DEFAULT 350,
  is_eligible BOOLEAN,
  disqualify_reason TEXT,
  status donation_status_enum NOT NULL DEFAULT 'CHECKED_IN',
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type VARCHAR(3) NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  product_type VARCHAR(15) NOT NULL CHECK (product_type IN ('WB', 'PRC', 'FFP', 'THROMBOCYTE')),
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  safe_threshold INT NOT NULL DEFAULT 10,
  critical_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blood_type, product_type)
);

CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type VARCHAR(3) NOT NULL,
  product_type VARCHAR(15) NOT NULL,
  quantity INT NOT NULL,
  mode VARCHAR(20) NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id VARCHAR(100) UNIQUE NOT NULL,
  request_id UUID REFERENCES blood_requests(id) NOT NULL,
  blood_type VARCHAR(3) NOT NULL,
  urgency_level urgency_level_enum NOT NULL,
  message_title VARCHAR(200) NOT NULL,
  message_body TEXT NOT NULL,
  eligible_count INT NOT NULL DEFAULT 0,
  responded_count INT NOT NULL DEFAULT 0,
  accepted_count INT NOT NULL DEFAULT 0,
  checkedin_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS live_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id VARCHAR(100) NOT NULL REFERENCES emergency_broadcasts(broadcast_id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(id) NOT NULL,
  donor_id UUID REFERENCES users(id) NOT NULL,
  donor_name VARCHAR(100) NOT NULL,
  donor_blood VARCHAR(3) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL DEFAULT 0,
  status response_status_enum NOT NULL DEFAULT 'NO_RESPONSE',
  response_at TIMESTAMPTZ,
  checkin_at TIMESTAMPTZ,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (broadcast_id, donor_id)
);

CREATE INDEX IF NOT EXISTS idx_live_responses_request ON live_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_live_responses_status ON live_responses(status);

INSERT INTO admin_users (id, username, password_hash, full_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'operator', 'sha256$860743b7c35f021f6e2da05908428aa77a3be91b019ae6691bf579152858ac13', 'Sari Wulandari', 'OPERATOR'),
  ('22222222-2222-2222-2222-222222222222', 'superadmin', 'sha256$860743b7c35f021f6e2da05908428aa77a3be91b019ae6691bf579152858ac13', 'Bima Prasetyo', 'SUPER_ADMIN')
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = TRUE;

INSERT INTO hospitals (id, name, address, latitude, longitude, pic_name, pic_phone, email)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'RS Bethesda Yogyakarta', 'Jl. Jend. Sudirman No.70, Yogyakarta', -7.78390000, 110.37980000, 'dr. Nadya', '+628123450011', 'igd@bethesda.example'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'RSUP Dr. Sardjito', 'Jl. Kesehatan No.1, Sleman', -7.76870000, 110.37340000, 'dr. Arif', '+628123450022', 'igd@sardjito.example'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'RS Panti Rapih', 'Jl. Cik Di Tiro No.30, Yogyakarta', -7.77660000, 110.37660000, 'Ners Ratih', '+628123450033', 'emergency@pantirapih.example')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, qr_token, nik, full_name, email, phone, blood_type, birth_date, gender, address, latitude, longitude, location, last_donation, is_eligible)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001', 'QR-DEMO-001', '3404010101900001', 'Rian Adi Pratama', 'rian@example.test', '+6281234567890', 'O-', '1990-01-01', 'M', 'Condongcatur, Sleman', -7.76350000, 110.38900000, ST_SetSRID(ST_MakePoint(110.38900000, -7.76350000), 4326)::geography, '2026-02-20', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002', 'QR-DEMO-002', '3404010101900002', 'Maya Lestari', 'maya@example.test', '+6281234567891', 'O-', '1992-03-12', 'F', 'Kotabaru, Yogyakarta', -7.79000000, 110.40700000, ST_SetSRID(ST_MakePoint(110.40700000, -7.79000000), 4326)::geography, '2026-01-28', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003', 'QR-DEMO-003', '3404010101900003', 'Bagas Wiratama', 'bagas@example.test', '+6281234567892', 'A+', '1989-07-19', 'M', 'Gamping, Sleman', -7.79200000, 110.33400000, ST_SetSRID(ST_MakePoint(110.33400000, -7.79200000), 4326)::geography, '2026-03-04', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004', 'QR-DEMO-004', '3404010101900004', 'Dewi Kartika', 'dewi@example.test', '+6281234567893', 'AB-', '1994-11-08', 'F', 'Demangan, Yogyakarta', -7.78200000, 110.40300000, ST_SetSRID(ST_MakePoint(110.40300000, -7.78200000), 4326)::geography, '2026-04-10', FALSE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb005', 'QR-DEMO-005', '3404010101900005', 'Fajar Nugroho', 'fajar@example.test', '+6281234567894', 'O-', '1988-05-21', 'M', 'Bantul', -7.84400000, 110.33000000, ST_SetSRID(ST_MakePoint(110.33000000, -7.84400000), 4326)::geography, '2026-02-11', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb006', 'QR-DEMO-006', '3404010101900006', 'Intan Puspita', 'intan@example.test', '+6281234567895', 'B+', '1995-02-02', 'F', 'Mlati, Sleman', -7.75000000, 110.36500000, ST_SetSRID(ST_MakePoint(110.36500000, -7.75000000), 4326)::geography, '2025-12-28', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb007', 'QR-DEMO-007', '3404010101900007', 'Yoga Saputra', 'yoga@example.test', '+6281234567896', 'A-', '1991-06-17', 'M', 'Kasihan, Bantul', -7.82300000, 110.34500000, ST_SetSRID(ST_MakePoint(110.34500000, -7.82300000), 4326)::geography, '2026-02-05', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb008', 'QR-DEMO-008', '3404010101900008', 'Laras Ayuning', 'laras@example.test', '+6281234567897', 'O-', '1997-09-13', 'F', 'Pakem, Sleman', -7.68000000, 110.42000000, ST_SetSRID(ST_MakePoint(110.42000000, -7.68000000), 4326)::geography, '2026-01-10', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb009', 'QR-DEMO-009', '3404010101900009', 'Tegar Mahendra', 'tegar@example.test', '+6281234567898', 'AB+', '1987-12-30', 'M', 'Wirobrajan, Yogyakarta', -7.80900000, 110.35700000, ST_SetSRID(ST_MakePoint(110.35700000, -7.80900000), 4326)::geography, '2026-01-14', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb010', 'QR-DEMO-010', '3404010101900010', 'Nabila Salsabila', 'nabila@example.test', '+6281234567899', 'O+', '1999-04-10', 'F', 'Umbulharjo, Yogyakarta', -7.81500000, 110.39000000, ST_SetSRID(ST_MakePoint(110.39000000, -7.81500000), 4326)::geography, '2026-03-18', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb011', 'QR-DEMO-011', '3404010101900011', 'Raka Putra', 'raka@example.test', '+6281234567800', 'B-', '1993-01-09', 'M', 'Kaliurang, Sleman', -7.72000000, 110.38200000, ST_SetSRID(ST_MakePoint(110.38200000, -7.72000000), 4326)::geography, '2026-01-25', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb012', 'QR-DEMO-012', '3404010101900012', 'Sinta Maharani', 'sinta@example.test', '+6281234567801', 'A+', '1996-08-14', 'F', 'Sewon, Bantul', -7.84600000, 110.36000000, ST_SetSRID(ST_MakePoint(110.36000000, -7.84600000), 4326)::geography, '2026-04-20', FALSE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb013', 'QR-DEMO-013', '3404010101900013', 'Adit Kusuma', 'adit@example.test', '+6281234567802', 'O-', '1990-10-22', 'M', 'Godean, Sleman', -7.77200000, 110.31400000, ST_SetSRID(ST_MakePoint(110.31400000, -7.77200000), 4326)::geography, '2025-12-30', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb014', 'QR-DEMO-014', '3404010101900014', 'Putri Anjani', 'putri@example.test', '+6281234567803', 'O-', '1998-03-25', 'F', 'Ngaglik, Sleman', -7.74200000, 110.40700000, ST_SetSRID(ST_MakePoint(110.40700000, -7.74200000), 4326)::geography, '2026-01-07', TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb015', 'QR-DEMO-015', '3404010101900015', 'Dimas Arya', 'dimas@example.test', '+6281234567804', 'A-', '1991-04-27', 'M', 'Kraton, Yogyakarta', -7.80500000, 110.36400000, ST_SetSRID(ST_MakePoint(110.36400000, -7.80500000), 4326)::geography, '2026-02-16', TRUE)
ON CONFLICT (nik) DO NOTHING;

UPDATE users
SET location = ST_SetSRID(ST_MakePoint(longitude::DOUBLE PRECISION, latitude::DOUBLE PRECISION), 4326)::geography
WHERE location IS NULL;

WITH seed_stock(blood_type, product_type, quantity, safe_threshold, critical_threshold) AS (
  VALUES
    ('A+', 'WB', 20, 10, 3), ('A+', 'PRC', 16, 10, 3), ('A+', 'FFP', 14, 10, 3), ('A+', 'THROMBOCYTE', 12, 6, 2),
    ('A-', 'WB', 13, 10, 3), ('A-', 'PRC', 9, 10, 3), ('A-', 'FFP', 7, 10, 3), ('A-', 'THROMBOCYTE', 5, 6, 2),
    ('B+', 'WB', 8, 10, 3), ('B+', 'PRC', 4, 10, 3), ('B+', 'FFP', 2, 10, 3), ('B+', 'THROMBOCYTE', 0, 6, 2),
    ('B-', 'WB', 6, 10, 3), ('B-', 'PRC', 2, 10, 3), ('B-', 'FFP', 0, 10, 3), ('B-', 'THROMBOCYTE', 0, 6, 2),
    ('O+', 'WB', 25, 10, 3), ('O+', 'PRC', 21, 10, 3), ('O+', 'FFP', 19, 10, 3), ('O+', 'THROMBOCYTE', 17, 6, 2),
    ('O-', 'WB', 7, 10, 3), ('O-', 'PRC', 3, 10, 3), ('O-', 'FFP', 1, 10, 3), ('O-', 'THROMBOCYTE', 0, 6, 2),
    ('AB+', 'WB', 16, 10, 3), ('AB+', 'PRC', 12, 10, 3), ('AB+', 'FFP', 10, 10, 3), ('AB+', 'THROMBOCYTE', 8, 6, 2),
    ('AB-', 'WB', 11, 10, 3), ('AB-', 'PRC', 7, 10, 3), ('AB-', 'FFP', 5, 10, 3), ('AB-', 'THROMBOCYTE', 3, 6, 2)
)
INSERT INTO blood_stock (blood_type, product_type, quantity, safe_threshold, critical_threshold)
SELECT blood_type, product_type, quantity, safe_threshold, critical_threshold
FROM seed_stock
ON CONFLICT (blood_type, product_type) DO NOTHING;

INSERT INTO blood_requests (id, hospital_id, requested_by, blood_type, product_type, quantity_needed, urgency_level, notes, status, eligible_count, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'dr. Nadya', 'O-', 'PRC', 3, 'CRITICAL', 'Perdarahan pascaoperasi, butuh donor secepatnya.', 'PENDING', 5, NOW() - INTERVAL '18 minutes'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'dr. Arif', 'A-', 'WB', 2, 'URGENT', 'Persiapan operasi emergensi malam ini.', 'ACTIVE', 2, NOW() - INTERVAL '42 minutes')
ON CONFLICT (id) DO NOTHING;

UPDATE blood_requests
SET broadcast_id = 'broadcast-cccccccc-cccc-cccc-cccc-ccccccccccc2',
    broadcast_sent_at = NOW() - INTERVAL '25 seconds'
WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc2' AND broadcast_id IS NULL;

INSERT INTO emergency_broadcasts (broadcast_id, request_id, blood_type, urgency_level, message_title, message_body, eligible_count, created_at)
VALUES (
  'broadcast-cccccccc-cccc-cccc-cccc-ccccccccccc2',
  'cccccccc-cccc-cccc-cccc-ccccccccccc2',
  'A-',
  'URGENT',
  'URGENT: Butuh Donor A-',
  'PMI Kota membutuhkan 2 kantong A- untuk RSUP Dr. Sardjito.',
  2,
  NOW() - INTERVAL '25 seconds'
)
ON CONFLICT (broadcast_id) DO NOTHING;

INSERT INTO live_responses (broadcast_id, request_id, donor_id, donor_name, donor_blood, distance_km, status)
SELECT
  'broadcast-cccccccc-cccc-cccc-cccc-ccccccccccc2',
  'cccccccc-cccc-cccc-cccc-ccccccccccc2',
  u.id,
  u.full_name,
  u.blood_type,
  ROUND((ST_Distance(u.location, ST_SetSRID(ST_MakePoint(110.37980000, -7.78390000), 4326)::geography) / 1000)::NUMERIC, 1),
  'NO_RESPONSE'
FROM users u
WHERE u.blood_type = 'A-' AND u.is_active = TRUE
ON CONFLICT (broadcast_id, donor_id) DO NOTHING;

INSERT INTO donation_history (donor_id, donation_date, pmi_location, blood_pressure, hemoglobin, weight, is_eligible, status)
SELECT id, last_donation, 'UDD PMI Kota Yogyakarta', '120/80', 13.4, 62.0, TRUE, 'COMPLETED'
FROM users
WHERE last_donation IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM donation_history dh
    WHERE dh.donor_id = users.id AND dh.donation_date = users.last_donation
  );
