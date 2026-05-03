'use client'
import { GraduationCap, Shield, CreditCard, Video, Users, BookOpen } from 'lucide-react'
import { useUi } from '@/context/UiContext'

export default function AboutPage() {
  const { t, isRTL } = useUi()
  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'

  const cards = [
    { icon: Users,      title: t('about','mission'),  desc: t('about','missionDesc') },
    { icon: Shield,     title: t('about','security'), desc: t('about','securityDesc') },
  ]


  return (
    <div dir={isRTL?'rtl':'ltr'}>
      <div className="fade-up" style={{ marginBottom:'1.65rem',paddingBottom:'1.2rem',borderBottom:'1px solid var(--border)' }}>
        <p className="kicker" style={{ marginBottom:'.3rem',fontFamily:F }}>{t('about','kicker')}</p>
        <h1 className="page-title" style={{ fontFamily:F }}>{t('about','title')}</h1>
        <p className="page-sub" style={{ fontFamily:F }}>{t('about','sub')}</p>
      </div>

      {/* Hero */}
      <div className="card fade-up d1" style={{ padding:'2rem 2.25rem',marginBottom:'1.25rem',background:'var(--sidebar-bg)',border:'none' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.25rem' }}>
          <div style={{ width:52,height:52,borderRadius:'var(--r-xl)',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px var(--primary-shadow)',flexShrink:0 }}>
            <GraduationCap size={26} color="#fff"/>
          </div>
          <div>
            <h2 style={{ fontWeight:800,fontSize:'1.35rem',color:'var(--sidebar-text)',letterSpacing:'-.03em',margin:'0 0 .2rem',fontFamily:F }}>Dourous-Net</h2>
            <p style={{ margin:0,fontSize:'.82rem',color:'var(--sidebar-muted)',fontFamily:F }}>دروس نت — {t('about','sub')}</p>
          </div>
        </div>
        <p style={{ fontSize:'.95rem',lineHeight:1.75,color:'var(--sidebar-muted)',maxWidth:600,margin:0,fontFamily:F }}>
          {t('about','desc')}
        </p>
      </div>

      {/* Stats */}
      <div className="fade-up d2" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.25rem' }}>
        {[
          { v:'10', l:isRTL?'ألوان الواجهة':'Couleurs d\'accent' },
          { v:'2',  l:isRTL?'ثيمات':'Thèmes (Clair/Sombre)' },
          { v:'3',  l:isRTL?'لغات':'Langues (FR/EN/AR)' },
          { v:'RLS',l:isRTL?'حماية البيانات':'Sécurité des données' },
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{ textAlign:'center',padding:'1.5rem 1rem' }}>
            <p style={{ fontWeight:800,fontSize:'2rem',color:'var(--primary)',letterSpacing:'-.04em',lineHeight:1,margin:'0 0 .35rem',fontFamily:F }}>{s.v}</p>
            <p style={{ fontSize:'.76rem',color:'var(--text-3)',margin:0,fontFamily:F }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="fade-up d3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem' }}>
        {cards.map((c,i)=>(
          <div key={i} style={{ padding:'1.35rem',borderRadius:'var(--r-xl)',background:'var(--surface)',border:'1px solid var(--border)' }}>
            <div style={{ width:40,height:40,borderRadius:'var(--r-lg)',background:'var(--primary-soft)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'.85rem' }}>
              <c.icon size={18} color="var(--primary)"/>
            </div>
            <h3 style={{ fontWeight:700,fontSize:'.95rem',color:'var(--text)',marginBottom:'.4rem',fontFamily:F }}>{c.title}</h3>
            <p style={{ fontSize:'.85rem',lineHeight:1.65,color:'var(--text-3)',margin:0,fontFamily:F }}>{c.desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
