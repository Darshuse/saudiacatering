-- Warathah initial schema
-- V1: Users and inheritance cases

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE inheritance_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    madhhab VARCHAR(50) NOT NULL,
    deceased_is_male BOOLEAN NOT NULL DEFAULT TRUE,
    gross_estate NUMERIC(20, 4) NOT NULL DEFAULT 0,
    debts NUMERIC(20, 4) NOT NULL DEFAULT 0,
    funeral_costs NUMERIC(20, 4) NOT NULL DEFAULT 0,
    wasiyya NUMERIC(20, 4) NOT NULL DEFAULT 0,
    net_estate NUMERIC(20, 4),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    result_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inheritance_cases_user_id ON inheritance_cases(user_id);
CREATE INDEX idx_inheritance_cases_status ON inheritance_cases(status);
