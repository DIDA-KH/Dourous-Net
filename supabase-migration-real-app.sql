-- Paste this into Supabase SQL Editor after the initial A/B/C script.
-- It adds missing fields used by the frontend mockups and enables safe listing of teachers.

-- 1) Add optional profile fields used in UI
alter table public.profiles
  add column if not exists bio text,
  add column if not exists rating numeric,
  add column if not exists total_sessions integer,
  add column if not exists experience_years integer,
  add column if not exists hourly_rate integer,
  add column if not exists google_meet_link text,
  add column if not exists dahabia_number text;

-- 2) Allow authenticated users to list teachers (read-only)
drop policy if exists "profiles_select_teachers" on public.profiles;
create policy "profiles_select_teachers"
on public.profiles for select
to authenticated
using (role = 'teacher');

-- 3) Add course description for real publishing
alter table public.courses
  add column if not exists description text;

