-- Run this script in the Supabase SQL Editor to allow teachers to see interactions on their courses.
-- Without this, the RLS policy blocks teachers from seeing student views or uploaded documents.

create policy "interactions_select_teacher"
on public.interactions for select
to authenticated
using (
  course_id in (select id from public.courses where teacher_id = auth.uid())
);
