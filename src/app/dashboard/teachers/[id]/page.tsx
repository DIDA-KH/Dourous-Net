import { getServerLang, ts } from '@/lib/i18n'
import Link from 'next/link'
import { ArrowLeft, Star, MapPin, Clock, BookOpen, User, Mail } from 'lucide-react'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'
import BackButton from '@/components/BackButton'

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  const lang = getServerLang()
  const t = (s: string, k: string) => ts(lang as any, s, k)
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-US' : 'fr-DZ'

  const access = cookies().get('dn_sb_access')?.value
  const teacherId = params.id

  let teacher: any = null
  let courses: any[] = []

  if (access && teacherId) {
    const headers = { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` }
    
    // Fetch Teacher Profile
    const profRes = await fetch(
      `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty,rating,wilaya,bio,total_sessions,experience_years&id=eq.${encodeURIComponent(teacherId)}&role=eq.teacher&limit=1`,
      { headers, cache: 'no-store' }
    )
    if (profRes.ok) {
      const data = await profRes.json().catch(() => [])
      teacher = data[0] || null
    }

    // Fetch Teacher's Courses
    if (teacher) {
      const coursesRes = await fetch(
        `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,description,created_at&teacher_id=eq.${encodeURIComponent(teacherId)}&order=created_at.desc`,
        { headers, cache: 'no-store' }
      )
      if (coursesRes.ok) {
        courses = await coursesRes.json().catch(() => [])
      }
    }
  }

  if (!teacher) {
    return (
      <div className="card fade-up empty" style={{ textAlign: 'center', padding: '3rem' }}>
        <User size={32} color="var(--text-4)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ marginTop: '1rem', color: 'var(--text)' }}>Enseignant introuvable</h2>
        <Link href="/dashboard/teachers" className="btn btn-outline btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>Retour</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <BackButton label="Retour aux enseignants" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="av av-xl" style={{ fontSize: '1.5rem' }}>{teacher.full_name.charAt(0)}</div>
          <div>
            <h1 className="page-title" style={{ margin: '0 0 .25rem' }}>{teacher.full_name}</h1>
            <span className="badge badge-accent">{teacher.specialty}</span>
          </div>
        </div>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Bio & Courses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>À propos</h3>
            <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
              {teacher.bio || "Aucune description fournie par l'enseignant."}
            </p>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
              Cours disponibles ({courses.length})
            </h3>
            
            {courses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {courses.map(c => (
                  <div key={c.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 .25rem', fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>{c.title}</h4>
                      <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-3)' }}>
                        Ajouté le {new Date(c.created_at).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <Link href={`/dashboard/sessions/${c.id}`} className="btn btn-primary btn-sm">
                      Voir le cours
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card empty" style={{ textAlign: 'center', padding: '3rem' }}>
                <BookOpen size={24} color="var(--text-4)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ margin: '.5rem 0 0', color: 'var(--text-3)' }}>Aucun cours publié pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Sidebar */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Informations</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Star size={16} fill="currentColor" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>Évaluation</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{Number(teacher.rating || 0).toFixed(1)} / 5</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <MapPin size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>Wilaya</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{teacher.wilaya || '—'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Clock size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>Expérience</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{teacher.experience_years || 0} ans</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <BookOpen size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>Cours au total</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
