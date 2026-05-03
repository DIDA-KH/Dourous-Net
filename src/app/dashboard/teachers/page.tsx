import { getServerLang, ts } from '@/lib/i18n'
import Link from 'next/link'
import { Star, MapPin, Clock, BookOpen, ChevronRight, Video } from 'lucide-react'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

const SPECS: { key: string; fr: string; en: string; ar: string }[] = [
  { key: 'ALL', fr: 'Toutes', en: 'All', ar: 'الكل' },
  { key: 'Mathématiques', fr: 'Mathématiques', en: 'Mathematics', ar: 'رياضيات' },
  { key: 'Physique-Chimie', fr: 'Physique-Chimie', en: 'Physics-Chemistry', ar: 'فيزياء-كيمياء' },
  { key: 'Français', fr: 'Français', en: 'French', ar: 'فرنسية' },
  { key: 'Anglais', fr: 'Anglais', en: 'English', ar: 'إنجليزية' },
  { key: 'Informatique', fr: 'Informatique', en: 'Computer Science', ar: 'إعلام آلي' },
  { key: 'Chimie', fr: 'Chimie', en: 'Chemistry', ar: 'كيمياء' },
  { key: 'Sciences Naturelles', fr: 'Sciences Naturelles', en: 'Natural Sciences', ar: 'علوم طبيعية' },
  { key: 'Histoire-Géographie', fr: 'Histoire-Géographie', en: 'History-Geography', ar: 'تاريخ-جغرافيا' },
  { key: 'Sciences islamiques', fr: 'Sciences islamiques', en: 'Islamic Sciences', ar: 'علوم إسلامية' },
]

export default async function TeachersPage({ searchParams }: { searchParams: { s?: string; q?: string } }) {
  const lang     = getServerLang()
  const t        = (s: string, k: string) => ts(lang as any, s, k)

  const access = (await cookies()).get('dn_sb_access')?.value
  const spec = searchParams.s ?? 'ALL'
  const q = searchParams.q ?? ''

  let teachers: any[] = []
  if (access) {
    let query = `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty,rating,wilaya,bio,hourly_rate,google_meet_link,total_sessions,experience_years&role=eq.teacher&order=rating.desc.nullslast,full_name.asc`
    if (spec && spec !== 'ALL') query += `&specialty=eq.${encodeURIComponent(spec)}`
    if (q) query += `&or=(full_name.ilike.*${encodeURIComponent(q)}*,specialty.ilike.*${encodeURIComponent(q)}*)`

    const res = await fetch(query, {
      headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` },
      cache: 'no-store',
    })
    teachers = res.ok ? ((await res.json().catch(() => [])) as any[]) : []
  }

  const active = searchParams.s ?? 'ALL'
  const count  = teachers?.length ?? 0
  const specLabel = (sp: (typeof SPECS)[number]) => (lang === 'ar' ? sp.ar : lang === 'en' ? sp.en : sp.fr)

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:'1.65rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)' }}>
        <p className="kicker" style={{ marginBottom:'.3rem' }}>{t('teachers','pageTitle')}</p>
        <h1 className="page-title">{t('teachers','title')}</h1>
        <p className="page-sub">
          {count} {count === 1 ? t('teachers','title').toLowerCase().slice(0,-1) : t('teachers','title').toLowerCase()}
        </p>
      </div>

      <form method="GET" className="fade-up d1">
        <div style={{ display:'flex',gap:'.65rem',marginBottom:'.85rem',flexWrap:'wrap',alignItems:'center' }}>
          <div style={{ position:'relative',flex:1,minWidth:200,maxWidth:360 }}>
            <input name="q" defaultValue={searchParams.q}
              placeholder={t('teachers','search')}
              className="input"
              style={{ border:'1px solid var(--border)',borderRadius:'var(--r-md)',padding:'.58rem .9rem',width:'100%',background:'var(--bg-alt)',transition:'border-color .15s,box-shadow .15s' }}/>
            {active !== 'ALL' && <input type="hidden" name="s" value={active}/>}
          </div>
          <button type="submit" className="btn btn-primary btn-sm">{t('common','search')}</button>
        </div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'1.65rem' }}>
          {SPECS.map(sp => (
            <button key={sp.key} type="submit" name="s" value={sp.key}
              className={`filter-pill${active === sp.key ? ' on' : ''}`}>
              {sp.key === 'ALL' ? t('teachers','all') : specLabel(sp)}
            </button>
          ))}
        </div>
      </form>

      {teachers && teachers.length > 0 ? (
        <div className="fade-up d2" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem' }}>
          {teachers.map((p: any) => (
            <div key={p.id} className="teacher-card">
              <div style={{ height:'3px',background:'var(--primary)' }}/>
              <div style={{ padding:'1.25rem 1.35rem' }}>
                <div style={{ display:'flex',alignItems:'flex-start',gap:'.9rem',marginBottom:'1rem' }}>
                  <div className="av av-lg">{p.full_name.charAt(0)}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.3rem',flexWrap:'wrap' }}>
                      <h3 style={{ fontWeight:700,fontSize:'.95rem',color:'var(--text)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {p.full_name}
                      </h3>
                    </div>
                    <span className="badge badge-accent" style={{ fontSize:'.68rem' }}>{p.specialty}</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:'.25rem',flexShrink:0 }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b"/>
                    <span style={{ fontWeight:700,fontSize:'.85rem',color:'var(--text)' }}>{Number(p.rating).toFixed(1)}</span>
                  </div>
                </div>

                {p.bio && (
                  <p style={{ fontSize:'.82rem',lineHeight:1.65,color:'var(--text-3)',marginBottom:'.85rem',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,overflow:'hidden' }}>
                    {p.bio}
                  </p>
                )}

                <div style={{ display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap' }}>
                  {([
                    { I:MapPin, v:p.wilaya },
                    { I:Clock,  v:`${p.experience_years ?? 0} ${t('teachers','exp')}` },
                    { I:BookOpen, v:`${p.total_sessions} ${t('teachers','sessions')}` },
                  ] as { I: any; v: string }[]).map(({ I, v }, i) => (
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:'.3rem',fontSize:'.74rem',color:'var(--text-3)' }}>
                      <I size={11}/><span>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'.85rem',borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                    {t('teachers','availableCourses')}
                  </div>
                  <Link href={`/dashboard/teachers/${encodeURIComponent(p.id)}`} className="btn btn-primary btn-sm" style={{ gap:'.25rem' }}>
                    {t('teachers','viewProfile')} <ChevronRight size={12}/>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card fade-up d2 empty">
          <div className="empty-icon"><BookOpen size={20}/></div>
          <p style={{ fontWeight:600,color:'var(--text)',margin:'0 0 .4rem' }}>{t('teachers','noResults')}</p>
          <p style={{ fontSize:'.85rem',color:'var(--text-3)',margin:0 }}>{t('teachers','noResultsDesc')}</p>
        </div>
      )}
    </div>
  )
}
