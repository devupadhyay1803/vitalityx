-- Migration 010: Biological Age Engine

CREATE TABLE IF NOT EXISTS public.biological_age_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chronological_age NUMERIC,
    biological_age NUMERIC,
    longevity_score NUMERIC,
    metabolic_score NUMERIC,
    inflammation_score NUMERIC,
    cardiovascular_score NUMERIC,
    hormonal_score NUMERIC,
    recovery_score NUMERIC,
    confidence_score NUMERIC,
    calculation_version TEXT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.biological_age_records ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "bio_age_read" ON public.biological_age_records;
CREATE POLICY "bio_age_read" ON public.biological_age_records 
    FOR SELECT USING (
        auth.uid() = member_id OR 
        public.is_assigned_coach(member_id) OR 
        public.is_admin_or_ops()
    );

-- We don't want clients inserting their own records.
-- Admins/Ops can insert, or Service Role (backend) bypassing RLS.
DROP POLICY IF EXISTS "bio_age_insert" ON public.biological_age_records;
CREATE POLICY "bio_age_insert" ON public.biological_age_records 
    FOR INSERT WITH CHECK (
        public.is_admin_or_ops()
    );

-- Also add an index on member_id and calculated_at for trend fetching performance
CREATE INDEX IF NOT EXISTS idx_bio_age_member_date ON public.biological_age_records(member_id, calculated_at DESC);
