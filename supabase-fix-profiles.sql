-- 1. Allow authenticated users to see ALL profiles, not just teachers.
-- This ensures that even if a teacher's role is missing or misconfigured, their profile can still be loaded.
drop policy if exists "profiles_select_teachers" on public.profiles;

create policy "profiles_select_all_authenticated"
on public.profiles for select
to authenticated
using (true);

-- 2. Fix any case-sensitivity issues with the role column
update public.profiles 
set role = lower(role) 
where role is not null;

-- 3. Just in case, allow anyone to read profiles (optional, but good for public teacher directories)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select
to anon
using (true);
