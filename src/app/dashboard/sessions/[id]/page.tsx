import SessionDetailClient from './SessionDetailClient'
import { getServerUserAndProfile } from '@/lib/auth/session'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const { user, profile } = await getServerUserAndProfile()
  const isTeacher = profile?.role === 'teacher'
  const access = cookies().get('dn_sb_access')?.value
  const courseId = String(params.id ?? '')

  if (!access || !courseId) {
    const fallback = {
      id: courseId,
      title: 'Course',
      subject: '—',
      description: '',
      created_at: new Date().toISOString(),
      teacher: { full_name: 'Prof. Anonyme', specialty: '—' },
      students: [],
      pdfs: [],
    }
    return <SessionDetailClient session={fallback} isTeacher={isTeacher} userId={user?.id ?? 'unknown'} />
  }

  const headers = {
    apikey: supabaseAnonKey(),
    Authorization: `Bearer ${access}`,
  }

  const [courseRes, interactionsRes] = await Promise.all([
    fetch(
      `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,description,created_at,teacher_id&id=eq.${encodeURIComponent(courseId)}&limit=1`,
      { headers, next: { revalidate: 15 } }
    ),
    fetch(
      `${supabaseUrl()}/rest/v1/interactions?select=id,user_id,course_id,file_path,created_at&course_id=eq.${encodeURIComponent(courseId)}&order=created_at.desc`,
      { headers, next: { revalidate: 15 } }
    )
  ])

  const course = courseRes.ok ? (await courseRes.json().catch(() => []))?.[0] : null
  const interactions = interactionsRes.ok ? ((await interactionsRes.json().catch(() => [])) as any[]) : []

  let teacher = { full_name: 'Prof. Anonyme', specialty: '—' }
  if (course?.teacher_id) {
    const teacherRes = await fetch(
      `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty&id=eq.${encodeURIComponent(course.teacher_id)}&limit=1`,
      { headers, next: { revalidate: 30 } }
    )
    teacher = teacherRes.ok ? ((await teacherRes.json().catch(() => []))?.[0] ?? teacher) : teacher
  }

  const viewerUserIds = Array.from(new Set(interactions.map((it) => String(it.user_id ?? '')).filter(Boolean)))
  let viewersById: Record<string, any> = {}
  if (viewerUserIds.length > 0) {
    const inList = `(${viewerUserIds.join(',')})`
    const viewersRes = await fetch(
      `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,level&id=in.${encodeURIComponent(inList)}`,
      { headers, cache: 'no-store' }
    )
    const viewers = viewersRes.ok ? ((await viewersRes.json().catch(() => [])) as any[]) : []
    viewersById = Object.fromEntries(viewers.map((v) => [v.id, v]))
  }

  const students = interactions.map((it, idx) => {
    const u = viewersById[it.user_id] || {}
    return {
      id: String(it.id ?? idx),
      name: String(u.full_name ?? 'Étudiant'),
      level: String(u.level ?? '—'),
      viewed_at: String(it.created_at ?? new Date().toISOString()),
    }
  })

  const listRes = await fetch(
    `${supabaseUrl()}/storage/v1/object/list/interaction-files`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: `${course?.teacher_id ?? ''}/courses/${courseId}`,
        limit: 100,
        offset: 0,
      }),
      next: { revalidate: 15 },
    }
  )
  const listed = listRes.ok ? ((await listRes.json().catch(() => [])) as any[]) : []
  const pdfs: any[] = []
  for (const f of listed) {
    const fileName = String(f?.name ?? '').trim()
    if (!fileName) continue
    const filePath = `${course?.teacher_id ?? ''}/courses/${courseId}/${fileName}`
    const signRes = await fetch(
      `${supabaseUrl()}/storage/v1/object/sign/interaction-files/${encodeURI(filePath)}`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 60 * 60 * 6 }),
        next: { revalidate: 15 },
      }
    )
    if (!signRes.ok) continue
    const signJson = await signRes.json().catch(() => null)
    const signedUrl = String(signJson?.signedURL ?? '')
    if (!signedUrl) continue
    const absoluteUrl = signedUrl.startsWith('http') ? signedUrl : `${supabaseUrl()}/storage/v1${signedUrl}`
    pdfs.push({
      id: filePath,
      name: fileName,
      size: f?.metadata?.size ? `${Math.round(Number(f.metadata.size) / 1024)} KB` : 'PDF',
      path: filePath,
      url: absoluteUrl,
    })
  }

  const session = {
    id: course?.id ?? courseId,
    title: course?.title ?? 'Course',
    subject: course?.subject ?? '—',
    description: course?.description ?? '',
    created_at: course?.created_at ?? new Date().toISOString(),
    teacher,
    students,
    pdfs,
  }

  return <SessionDetailClient session={session} isTeacher={isTeacher} userId={user?.id ?? 'unknown'} />
}

