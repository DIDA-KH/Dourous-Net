'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useUi } from '@/context/UiContext'

export default function LoginPage() {
  const router = useRouter()
  const { t, isRTL } = useUi()
  
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const normalizedEmail = email.trim().toLowerCase()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: pw }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      setError(String(json?.error ?? 'Login failed'))
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'

  return (
    <div style={{ minHeight:'100vh',display:'flex',background:'var(--bg)' }} dir={isRTL?'rtl':'ltr'}>
      {/* Left brand */}
      <div style={{ width:'42%',minWidth:300,background:'var(--sidebar-bg)',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'2.5rem' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:'.65rem' }}>
          <div style={{ width:34,height:34,borderRadius:'.65rem',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 8px var(--primary-shadow)' }}>
            <GraduationCap size={18} color="#fff"/>
          </div>
          <span style={{ fontWeight:800,fontSize:'1rem',color:'var(--sidebar-text)',letterSpacing:'-.025em',fontFamily:F }}>Dourous-Net</span>
        </Link>
        <div>
          <h2 style={{ fontWeight:800,fontSize:'2.5rem',letterSpacing:'-.04em',color:'var(--sidebar-text)',lineHeight:1.1,marginBottom:'1rem',fontFamily:F }}>
            {t('auth','welcomeBack')}<br/>
            <span style={{ color:'var(--primary)' }}>Dourous-Net.</span>
          </h2>
          <p suppressHydrationWarning style={{ fontSize:'.88rem',color:'var(--sidebar-muted)',lineHeight:1.75,maxWidth:280,fontFamily:F }}>
            {t('auth','loginDesc')}
          </p>
        </div>
        <p style={{ fontSize:'.72rem',color:'var(--sidebar-muted)',opacity:.45,fontFamily:F }}>{t('common','copyright')}</p>
      </div>

      {/* Right form */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', top: '2rem', left: isRTL ? 'auto' : '2rem', right: isRTL ? '2rem' : 'auto', display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: 'var(--text-3)', fontWeight: 600, transition: 'color .15s', fontFamily: F }} onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <ArrowLeft size={16} /> {t('common','back')}
        </Link>
        <div style={{ width:'100%',maxWidth:400 }}>
          <h1 style={{ fontWeight:800,fontSize:'1.7rem',letterSpacing:'-.04em',color:'var(--text)',marginBottom:'.4rem',fontFamily:F }}>{t('auth','loginTitle')}</h1>
          <p style={{ fontSize:'.875rem',color:'var(--text-3)',marginBottom:'2rem',fontFamily:F }}>
            {t('auth','noAccount')}{' '}
            <Link href="/auth/register" style={{ color:'var(--primary)',fontWeight:600,fontFamily:F }}>{t('auth','createAccount')}</Link>
          </p>

          {error && (
            <div className="err-box" style={{ display:'flex',gap:'.6rem',marginBottom:'1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink:0,marginTop:'.05rem' }}/>
              <div>
                <p style={{ margin:0,fontWeight:600,fontFamily:F }}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            <div className="field">
              <label className="label" style={{ fontFamily:F }}>{t('auth','email')}</label>
              <div className="input-wrap">
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" required className="input" autoComplete="email" style={{ fontFamily:F }}/>
              </div>
            </div>
            <div className="field">
              <label className="label" style={{ fontFamily:F }}>{t('auth','password')}</label>
              <div className="input-wrap">
                <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" required className="input" autoComplete="current-password" style={{ fontFamily:F }}/>
                <button type="button" onClick={()=>setShow(!show)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-4)',display:'flex',padding:0,flexShrink:0 }}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-md" style={{ width:'100%',justifyContent:'center',padding:'.72rem',marginTop:'.2rem',fontFamily:F }}>
              {loading?<Loader2 size={17} className="spin"/>:t('auth','submit')}
            </button>
          </form>

          <div style={{ display:'flex',alignItems:'center',gap:'1rem',margin:'1.4rem 0' }}>
            <hr className="divider" style={{ flex:1 }}/>
            <span style={{ fontSize:'.75rem',color:'var(--text-4)',fontFamily:F }}>{t('common','or')}</span>
            <hr className="divider" style={{ flex:1 }}/>
          </div>

          <Link href="/auth/register" className="btn btn-outline btn-md" style={{ width:'100%',display:'flex',justifyContent:'center',fontFamily:F }}>
            {t('auth','createAccount')}
          </Link>
        </div>
      </div>
    </div>
  )
}

