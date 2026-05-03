import { cookies } from 'next/headers'
import { getServerLang, ts } from '@/lib/i18n'
import Link from 'next/link'
import { Plus, BookOpen, Star, User, Eye, Search, ArrowLeft } from 'lucide-react'
import { getServerUserAndProfile } from '@/lib/auth/session'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

function parseLearnedCourses(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  )
}

export default async function SessionsPage({ searchParams }: { searchParams: { teacherId?: string } }) {
  const lang     = getServerLang()
  const t        = (s: string, k: string) => ts(lang as any, s, k)
  const locale   = lang === 'ar' ? 'ar-DZ' : 'fr-DZ'

  const cookieStore = await cookies()
  const { profile } = await getServerUserAndProfile()
  const isTeacher = profile?.role === 'teacher'
  const teacherId = searchParams?.teacherId
  const learned = parseLearnedCourses(cookieStore.get('dn_learned_courses')?.value)

  const access = cookieStore.get('dn_sb_access')?.value
  let courses: any[] = []
  let teacherById: Record<string, any> = {}
  let viewsByCourseId: Record<string, number> = {}
  if (access) {
    let query = `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,created_at,teacher_id,description&order=created_at.desc`
    if (isTeacher) {
      query += `&teacher_id=eq.${encodeURIComponent(profile?.id)}`
    } else if (teacherId) {
      query += `&teacher_id=eq.${encodeURIComponent(teacherId)}`
    }

    const res = await fetch(query, {
      headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` },
      cache: 'no-store',
    })
    courses = res.ok ? ((await res.json().catch(() => [])) as any[]) : []

    const teacherIds = Array.from(new Set(courses.map((c) => c.teacher_id).filter(Boolean)))
    if (teacherIds.length > 0) {
      const inList = `(${teacherIds.join(',')})`
      const teachersRes = await fetch(
        `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,rating&id=in.${encodeURIComponent(inList)}`,
        { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, cache: 'no-store' }
      )
      const teachers = teachersRes.ok ? ((await teachersRes.json().catch(() => [])) as any[]) : []
      teacherById = Object.fromEntries(teachers.map((p) => [p.id, p]))
    }

    const courseIds = courses.map((c) => c.id).filter(Boolean)
    if (courseIds.length > 0) {
      const inList = `(${courseIds.join(',')})`
      const interRes = await fetch(
        `${supabaseUrl()}/rest/v1/interactions?select=course_id&course_id=in.${encodeURIComponent(inList)}`,
        { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, cache: 'no-store' }
      )
      const interactions = interRes.ok ? ((await interRes.json().catch(() => [])) as any[]) : []
      for (const it of interactions) {
        const key = String(it.course_id ?? '')
        if (!key) continue
        viewsByCourseId[key] = (viewsByCourseId[key] ?? 0) + 1
      }
    }
  }
  if (isTeacher) {
    return (
      <div style={{ width:'100%' }}>
        <div className="fade-up" style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'1.65rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)' }}>
          <div>
            <p className="kicker" style={{ marginBottom:'.3rem' }}>{t('sessions','manageKicker')}</p>
            <h1 className="page-title">{t('sessions','myCourses')}</h1>
          </div>
          <Link href="/dashboard/sessions/create" className="btn btn-primary btn-md">
            <Plus size={16}/> {t('sessions','createCourse')}
          </Link>
        </div>

        <div className="fade-up d1 card" style={{ padding:0,overflow:'hidden' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',textAlign:'left' }}>
            <thead>
              <tr style={{ background:'var(--surface)',borderBottom:'1px solid var(--border)',fontSize:'.75rem',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-3)' }}>
                <th style={{ padding:'1rem 1.25rem',fontWeight:600 }}>{t('sessions','colCourseTitle')}</th>
                <th style={{ padding:'1rem 1.25rem',fontWeight:600 }}>{t('sessions','colCreatedAt')}</th>
                <th style={{ padding:'1rem 1.25rem',fontWeight:600 }}>{t('sessions','colPdfFiles')}</th>
                <th style={{ padding:'1rem 1.25rem',fontWeight:600 }}>{t('sessions','colViews')}</th>
                <th style={{ padding:'1rem 1.25rem',fontWeight:600,textAlign:'right' }}>{t('sessions','colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i<courses.length-1?'1px solid var(--border)':'none',fontSize:'.875rem',color:'var(--text)' }}>
                  <td style={{ padding:'1rem 1.25rem' }}>
                    <div style={{ fontWeight:600,color:'var(--text)',marginBottom:'.15rem' }}>{c.title}</div>
                    <div style={{ fontSize:'.75rem',color:'var(--text-3)' }}>{c.subject}</div>
                  </td>
                  <td style={{ padding:'1rem 1.25rem',color:'var(--text-3)' }}>{new Date(c.created_at).toLocaleDateString(locale)}</td>
                  <td style={{ padding:'1rem 1.25rem' }}><span className="badge badge-pending" style={{ background:'var(--primary-soft)',color:'var(--primary)' }}>— {t('sessions','files')}</span></td>
                  <td style={{ padding:'1rem 1.25rem' }}>— {t('sessions','views')}</td>
                  <td style={{ padding:'1rem 1.25rem',textAlign:'right' }}>
                    <div style={{ display: 'inline-flex', gap: '.45rem' }}>
                      <Link href={`/dashboard/sessions/${c.id}`} className="btn btn-outline btn-sm">{t('sessions','manage')}</Link>
                      <form action={async () => {
                        'use server'
                        const ck = await cookies()
                        const token = ck.get('dn_sb_access')?.value
                        if (!token) return
                        await fetch(`${supabaseUrl()}/rest/v1/courses?id=eq.${encodeURIComponent(c.id)}&teacher_id=eq.${encodeURIComponent(profile?.id)}`, {
                          method: 'DELETE',
                          headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${token}`, Prefer: 'return=minimal' },
                          cache: 'no-store',
                        })
                      }}>
                        <button type="submit" className="btn btn-danger btn-sm">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // STUDENT VIEW (Course Explorer)
  const visibleCourses = courses

  const selectedTeacherName = ''

  return (
    <div>
      <div className="fade-up" style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.65rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)',flexWrap:'wrap',gap:'1rem' }}>
        <div>
          {teacherId ? (
            <>
              <Link href="/dashboard/teachers" style={{ display:'inline-flex',alignItems:'center',gap:'.4rem',fontSize:'.82rem',color:'var(--text-3)',marginBottom:'1rem',transition:'color .15s' }}>
                <ArrowLeft size={13}/> {t('sessions','backToTeachers')}
              </Link>
              <p className="kicker" style={{ marginBottom:'.3rem' }}>{t('sessions','teacherCoursesKicker')}</p>
              <h1 className="page-title">{t('sessions','teacherCoursesTitle')} {selectedTeacherName ? `— ${selectedTeacherName}` : ''}</h1>
              <p className="page-sub">{t('sessions','teacherCoursesSub')}</p>
            </>
          ) : (
            <>
              <p className="kicker" style={{ marginBottom:'.3rem' }}>{t('sessions','learnedKicker')}</p>
              <h1 className="page-title">{t('sessions','learnedTitle')}</h1>
              <p className="page-sub">{t('sessions','learnedSub')}</p>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="input-wrap" style={{ width: '250px' }}>
            <Search size={16} color="var(--text-4)" />
            <input type="text" placeholder={t('sessions','courseSearch')} className="input" />
          </div>
        </div>
      </div>

      {visibleCourses.length === 0 ? (
        <div className="card fade-up d1 empty">
          <div className="empty-icon"><BookOpen size={20}/></div>
          <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0 0 .4rem' }}>
            {teacherId ? t('sessions','noTeacherCourses') : t('sessions','noLearnedCourses')}
          </p>
          <p style={{ fontSize: '.85rem', color: 'var(--text-3)', margin: '0 0 1rem' }}>
            {teacherId ? t('sessions','noTeacherCoursesDesc') : t('sessions','noLearnedCoursesDesc')}
          </p>
          <Link href={teacherId ? '/dashboard/teachers' : '/dashboard/teachers'} className="btn btn-primary btn-sm">
            {t('sessions','browseTeachers')}
          </Link>
        </div>
      ) : (
        <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {visibleCourses.map((c) => (
            <div key={c.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <BookOpen size={24} />
                </div>
                <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>{c.subject}</span>
              </div>
              
              <div>
                <h3 style={{ margin: '0 0 .35rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.3 }}>
                  {c.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'var(--text-3)' }}>
                  <User size={12} /> {teacherById[c.teacher_id]?.full_name ?? 'Prof. Anonyme'}
                  <div style={{ display:'flex',alignItems:'center',gap:'.2rem', marginLeft: '.5rem' }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b"/>
                    <span>{Number(teacherById[c.teacher_id]?.rating ?? 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <Eye size={14} /> {viewsByCourseId[c.id] ?? 0} vues
                </div>
                <Link href={`/dashboard/sessions/${c.id}`} className="btn btn-primary btn-sm">
                  {t('sessions','consult')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

