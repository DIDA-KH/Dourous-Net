import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, Eye, Users, Plus, Star } from 'lucide-react'
import { ts } from '@/lib/i18n'
import StatCards from './StatCards'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export default async function TeacherDashboard({ user, profile, lang }: { user: any; profile: any; lang: string }) {
  const t = (s: string, k: string) => ts(lang as any, s, k)
  const locale = lang === 'ar' ? 'ar-DZ' : 'fr-DZ'

  const access = (await cookies()).get('dn_sb_access')?.value
  let courses: any[] = []
  if (access && profile?.id) {
    const res = await fetch(
      `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,created_at,teacher_id&teacher_id=eq.${encodeURIComponent(profile.id)}&order=created_at.desc&limit=5`,
      { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, next: { revalidate: 15 } }
    )
    courses = res.ok ? ((await res.json().catch(() => [])) as any[]) : []
  }

  const totalCourses = courses.length
  const totalViews = 0
  const totalStudents = 0
  const totalPdfs = 0

  const h = new Date().getHours()
  const greet = h < 12 ? t('dashboard','greetMorning') : h < 18 ? t('dashboard','greetAfternoon') : t('dashboard','greetEvening')

  const stats = [
    { lbl: t('dashboard','myCourses'),      val: totalCourses,  clr: '#3b82f6', icon: BookOpen },
    { lbl: t('dashboard','sharedPdfs'),     val: totalPdfs,     clr: '#10b981', icon: FileText },
    { lbl: t('dashboard','totalViews'),     val: totalViews,    clr: '#8b5cf6', icon: Eye },
    { lbl: t('dashboard','studentsReached'),val: totalStudents, clr: '#f59e0b', icon: Users },
  ]

  return (
    <div style={{ width: '100%' }}>
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="kicker" style={{ marginBottom: '.3rem' }}>{t('dashboard','titleTeacher') || 'Espace Enseignant'}</p>
        <h1 className="page-title">{greet}, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="page-sub">{profile?.specialty} · {profile?.wilaya}</p>
      </div>

      <StatCards stats={stats} lang={lang} />

      <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <p className="section-title">📚 {t('dashboard','recentCourses')} ({courses.length})</p>
              <Link href="/dashboard/sessions" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)' }}>
                {t('dashboard','viewAll')} <ArrowRight size={12}/>
              </Link>
            </div>
            
            {courses.length > 0 ? courses.map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.82rem 1.25rem', borderBottom: i < courses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="av av-md" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><BookOpen size={16}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 .1rem', fontWeight: 600, fontSize: '.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</p>
                  <p style={{ margin: 0, fontSize: '.76rem', color: 'var(--text-3)' }}>{c.subject} · {new Date(c.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, fontSize: '.78rem', color: 'var(--text-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><FileText size={14}/> —</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}><Eye size={14}/> —</div>
                  <Link href={`/dashboard/sessions/${c.id}`} className="btn btn-outline btn-sm">{t('dashboard','manage')}</Link>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: '.9rem' }}>{t('dashboard','noCoursesYet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Info card / Sidebar for dashboard */}
        <div className="card" style={{ height: 'fit-content' }}>
          <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '1rem', color: 'var(--text)' }}>{t('dashboard','quickActions')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <Link href="/dashboard/sessions/create" className="btn btn-primary btn-md" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Plus size={16} /> {t('dashboard','createNewCourse')}
            </Link>
            <Link href="/dashboard/profile" className="btn btn-outline btn-md" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Star size={14} /> {t('dashboard','updateProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

