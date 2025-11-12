-- =========================================
-- ENUM TYPES
-- =========================================
CREATE TYPE progression_status AS ENUM ('pending', 'rejected', 'in_progress', 'completed', 'deleted');
CREATE TYPE property_status AS ENUM ('found', 'not found', 'deleted');
CREATE TYPE gender AS ENUM ('male', 'female');
CREATE TYPE role AS ENUM ('tenant', 'admin');
CREATE TYPE billing_status AS ENUM ('unpaid', 'paid', 'deleted');

-- =========================================
-- BUILDINGS
-- =========================================
CREATE TABLE buildings (
    building_id SERIAL PRIMARY KEY,
    building_name TEXT NOT NULL
);

-- =========================================
-- APARTMENTS
-- n-1 buildings
-- 1-n users
-- =========================================
CREATE TABLE apartments (
    apartment_id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES buildings(building_id) ON DELETE CASCADE,
    floor INT NOT NULL,
    apartment_number INT NOT NULL,
    monthly_fee INT NOT NULL
);

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role role DEFAULT 'tenant',
    year_of_birth INT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender gender,
    apartment_id INT REFERENCES apartments(apartment_id) ON DELETE SET NULL
);

-- =========================================
-- SERVICES
-- =========================================
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    tax INT NOT NULL
);

-- =========================================
-- PROPERTIES
-- n-1 users if is_public = true, null if not
-- =========================================
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    property_name TEXT NOT NULL,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE
);

-- =========================================
-- VEHICLES
-- 1-1 properties (each vehicle belongs to exactly one property)
-- =========================================
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    property_id INT UNIQUE REFERENCES properties(property_id) ON DELETE CASCADE,
    license_plate TEXT UNIQUE NOT NULL
);

-- =========================================
-- VEHICLE_LOGS
-- Track vehicle entrance and exit times
-- =========================================
CREATE TABLE vehicle_logs (
    vehicle_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    entrance_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP
);

-- =========================================
-- BILLINGS
-- n-n services, n-n users (track when a user uses services)
-- =========================================
CREATE TABLE billings (
    billing_id TEXT NOT NULL,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    billing_status billing_status DEFAULT 'unpaid'
);

-- =========================================
-- MAINTENANCE_LOGS
-- Similar to service_logs, with approved boolean
-- =========================================
CREATE TABLE maintenance_logs (
    maintenance_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status progression_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE property_reports (
    property_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(property_id) ON DELETE CASCADE,
    status property_status DEFAULT 'not found',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issuer_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_status property_status,
    approved BOOLEAN DEFAULT FALSE,
    content TEXT
);

-- =========================================
-- POSTS
-- =========================================
CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
