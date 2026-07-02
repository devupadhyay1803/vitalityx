-- Migration 018: Add disabled flag to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT false;
