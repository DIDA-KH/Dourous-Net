'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useUi } from '@/context/UiContext'

const LEVELS = ['Primaire','Moyen (CEM)','Lycée','Université'];
const WILAYAS = ['Alger','Oran','Constantine','Annaba','Batna','Sétif','Blida','Béjaïa'];
const SPECIALTIES = ['Mathématiques','Physique-Chimie','Français','Anglais','Informatique','Chimie','Sciences Naturelles','Histoire-Géographie','Sciences islamiques'];

type Role = 'student' | 'teacher'

export default function RegisterPage() {
  const { t, tData, isRTL } = useUi()
  const router = useRouter()
  const [role, setRole]   = useState<Role>('student')
  const [form, setForm]   = useState({ fullName:'', email:'', password:'', level:'Lycée', wilaya:'Alger', specialty:'Mathématiques' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone]   = useState(false)

  const up = (k:string,v:string) => setForm(f=>({...f,[k]:v}))
  const F  = isRTL ? 'Cairo, var(--font)' : 'var(--font)'

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (form.password.length<8) { setError(`${t('auth','password')}: ${t('auth','minPw')}`); return }
    setLoading(true); setError('')
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.fullName,
        role,
        wilaya: form.wilaya,
        level: role === 'student' ? form.level : undefined,
        specialty: role === 'teacher' ? form.specialty : undefined,
      }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      setError(String(json?.error ?? 'Registration failed'))
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:'2rem' }} dir={isRTL?'rtl':'ltr'}>
      <div style={{ maxWidth:420,width:'100%',background:'var(--bg-alt)',border:'1px solid var(--border)',borderRadius:'var(--r-2xl)',padding:'2.5rem',textAlign:'center',boxShadow:'var(--shadow-xl)' }}>
        <div style={{ width:56,height:56,borderRadius:'var(--r-full)',background:'rgba(22,163,74,.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem' }}>
          <CheckCircle size={28} color="#16a34a"/>
        </div>
        <h2 style={{ fontWeight:800,fontSize:'1.5rem',color:'var(--text)',marginBottom:'.6rem',fontFamily:F }}>{t('auth','successTitle')}</h2>
        <p style={{ fontSize:'.9rem',color:'var(--text-3)',lineHeight:1.65,marginBottom:'2rem',fontFamily:F }}>{t('auth','successDesc')}</p>
        <button
          type="button"
          className="btn btn-primary btn-md"
          style={{ display:'flex',width:'100%',justifyContent:'center',fontFamily:F }}
          onClick={() => router.push('/dashboard')}
        >
          {t('auth','goLogin')}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:'2rem', position: 'relative' }} dir={isRTL?'rtl':'ltr'}>
      <Link href="/" style={{ position: 'absolute', top: '2rem', left: isRTL ? 'auto' : '2rem', right: isRTL ? '2rem' : 'auto', display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: 'var(--text-3)', fontWeight: 600, transition: 'color .15s', fontFamily: F }} onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--text-3)')}>
        <ArrowLeft size={16} /> {t('common','back')}
      </Link>
      <div style={{ width:'100%',maxWidth:480 }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'2rem' }}>
          <div style={{ width:32,height:32,borderRadius:'.5rem',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 8px var(--primary-shadow)' }}>
            <GraduationCap size={16} color="#fff"/>
          </div>
          <span style={{ fontWeight:800,color:'var(--text)',letterSpacing:'-.025em',fontFamily:F }}>Dourous-Net</span>
        </div>

        <div className="card" style={{ padding:'2rem 2.25rem' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem' }}>
            <h1 style={{ fontWeight:800,fontSize:'1.6rem',letterSpacing:'-.04em',color:'var(--text)',margin:0,fontFamily:F }}>{t('auth','registerTitle')}</h1>
            
            {/* Quick Role Toggle instead of a separate page */}
            <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '.25rem', border: '1px solid var(--border)' }}>
              <button 
                type="button"
                onClick={() => setRole('student')} 
                style={{ 
                  background: role === 'student' ? 'var(--primary)' : 'transparent',
                  color: role === 'student' ? '#fff' : 'var(--text-3)',
                  border: 'none', padding: '.4rem .8rem', borderRadius: 'var(--r-sm)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: F
                }}
              >
                {t('auth','student')}
              </button>
              <button 
                type="button"
                onClick={() => setRole('teacher')} 
                style={{ 
                  background: role === 'teacher' ? 'var(--primary)' : 'transparent',
                  color: role === 'teacher' ? '#fff' : 'var(--text-3)',
                  border: 'none', padding: '.4rem .8rem', borderRadius: 'var(--r-sm)', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: F
                }}
              >
                {t('auth','teacher')}
              </button>
            </div>
          </div>

          <p style={{ fontSize:'.875rem',color:'var(--text-3)',marginBottom:'1.5rem',fontFamily:F }}>
            {t('auth','hasAccount')}{' '}
            <Link href="/auth/login" style={{ color:'var(--primary)',fontWeight:600,fontFamily:F }}>{t('auth','loginLink')}</Link>
          </p>

          {error && (
            <div className="err-box" style={{ display:'flex',gap:'.6rem',marginBottom:'1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink:0,marginTop:'.05rem' }}/>
              <div>
                <p style={{ margin:0,fontWeight:600,fontFamily:F }}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
            <div className="field">
              <label className="label" style={{ fontFamily:F }}>{t('auth','fullName')} *</label>
              <div className="input-wrap">
                <input type="text" value={form.fullName} onChange={e=>up('fullName',e.target.value)} placeholder={isRTL?'أحمد بن سالم':'Ahmed Bensalem'} required className="input" autoComplete="name" style={{ fontFamily:F }}/>
              </div>
            </div>
            <div className="field">
              <label className="label" style={{ fontFamily:F }}>{t('auth','email')} *</label>
              <div className="input-wrap">
                <input type="email" value={form.email} onChange={e=>up('email',e.target.value)} placeholder="ahmed@exemple.com" required className="input" autoComplete="email"/>
              </div>
            </div>

            {role==='teacher' ? (
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem' }}>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('auth','specialty')}</label>
                  <div className="input-wrap">
                    <select value={form.specialty} onChange={e=>up('specialty',e.target.value)} className="input" style={{ fontFamily:F }}>
                      {SPECIALTIES.map(s=><option key={s} value={s}>{tData(s)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('auth','wilaya')}</label>
                  <div className="input-wrap">
                    <select value={form.wilaya} onChange={e=>up('wilaya',e.target.value)} className="input" style={{ fontFamily:F }}>
                      {WILAYAS.map(w=><option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem' }}>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('auth','level')}</label>
                  <div className="input-wrap">
                    <select value={form.level} onChange={e=>up('level',e.target.value)} className="input" style={{ fontFamily:F }}>
                      {LEVELS.map(l=><option key={l} value={l}>{tData(l)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('auth','wilaya')}</label>
                  <div className="input-wrap">
                    <select value={form.wilaya} onChange={e=>up('wilaya',e.target.value)} className="input" style={{ fontFamily:F }}>
                      {WILAYAS.map(w=><option key={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="field">
              <label className="label" style={{ fontFamily:F }}>
                {t('auth','password')} * <span style={{ fontWeight:400,color:'var(--text-4)',fontSize:'.78rem' }}>{t('auth','minPw')}</span>
              </label>
              <div className="input-wrap">
                <input type={show?'text':'password'} value={form.password} onChange={e=>up('password',e.target.value)} placeholder="••••••••" required className="input" autoComplete="new-password" style={{ fontFamily:F }}/>
                <button type="button" onClick={()=>setShow(!show)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-4)',display:'flex',padding:0,flexShrink:0 }}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-md" style={{ width:'100%',justifyContent:'center',padding:'.72rem',marginTop:'.2rem',fontFamily:F }}>
              {loading?<Loader2 size={17} className="spin"/>:t('auth','submitReg')}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center',marginTop:'1.25rem',fontSize:'.75rem',color:'var(--text-4)',fontFamily:F }}>
          {t('auth','terms')}
        </p>
      </div>
    </div>
  )
}
