CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE urgency_level_enum AS ENUM ('CRITICAL', 'URGENT', 'NORMAL');
CREATE TYPE request_status_enum AS ENUM ('PENDING', 'ACTIVE', 'FULFILLED', 'EXPIRED');
CREATE TYPE donation_status_enum AS ENUM ('CHECKED_IN', 'REJECTED', 'COMPLETED');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(15) NOT NULL,
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

CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_blood_type ON users(blood_type);
CREATE INDEX idx_users_eligible ON users(is_eligible, next_eligible);

CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  pic_name VARCHAR(100),
  pic_phone VARCHAR(15),
  email VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES hospitals(id),
  requested_by VARCHAR(100),
  blood_type VARCHAR(3) NOT NULL,
  product_type VARCHAR(15) NOT NULL DEFAULT 'PRC',
  quantity_needed INT NOT NULL CHECK (quantity_needed > 0),
  urgency_level urgency_level_enum NOT NULL DEFAULT 'NORMAL',
  notes TEXT,
  broadcast_id VARCHAR(100),
  status request_status_enum NOT NULL DEFAULT 'PENDING',
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ
);

CREATE TABLE donation_history (
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

CREATE TABLE blood_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_type VARCHAR(3) NOT NULL,
  product_type VARCHAR(15) NOT NULL,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  safe_threshold INT NOT NULL DEFAULT 10,
  critical_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blood_type, product_type)
);

CREATE TABLE stock_transactions (
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
