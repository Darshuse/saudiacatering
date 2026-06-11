-- Inheritance cases
CREATE TABLE inheritance_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    madhhab VARCHAR(20) NOT NULL CHECK (madhhab IN ('HANAFI','MALIKI','SHAFII','HANBALI')),
    deceased_is_male BOOLEAN NOT NULL,
    gross_estate NUMERIC(18,2) NOT NULL CHECK (gross_estate >= 0),
    debts NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debts >= 0),
    funeral_costs NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (funeral_costs >= 0),
    wasiyya NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (wasiyya >= 0),
    net_estate NUMERIC(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CALCULATED',
    result_json JSONB,
    -- Heir counts
    heir_husbands SMALLINT NOT NULL DEFAULT 0 CHECK (heir_husbands BETWEEN 0 AND 1),
    heir_wives SMALLINT NOT NULL DEFAULT 0 CHECK (heir_wives BETWEEN 0 AND 4),
    heir_sons SMALLINT NOT NULL DEFAULT 0,
    heir_daughters SMALLINT NOT NULL DEFAULT 0,
    heir_sons_of_son SMALLINT NOT NULL DEFAULT 0,
    heir_daughters_of_son SMALLINT NOT NULL DEFAULT 0,
    heir_father_alive BOOLEAN NOT NULL DEFAULT false,
    heir_mother_alive BOOLEAN NOT NULL DEFAULT false,
    heir_paternal_grandfather_alive BOOLEAN NOT NULL DEFAULT false,
    heir_paternal_grandmothers SMALLINT NOT NULL DEFAULT 0,
    heir_maternal_grandmothers SMALLINT NOT NULL DEFAULT 0,
    heir_full_brothers SMALLINT NOT NULL DEFAULT 0,
    heir_full_sisters SMALLINT NOT NULL DEFAULT 0,
    heir_paternal_brothers SMALLINT NOT NULL DEFAULT 0,
    heir_paternal_sisters SMALLINT NOT NULL DEFAULT 0,
    heir_maternal_brothers SMALLINT NOT NULL DEFAULT 0,
    heir_maternal_sisters SMALLINT NOT NULL DEFAULT 0,
    heir_full_paternal_uncles SMALLINT NOT NULL DEFAULT 0,
    heir_sons_of_full_paternal_uncle SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inheritance_cases_user ON inheritance_cases(user_id);
CREATE INDEX idx_inheritance_cases_madhhab ON inheritance_cases(madhhab);
CREATE INDEX idx_inheritance_cases_created ON inheritance_cases(created_at DESC);

-- Case heirs (denormalized result for display)
CREATE TABLE case_heirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES inheritance_cases(id) ON DELETE CASCADE,
    heir_type VARCHAR(50) NOT NULL,
    arabic_name VARCHAR(100) NOT NULL,
    heir_count SMALLINT NOT NULL DEFAULT 1,
    classification VARCHAR(50) NOT NULL,
    share_numerator BIGINT NOT NULL,
    share_denominator BIGINT NOT NULL,
    percentage NUMERIC(6,3),
    monetary_amount NUMERIC(18,2),
    fiqh_explanation TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    blocked_by_type VARCHAR(50),
    sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_case_heirs_case ON case_heirs(case_id);
