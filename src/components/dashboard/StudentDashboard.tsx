import React from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Star, FileText, TrendingUp, Clock, CheckCircle, BookOpen, Users, Video } from 'lucide-react'
import { ts } from '@/lib/i18n'
import StatCards from './StatCards'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

const SB: Record<string,string> = { pending:'badge-pending',confirmed:'badge-confirmed',completed:'badge-completed',cancelled:'badge-cancelled' }

export default async function StudentDashboard({ user, profile, lang }: { user: any; profile: any; lang: string }) {
  const t = (s: string, k: string) => ts(lang as any, s, k)
  const locale = lang === 'ar' ? 'ar-DZ' : 'fr-DZ'

  const access = (await cookies()).get('dn_sb_access')?.value
  let sessions: any[] = []
  let teachers: any[] = []
  if (access) {
    // Fetch recently published courses and top teachers in parallel to reduce lag
    const [coursesRes, teachRes] = await Promise.all([
      fetch(
        `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,teacher_id,created_at&order=created_at.desc&limit=5`,
        { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, next: { revalidate: 15 } }
      ),
      fetch(
        `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty,rating&role=eq.teacher&order=rating.desc.nullslast&limit=5`,
        { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, next: { revalidate: 30 } }
      )
    ])
    const courses = coursesRes.ok ? ((await coursesRes.json().catch(() => [])) as any[]) : []
    teachers = teachRes.ok ? ((await teachRes.json().catch(() => [])) as any[]) : []
    
    // Fetch teacher details for these courses
    const teacherIds = Array.from(new Set(courses.map((c) => c.teacher_id).filter(Boolean)))
    let teachersById: Record<string, any> = {}
    if (teacherIds.length) {
      const inList = `(${teacherIds.map((id) => `"${id}"`).join(',')})`
      const profRes = await fetch(
        `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty&id=in.${encodeURIComponent(inList)}`,
        { headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }, cache: 'no-store' }
      )
      const profs = profRes.ok ? ((await profRes.json().catch(() => [])) as any[]) : []
      teachersById = Object.fromEntries(profs.map((p) => [p.id, p]))
    }

    sessions = courses.map((c) => {
      const t = teachersById[c.teacher_id] || {}
      return {
        id: c.id,
        status: 'published',
        subject: c.title || c.subject || '—',
        scheduled_at: c.created_at,
        teacher: { id: t.id, full_name: t.full_name || '—', specialty: t.specialty || '—' },
      }
    })


  }

  const total     = sessions?.length ?? 0
  const pendingN  = sessions?.filter(s => s.status==='pending').length ?? 0
  const confirmedN = sessions?.filter(s => s.status==='confirmed').length ?? 0
  const completedN = sessions?.filter(s => s.status==='completed').length ?? 0

  const SL: Record<string,string> = {
    pending: t('sessions','statusPending'), confirmed: t('sessions','statusConfirmed'),
    completed: t('sessions','statusCompleted'), cancelled: t('sessions','statusCancelled'),
    published: 'Nouveau',
  }

  const h = new Date().getHours()
  const greet = h < 12 ? t('dashboard','greetMorning') : h < 18 ? t('dashboard','greetAfternoon') : t('dashboard','greetEvening')

  const stats = [
    { lbl: 'Cours disponibles', val: total,      clr: 'var(--primary)', icon: BookOpen },
    { lbl: 'Nouveaux',          val: total,      clr: '#16a34a',        icon: CheckCircle },
    { lbl: 'Favoris',           val: 0,          clr: '#d97706',        icon: Star },
    { lbl: 'Terminés',          val: 0,          clr: '#7c3aed',        icon: TrendingUp },
  ]

  return (
    <div style={{ width: '100%' }}>
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="kicker" style={{ marginBottom: '.3rem' }}>{t('dashboard','titleStudent')}</p>
        <h1 className="page-title">{greet}, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="page-sub">{profile?.level} · {profile?.wilaya}</p>
      </div>

      <StatCards stats={stats} lang={lang} />

      <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }}>
        {/* Recent sessions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <p className="section-title">Cours Récents</p>
            <Link href="/dashboard/teachers" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.78rem', fontWeight: 600, color: 'var(--primary)' }}>
              Découvrir <ArrowRight size={12}/>
            </Link>
          </div>
          {sessions && sessions.length > 0 ? sessions.map((s: any, i: number) => (
            <Link key={s.id} href={`/dashboard/sessions/${s.id}`}
              className="list-item"
              style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.82rem 1.25rem', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none' }}>
              <div className="av av-md">{s.teacher?.full_name?.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 .1rem', fontWeight: 600, fontSize: '.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.teacher?.full_name}</p>
                <p style={{ margin: 0, fontSize: '.76rem', color: 'var(--text-3)' }}>{s.subject} · {new Date(s.scheduled_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
                {s.homework_name && <FileText size={13} style={{ color: 'var(--text-4)' }}/>}
                <span className={`badge ${SB[s.status]}`}>{SL[s.status]}</span>
              </div>
            </Link>
          )) : (
            <div className="empty">
              <div className="empty-icon"><BookOpen size={20}/></div>
              <p style={{ fontWeight: 600, color: 'var(--text)', margin: '0 0 .4rem' }}>Aucun cours disponible</p>
              <Link href="/dashboard/teachers" className="btn btn-primary btn-sm"><Plus size={13}/> Parcourir les enseignants</Link>
            </div>
          )}
        </div>

        {/* Top teachers */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <p className="section-title">{t('dashboard','topTeachers')}</p>
          </div>
          {teachers && teachers.length > 0 ? teachers.map((p: any, i: number) => (
            <div key={p.id} style={{ padding: '.75rem 1.25rem', borderBottom: i < teachers.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.5rem' }}>
                <div className="av av-sm">{p.full_name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '.82rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</p>
                  <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-3)' }}>{p.specialty}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.2rem', flexShrink: 0 }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b"/>
                  <span style={{ fontWeight: 700, fontSize: '.78rem', color: 'var(--text)' }}>{Number(p.rating).toFixed(1)}</span>
                </div>
              </div>
              <Link href={`/dashboard/teachers/${encodeURIComponent(p.id)}`} className="btn btn-surface btn-sm" style={{ width: '100%' }}>
                Voir le profil
              </Link>
            </div>
          )) : (
            <div className="empty"><p style={{ fontSize: '.85rem', color: 'var(--text-3)' }}>{t('dashboard','noSessions')}</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

