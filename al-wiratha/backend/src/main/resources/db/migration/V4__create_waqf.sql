-- Waqf entities (mosques and awqaf)
CREATE TABLE waqf_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    entity_type VARCHAR(20) NOT NULL DEFAULT 'MOSQUE' CHECK (entity_type IN ('MOSQUE','WAQF','CHARITY')),
    description TEXT,
    location VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'SA',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    admin_user_id UUID REFERENCES users(id),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    logo_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donation campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waqf_id UUID NOT NULL REFERENCES waqf_entities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(30) CHECK (campaign_type IN ('CONSTRUCTION','MAINTENANCE','EQUIPMENT','OPERATIONAL','OTHER')),
    goal_amount NUMERIC(18,2) NOT NULL CHECK (goal_amount > 0),
    collected_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','CANCELLED','PAUSED')),
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donations (pledges + bank transfer references, no direct card collection in v1)
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_user_id UUID REFERENCES users(id),
    donor_name VARCHAR(255),
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'PLEDGED' CHECK (status IN ('PLEDGED','TRANSFERRED','CONFIRMED','CANCELLED')),
    payment_method VARCHAR(30) CHECK (payment_method IN ('BANK_TRANSFER','SADAD','OTHER')),
    transfer_reference VARCHAR(255),
    notes TEXT,
    donated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- Spending ledger (transparency)
CREATE TABLE waqf_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waqf_id UUID NOT NULL REFERENCES waqf_entities(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id),
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    expense_type VARCHAR(50),
    description VARCHAR(500) NOT NULL,
    vendor VARCHAR(255),
    invoice_url VARCHAR(500),
    expense_date DATE NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
