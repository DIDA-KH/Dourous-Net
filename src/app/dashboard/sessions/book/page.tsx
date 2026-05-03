'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, MapPin, Clock, Upload, Loader2, CheckCircle, FileText, X, BookOpen, Video, CreditCard } from 'lucide-react'
import { useUi } from '@/context/UiContext'

export default function BookSessionPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const tid          = searchParams.get('teacherId')
  const { t, isRTL } = useUi()

  const [teachers, setTeachers] = useState<any[]>([])
  const [teacher,  setTeacher]  = useState<any | null>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({ tid: tid??'', subject:'', message:'', date:'', duration:'60' })

  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'

  useEffect(() => {
    // MOCK TEACHERS
    const mockTeachers = [
      { id: 't1', full_name: 'Dr. Smith', specialty: 'Mathématiques', hourly_rate: 1500, rating: 4.8, wilaya: 'Alger', experience_years: 10, bio: 'Prof de Math', google_meet_link: 'yes', total_sessions: 120 }
    ]
    setTeachers(mockTeachers)
    if (tid) setTeacher(mockTeachers.find(p=>p.id===tid)??null)
  },[])

  useEffect(() => {
    if (form.tid && teachers.length) setTeacher(teachers.find(p=>p.id===form.tid)??null)
  },[form.tid,teachers])

  const up = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    // Mock submission
    setTimeout(() => {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/sessions'), 350)
    }, 150)
  }

  const estimatedPrice = teacher?.hourly_rate
    ? (teacher.hourly_rate * parseInt(form.duration||'60') / 60).toLocaleString()
    : null

  if (success) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:60,height:60,borderRadius:'var(--r-full)',background:'rgba(22,163,74,.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem' }}>
          <CheckCircle size={30} color="#16a34a"/>
        </div>
        <h2 style={{ fontWeight:800,fontSize:'1.4rem',color:'var(--text)',marginBottom:'.5rem',fontFamily:F }}>{t('booking','successTitle')}</h2>
        <p style={{ fontSize:'.875rem',color:'var(--text-3)',fontFamily:F }}>{t('booking','successDesc')}</p>
      </div>
    </div>
  )

  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <div className="fade-up" style={{ marginBottom:'1.65rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)' }}>
        <Link href="/dashboard/teachers"
          style={{ display:'inline-flex',alignItems:'center',gap:'.4rem',fontSize:'.82rem',color:'var(--text-3)',marginBottom:'1rem',transition:'color .15s',fontFamily:F }}
          onMouseOver={e=>(e.currentTarget.style.color='var(--text)')}
          onMouseOut={e=>(e.currentTarget.style.color='var(--text-3)')}>
          <ArrowLeft size={13}/> {t('booking','backToTeachers')}
        </Link>
        <p className="kicker" style={{ marginBottom:'.3rem',fontFamily:F }}>Nouvelle interaction</p>
        <h1 className="page-title" style={{ fontFamily:F }}>{t('booking','title')}</h1>
      </div>

      <div className="fade-up d1" style={{ display:'grid',gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr)',gap:'1.5rem' }}>

        {/* Form */}
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          {error && (
            <div className="err-box" style={{ display:'flex',gap:'.6rem' }}>
              <span style={{ flexShrink:0 }}>⚠️</span>
              <div>
                <p style={{ margin:0,fontWeight:600,fontFamily:F }}>{error}</p>
                {error.toLowerCase().includes('path') && <p style={{ margin:'.3rem 0 0',fontSize:'.78rem',opacity:.8,fontFamily:F }}>{t('auth','configHint')}</p>}
              </div>
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
            {/* Session details */}
            <div className="card">
              <p style={{ margin:'0 0 1rem',fontWeight:700,fontSize:'1rem',color:'var(--text)',fontFamily:F }}>{t('booking','detailsSection')}</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('booking','teacherLabel')}</label>
                  <div className="input-wrap">
                    <select value={form.tid} onChange={e=>up('tid',e.target.value)} required className="input" style={{ fontFamily:F }}>
                      <option value="">{t('booking','chooseTeacher')}</option>
                      {teachers.map(p=><option key={p.id} value={p.id}>{p.full_name} · {p.specialty}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('booking','subjectLabel')}</label>
                  <div className="input-wrap">
                    <input type="text" value={form.subject} onChange={e=>up('subject',e.target.value)} placeholder={t('booking','subjectPlaceholder')} required className="input" style={{ fontFamily:F }}/>
                  </div>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.85rem' }}>
                  <div className="field">
                    <label className="label" style={{ fontFamily:F }}>{t('booking','dateLabel')}</label>
                    <div className="input-wrap">
                      <input type="datetime-local" value={form.date} onChange={e=>up('date',e.target.value)} min={new Date().toISOString().slice(0,16)} required className="input"/>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label" style={{ fontFamily:F }}>{t('booking','durationLabel')}</label>
                    <div className="input-wrap">
                      <select value={form.duration} onChange={e=>up('duration',e.target.value)} className="input" style={{ fontFamily:F }}>
                        {[['30',t('booking','d30')],['60',t('booking','d60')],['90',t('booking','d90')],['120',t('booking','d120')]].map(([v,l])=>(
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="label" style={{ fontFamily:F }}>{t('booking','messageLabel')} <span style={{ fontWeight:400,color:'var(--text-4)',fontSize:'.78rem' }}>{t('booking','messageOpt')}</span></label>
                  <div className="input-wrap" style={{ alignItems:'flex-start' }}>
                    <textarea value={form.message} onChange={e=>up('message',e.target.value)} placeholder={t('booking','messagePlaceholder')} className="input" style={{ fontFamily:F }}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Homework */}
            <div className="card">
              <p style={{ margin:'0 0 .3rem',fontWeight:700,fontSize:'1rem',color:'var(--text)',fontFamily:F }}>
                {t('booking','hwSection')}
              </p>
              <p style={{ margin:'0 0 1rem',fontSize:'.82rem',color:'var(--text-3)',fontFamily:F }}>{t('booking','hwDesc')}</p>
              {file ? (
                <div style={{ display:'flex',alignItems:'center',gap:'.85rem',padding:'.82rem 1rem',border:'1px solid var(--primary)',borderRadius:'var(--r-lg)',background:'var(--primary-soft)' }}>
                  <div style={{ width:36,height:36,borderRadius:'var(--r-md)',background:'var(--primary-soft)',border:'1px solid var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <FileText size={18} color="var(--primary)"/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ margin:0,fontWeight:600,fontSize:'.85rem',color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{file.name}</p>
                    <p style={{ margin:0,fontSize:'.74rem',color:'var(--text-3)' }}>{(file.size/1024).toFixed(0)} Ko</p>
                  </div>
                  <button type="button" onClick={()=>setFile(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',display:'flex',padding:'.2rem',borderRadius:'var(--r-sm)' }}
                    onMouseOver={e=>(e.currentTarget.style.color='#dc2626')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-3)')}>
                    <X size={16}/>
                  </button>
                </div>
              ) : (
                <label className="dropzone">
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={e=>setFile(e.target.files?.[0]??null)}/>
                  <Upload size={22} style={{ color:'var(--text-4)',margin:'0 auto .65rem',display:'block' }}/>
                  <p style={{ fontWeight:600,fontSize:'.875rem',color:'var(--text)',margin:'0 0 .25rem',fontFamily:F }}>{t('booking','hwClick')}</p>
                  <p style={{ fontSize:'.78rem',color:'var(--text-3)',margin:0,fontFamily:F }}>{t('booking','hwInfo')}</p>
                </label>
              )}
            </div>

            {/* Payment info */}
            {teacher?.dahabia_number && (
              <div className="dahabia-box">
                <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.6rem' }}>
                  <CreditCard size={16} color="#ea580c"/>
                  <p style={{ margin:0,fontWeight:700,fontSize:'.9rem',color:'var(--text)',fontFamily:F }}>{t('booking','paySection')}</p>
                </div>
                <p style={{ margin:'0 0 .5rem',fontSize:'.82rem',color:'var(--text-3)',fontFamily:F }}>{t('booking','payDesc')}</p>
                <div style={{ padding:'.65rem .85rem',borderRadius:'var(--r-md)',background:'rgba(255,255,255,.5)',border:'1px solid rgba(234,88,12,.2)' }}>
                  <p style={{ margin:'0 0 .2rem',fontSize:'.72rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:F }}>{t('booking','teacherDahabia')}</p>
                  <p style={{ margin:0,fontWeight:800,fontSize:'1.1rem',color:'#ea580c',letterSpacing:'.04em',fontFamily:'monospace' }}>
                    {teacher.dahabia_number}
                  </p>
                </div>
                {estimatedPrice && (
                  <p style={{ margin:'.65rem 0 0',fontSize:'.82rem',fontWeight:600,color:'var(--text)',fontFamily:F }}>
                    {t('booking','totalSession')} : <span style={{ color:'var(--primary)' }}>{estimatedPrice} DA</span>
                  </p>
                )}
              </div>
            )}

            {/* Meet info */}
            {teacher?.google_meet_link && (
              <div style={{ padding:'.85rem 1rem',borderRadius:'var(--r-lg)',background:'rgba(22,163,74,.06)',border:'1px solid rgba(22,163,74,.2)',display:'flex',alignItems:'center',gap:'.75rem' }}>
                <Video size={18} color="#16a34a"/>
                <div>
                  <p style={{ margin:'0 0 .15rem',fontWeight:700,fontSize:'.88rem',color:'var(--text)',fontFamily:F }}>Google Meet disponible</p>
                  <p style={{ margin:0,fontSize:'.8rem',color:'var(--text-3)',fontFamily:F }}>Le lien Google Meet sera accessible après confirmation.</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-md" style={{ width:'100%',justifyContent:'center',padding:'.75rem',fontSize:'.9rem',fontFamily:F }}>
              {loading?<Loader2 size={17} className="spin"/>:t('booking','confirm')}
            </button>
          </form>
        </div>

        {/* Teacher panel */}
        <div>
          {teacher ? (
            <div className="card" style={{ padding:0,overflow:'hidden',position:'sticky',top:'1.5rem' }}>
              <div style={{ padding:'1.35rem',background:'var(--sidebar-bg)' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'.85rem',marginBottom:'.85rem' }}>
                  <div className="av av-xl" style={{ boxShadow:'0 4px 10px var(--primary-shadow)' }}>{teacher.full_name.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight:700,color:'var(--sidebar-text)',fontSize:'1rem',margin:'0 0 .2rem',fontFamily:F }}>{teacher.full_name}</p>
                    <p style={{ fontSize:'.82rem',color:'var(--sidebar-muted)',margin:0,fontFamily:F }}>{teacher.specialty}</p>
                  </div>
                </div>
                <div style={{ display:'flex',gap:'1.1rem',flexWrap:'wrap' }}>
                  {[
                    { I:Star, v:`${Number(teacher.rating).toFixed(1)} / 5`, fill:'#f59e0b' },
                    { I:MapPin, v:teacher.wilaya??'—' },
                    { I:Clock, v:`${teacher.experience_years??0} ans` },
                  ].map(({I,v,fill},i)=>(
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:'.3rem',fontSize:'.78rem',color:'var(--sidebar-muted)' }}>
                      <I size={11} color={fill??'currentColor'} fill={i===0?fill:'none'}/> {v}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:'1.35rem' }}>
                {teacher.bio && <p style={{ fontSize:'.85rem',lineHeight:1.7,color:'var(--text-3)',marginBottom:'1rem',fontFamily:F }}>{teacher.bio}</p>}
                {teacher.total_sessions>0 && (
                  <div style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'1rem',fontSize:'.82rem',color:'var(--text-3)',fontFamily:F }}>
                    <BookOpen size={14}/> {teacher.total_sessions} {t('booking','sessionsCount')||'séances réalisées'}
                  </div>
                )}
                {teacher.google_meet_link && (
                  <div style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'1rem',fontSize:'.82rem',color:'#16a34a' }}>
                    <Video size={14}/> Google Meet activé
                  </div>
                )}
                {teacher.hourly_rate && (
                  <div style={{ paddingTop:'1rem',borderTop:'1px solid var(--border)' }}>
                    <p style={{ fontSize:'.72rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .3rem',fontFamily:F }}>{t('booking','tarif')}</p>
                    <p style={{ fontWeight:800,fontSize:'1.75rem',color:'var(--text)',letterSpacing:'-.04em',margin:0,fontFamily:F }}>
                      {Number(teacher.hourly_rate).toLocaleString()} DA
                    </p>
                    <p style={{ fontSize:'.75rem',color:'var(--text-3)',margin:'.1rem 0 0',fontFamily:F }}>{t('booking','perHour')}</p>
                    {estimatedPrice && (
                      <div style={{ marginTop:'.75rem',padding:'.6rem .85rem',borderRadius:'var(--r-md)',background:'var(--primary-soft)',border:'1px solid var(--primary-soft)' }}>
                        <p style={{ margin:0,fontSize:'.8rem',fontWeight:600,color:'var(--primary)',fontFamily:F }}>
                          {t('booking','totalSession')} : {estimatedPrice} DA
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ border:'2px dashed var(--border)',borderRadius:'var(--r-xl)',padding:'3rem 2rem',textAlign:'center' }}>
              <div style={{ width:44,height:44,borderRadius:'var(--r-xl)',background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto .85rem' }}>
                <BookOpen size={20} style={{ color:'var(--text-4)' }}/>
              </div>
              <p style={{ fontSize:'.875rem',color:'var(--text-3)',margin:0,fontFamily:F }}>{t('booking','selectFirst')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
