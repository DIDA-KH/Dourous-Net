-- Run this script in the Supabase SQL Editor to allow authenticated users to delete their own accounts
-- This creates a secure RPC function that bypasses the restrictive REST API for account deletion
-- It manually handles cascading deletes to prevent Foreign Key constraint violations.

create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Delete interactions (views/progress) made by this user
  delete from public.interactions where user_id = auth.uid();
  
  -- 2. If the user is a teacher, delete all interactions on their courses, then delete their courses
  delete from public.interactions where course_id in (select id from public.courses where teacher_id = auth.uid());
  delete from public.courses where teacher_id = auth.uid();
  
  -- 3. Delete the profile (in case ON DELETE CASCADE is missing)
  delete from public.profiles where id = auth.uid();
  
  -- 4. Finally delete the user from the auth.users table
  delete from auth.users where id = auth.uid();
end;
$$;
