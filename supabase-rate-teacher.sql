-- Run this script in the Supabase SQL Editor to allow authenticated users to submit a rating for a teacher.
-- This creates a secure RPC function that computes a simple average for the teacher's rating.

create or replace function rate_teacher(p_teacher_id uuid, p_rating numeric)
returns void
language plpgsql
security definer
as $$
declare
  current_rating numeric;
begin
  -- Get the current rating of the teacher
  select rating into current_rating from public.profiles where id = p_teacher_id;
  
  if current_rating is null or current_rating = 0 then
    -- If no rating exists yet, set it to the new rating
    update public.profiles set rating = p_rating where id = p_teacher_id;
  else
    -- Compute a simple moving average (this is a simplified approach, a robust one would require a reviews table)
    update public.profiles set rating = (current_rating + p_rating) / 2.0 where id = p_teacher_id;
  end if;
end;
$$;
