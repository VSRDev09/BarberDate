CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE services DROP COLUMN IF EXISTS description;

CREATE TABLE IF NOT EXISTS weekly_schedules (
    id BIGSERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_hour TIME NOT NULL,
    end_hour TIME NOT NULL,
    day_off BOOLEAN NOT NULL DEFAULT FALSE,
    released BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_week_day UNIQUE (week_start, day_of_week)
);

CREATE TABLE IF NOT EXISTS available_time_slots (
    id BIGSERIAL PRIMARY KEY,
    weekly_schedule_id BIGINT NOT NULL REFERENCES weekly_schedules (id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_slot_date_time UNIQUE (slot_date, start_time)
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES available_time_slots (id),
    service_id BIGINT NOT NULL REFERENCES services (id),
    client_name VARCHAR(120) NOT NULL,
    client_phone VARCHAR(30) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_appointments_active_slot
    ON appointments (slot_id)
    WHERE status = 'SCHEDULED';

INSERT INTO admins (name, username, password_hash, role, created_at)
SELECT 'Barber Date Admin', 'admin', crypt('admin123', gen_salt('bf', 10)), 'ADMIN', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1
    FROM admins
    WHERE username = 'admin'
);

INSERT INTO services (name, price, duration_minutes, active, display_order)
VALUES
    ('Corte', 25.00, 60, TRUE, 1),
    ('Barba', 15.00, 60, TRUE, 2),
    ('Corte + Barba', 35.00, 60, TRUE, 3),
    ('Pe de cabelo', 15.00, 60, TRUE, 4),
    ('Corte + Pigmentacao', 35.00, 60, TRUE, 5),
    ('Corte + Sobrancelha', 30.00, 60, TRUE, 6)
ON CONFLICT (name) DO NOTHING;
