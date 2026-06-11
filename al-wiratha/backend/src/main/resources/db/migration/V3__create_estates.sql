-- Estates (shared inheritance workspaces)
CREATE TABLE estates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    admin_user_id UUID NOT NULL REFERENCES users(id),
    inheritance_case_id UUID REFERENCES inheritance_cases(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED','DISPUTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Estate members (heirs with their shares)
CREATE TABLE estate_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    heir_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    heir_type VARCHAR(50),
    share_numerator BIGINT NOT NULL,
    share_denominator BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'HEIR' CHECK (role IN ('ADMIN','HEIR','OBSERVER')),
    joined_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_estate_member UNIQUE (estate_id, user_id)
);

-- Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    asset_type VARCHAR(30) NOT NULL CHECK (asset_type IN ('REAL_ESTATE','BANK_ACCOUNT','VEHICLE','BUSINESS','FARM','OTHER')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_value NUMERIC(18,2),
    location VARCHAR(500),
    document_urls JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rental incomes
CREATE TABLE rental_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    income_month DATE NOT NULL,
    description VARCHAR(500),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Distributions
CREATE TABLE distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    rental_income_id UUID REFERENCES rental_incomes(id),
    total_amount NUMERIC(18,2) NOT NULL,
    distribution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','COMPLETE')),
    notes TEXT,
    version INTEGER NOT NULL DEFAULT 0  -- optimistic locking
);

-- Distribution lines (per heir)
CREATE TABLE distribution_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES estate_members(id),
    amount NUMERIC(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','CONFIRMED')),
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(255)
);

-- Proposals (decision voting)
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    proposed_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    proposal_type VARCHAR(30) CHECK (proposal_type IN ('SELL','RENOVATE','LEASE','CHANGE_TENANT','OTHER')),
    quorum_threshold NUMERIC(5,2) NOT NULL DEFAULT 51.00,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','PASSED','REJECTED','EXPIRED')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES estate_members(id),
    vote VARCHAR(10) NOT NULL CHECK (vote IN ('YES','NO','ABSTAIN')),
    weight_numerator BIGINT NOT NULL,
    weight_denominator BIGINT NOT NULL,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vote UNIQUE (proposal_id, member_id)
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id),
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    expense_type VARCHAR(50) CHECK (expense_type IN ('MAINTENANCE','ZAKAT','TAX','INSURANCE','LEGAL','OTHER')),
    description VARCHAR(500),
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(500),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
