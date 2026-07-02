-- Migration: Add persistent cart to profiles

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cart jsonb DEFAULT '[]'::jsonb;
