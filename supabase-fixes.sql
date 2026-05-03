-- 1) Enable RLS on courses table if not already enabled
alter table public.courses enable row level security;

-- 2) Allow anyone to read courses (public and authenticated)
drop policy if exists "courses_select_all" on public.courses;
create policy "courses_select_all"
on public.courses for select
using (true);

-- 3) Allow teachers to insert their own courses
drop policy if exists "courses_insert_teacher" on public.courses;
create policy "courses_insert_teacher"
on public.courses for insert
to authenticated
with check (auth.uid() = teacher_id);

-- 4) Allow teachers to update their own courses
drop policy if exists "courses_update_teacher" on public.courses;
create policy "courses_update_teacher"
on public.courses for update
to authenticated
using (auth.uid() = teacher_id)
with check (auth.uid() = teacher_id);

-- 5) Allow teachers to delete their own courses
drop policy if exists "courses_delete_teacher" on public.courses;
create policy "courses_delete_teacher"
on public.courses for delete
to authenticated
using (auth.uid() = teacher_id);
