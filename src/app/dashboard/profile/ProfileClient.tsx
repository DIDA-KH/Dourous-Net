'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, User, Mail, GraduationCap, MapPin, Calendar, BookOpen, Star, TriangleAlert } from 'lucide-react'
import { useUi } from '@/context/UiContext'

const LEVELS = ['Primaire','Moyen (CEM)','Lycée','Université'];
const WILAYAS = ['Alger','Oran','Constantine','Annaba','Batna','Sétif','Blida','Béjaïa'];
const SPECIALTIES = ['Mathématiques','Physique-Chimie','Français','Anglais','Informatique','Chimie','Sciences Naturelles','Histoire-Géographie','Sciences islamiques'];

export default function ProfileClient({ profile, user, courseCount = 0 }: { profile: any | null; user: any; courseCount?: number }) {
  const { t, tData, isRTL } = useUi()
  const router = useRouter()
  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'
  const isTeacher = profile?.role === 'teacher'

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  const fallbackName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''

  const [form, setForm] = useState({
    fullName:       fallbackName,
    bio:            profile?.bio || '',
    wilaya:         profile?.wilaya || 'Alger',
    level:          profile?.level || 'Lycée',
    specialty:      profile?.specialty || 'Mathématiques',
    experience:     String(profile?.experience_years || 0),
  })

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName,
          bio: form.bio,
          wilaya: form.wilaya,
          level: isTeacher ? undefined : form.level,
          specialty: isTeacher ? form.specialty : undefined,
          experience_years: isTeacher ? Number(form.experience) : undefined,
        })
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error || 'Failed to save')
        setLoading(false)
        return
      }
      setSaved(true); setEditing(false)
      router.refresh()
    } catch(err) {
      setError('Network error')
    }
    setLoading(false)
    setTimeout(() => setSaved(false), 3500)
  }

  const deleteAccount = async () => {
    const roleLabel = t('auth', isTeacher ? 'teacher' : 'student')
    const confirmed = window.confirm(`${t('profile', 'deleteConfirm')} ${roleLabel}?`)
    if (!confirmed) return
    setLoading(true)
    const res = await fetch('/api/auth/delete', { method: 'POST' })
    if (!res.ok) {
      alert(t('profile', 'deleteError') || 'Failed to delete account')
      setLoading(false)
      return
    }

    try {
      localStorage.removeItem('dn_teacher_ratings')
      localStorage.removeItem('dn_lang')
      localStorage.removeItem('dn_theme')
      localStorage.removeItem('dn_accent')
    } catch {}

    router.replace('/auth/login')
  }

  const inital = form.fullName?.charAt(0)?.toUpperCase() ?? '?'
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="kicker" style={{ marginBottom: '.3rem', fontFamily: F }}>{t('profile', 'subtitle')}</p>
        <h1 className="page-title" style={{ fontFamily: F }}>{t('profile', 'title')}</h1>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: '220px minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Avatar card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: 'var(--r-full)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, boxShadow: '0 4px 16px var(--primary-shadow)', margin: '0 auto 1.1rem' }}>
            {inital}
          </div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', margin: '0 0 .25rem', wordBreak: 'break-word', fontFamily: F }}>{form.fullName}</p>
          <span className={isTeacher ? 'badge badge-teacher' : 'badge badge-student'} style={{ fontSize: '.67rem' }}>
            {t('auth', isTeacher ? 'teacher' : 'student')}
          </span>
          {isTeacher && (
            <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', justifyContent: 'center' }}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--text)', fontFamily: F }}>{Number(profile?.rating ?? 0).toFixed(1)} / 5</span>
              </div>
              <p style={{ margin: 0, fontSize: '.78rem', color: 'var(--text-3)', fontFamily: F }}>{courseCount} cours</p>
            </div>
          )}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem', textAlign: 'start' }}>
            {[
              { icon: Mail,     val: profile?.email },
              { icon: MapPin,   val: form.wilaya },
              { icon: Calendar, val: joined },
              isTeacher ? { icon: BookOpen, val: tData(form.specialty) } : { icon: GraduationCap, val: tData(form.level) },
            ].map(({ icon: Icon, val }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <Icon size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <span style={{ fontSize: '.78rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Removed Role Switcher per user request */}
        </div>

        {/* Edit card */}
        <div className="card fade-up d2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: F }}>{t('profile', 'personalInfo')}</p>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-surface btn-sm" style={{ fontFamily: F }}>
                {t('profile', 'edit')}
              </button>
            )}
          </div>

          {saved && (
            <div className="ok-box" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.25rem', fontFamily: F }}>
              <CheckCircle size={16} /> {t('profile', 'saved')}
            </div>
          )}
          {error && <div className="err-box" style={{ marginBottom: '1.25rem', fontFamily: F }}>{error}</div>}

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div className="field">
                <label className="label" style={{ fontFamily: F }}>{t('profile', 'name')}</label>
                <div className="input-wrap">
                  <User size={14} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
                  <input type="text" value={form.fullName} onChange={e => up('fullName', e.target.value)} className="input" style={{ fontFamily: F }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                {isTeacher ? (
                  <>
                    <div className="field">
                      <label className="label" style={{ fontFamily: F }}>{t('profile', 'specialty')}</label>
                      <div className="input-wrap">
                        <select value={form.specialty} onChange={e => up('specialty', e.target.value)} className="input" style={{ fontFamily: F }}>
                          {SPECIALTIES.map(s => <option key={s} value={s}>{tData(s)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label" style={{ fontFamily: F }}>{t('profile', 'experience')}</label>
                      <div className="input-wrap">
                        <input type="number" min="0" max="50" value={form.experience} onChange={e => up('experience', e.target.value)} className="input" style={{ fontFamily: F }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="field" style={{ gridColumn: '1/-1' }}>
                    <label className="label" style={{ fontFamily: F }}>{t('profile', 'level')}</label>
                    <div className="input-wrap">
                      <select value={form.level} onChange={e => up('level', e.target.value)} className="input" style={{ fontFamily: F }}>
                        {LEVELS.map(l => <option key={l} value={l}>{tData(l)}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div className="field">
                  <label className="label" style={{ fontFamily: F }}>{t('profile', 'wilaya')}</label>
                  <div className="input-wrap">
                    <MapPin size={14} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
                    <select value={form.wilaya} onChange={e => up('wilaya', e.target.value)} className="input" style={{ fontFamily: F }}>
                      {WILAYAS.map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                {isTeacher && (
                  <div className="field">
                    {/* Placeholder for future teacher fields if needed */}
                  </div>
                )}
              </div>

              <div className="field">
                <label className="label" style={{ fontFamily: F }}>{t('profile', 'bio')}</label>
                <div className="input-wrap" style={{ alignItems: 'flex-start' }}>
                  <textarea value={form.bio} onChange={e => up('bio', e.target.value)} placeholder={isTeacher ? 'Décrivez votre expérience…' : 'Décrivez votre niveau…'} className="input" style={{ fontFamily: F }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.75rem', marginTop: '.2rem' }}>
                <button onClick={save} disabled={loading} className="btn btn-primary btn-md" style={{ fontFamily: F }}>
                  {loading ? <Loader2 size={16} className="spin" /> : t('profile', 'save')}
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-outline btn-md" style={{ fontFamily: F }}>
                  {t('profile', 'cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {[
                { label: t('profile', 'name'),     val: form.fullName,          icon: User },
                { label: t('profile', 'email'),    val: profile?.email ?? '—',  icon: Mail },
                isTeacher
                  ? { label: t('profile', 'specialty'), val: tData(form.specialty), icon: BookOpen }
                  : { label: t('profile', 'level'),     val: tData(form.level),     icon: GraduationCap },
                { label: t('profile', 'wilaya'),   val: form.wilaya,            icon: MapPin },
                { label: t('profile', 'memberSince'), val: joined,             icon: Calendar },
                ...(isTeacher ? [
                  { label: t('profile', 'experience'), val: `${form.experience} ${t('teachers','exp')}`, icon: Star },
                ] : []),
              ].map(({ label, val, icon: Icon }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 1rem', borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: F }}>{label}</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F }}>{val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: '1.4rem',
              paddingTop: '1.2rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                border: '1px solid rgba(239,68,68,.35)',
                background: 'rgba(239,68,68,.07)',
                borderRadius: 'var(--r-lg)',
                padding: '.9rem 1rem',
              }}
            >
              <p style={{ margin: '0 0 .35rem', fontWeight: 700, color: '#ef4444', fontSize: '.86rem', fontFamily: F }}>
                <TriangleAlert size={14} style={{ verticalAlign: 'text-bottom', marginInlineEnd: '.3rem' }} />
                {t('profile', 'dangerZone')}
              </p>
              <p style={{ margin: '0 0 .75rem', fontSize: '.79rem', color: 'var(--text-2)', fontFamily: F }}>
                {t('profile', 'deleteDesc')}
              </p>
              <button type="button" onClick={deleteAccount} className="btn btn-danger btn-sm" style={{ fontFamily: F }}>
                {t('profile', 'deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

