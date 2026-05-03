'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { GraduationCap, Star, ArrowRight, CheckCircle, BookOpen, Users, CreditCard, Video, Sun, Moon, Palette, Check, Calendar, Layout, Sparkles, MousePointer2 } from 'lucide-react'
import { useUi, ACCENT_COLORS } from '@/context/UiContext'
import type { Lang } from '@/context/UiContext'

export default function HomePage() {
  const { theme, toggleTheme, accent, setAccent, lang, setLang, t, isRTL } = useUi()
  const [pickerOpen, setPickerOpen] = useState(false)
  const isDark = theme === 'dark'
  const stats = { teachers: 150, sessions: 1250 }

  const LANGS: {code:Lang;label:string}[] = [{code:'fr',label:'FR'},{code:'en',label:'EN'},{code:'ar',label:'ع'}]

  const HOW = [
    { n:'01', title: t('landing','how1Title'), body: t('landing','how1Desc') },
    { n:'02', title: t('landing','how2Title'), body: t('landing','how2Desc') },
    { n:'03', title: t('landing','how3Title'), body: t('landing','how3Desc') }
  ]

  return (
    <div className="landing-page" dir={isRTL?'rtl':'ltr'}>
      {/* Navbar */}
      <nav className="landing-nav glass">
        <Link href="/" className="logo">
          <div className="logo-icon">
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <p className="logo-text">Dourous-Net</p>
            {isRTL && <p className="logo-sub">دروس نت</p>}
          </div>
        </Link>

        <div className="nav-actions">
          <div className="lang-switcher">
            {LANGS.map(({code,label})=>(
              <button key={code}
                onClick={()=>setLang(code)}
                className={`lang-btn${lang===code?' active':''}`}>
                {label}
              </button>
            ))}
          </div>

          <button onClick={toggleTheme} className="icon-btn-round">
            {isDark ? <Moon size={15}/> : <Sun size={15}/>}
          </button>

          <div style={{ position:'relative' }}>
            <button onClick={()=>setPickerOpen(o=>!o)} className="icon-btn-round primary">
              <Palette size={15}/>
            </button>
            {pickerOpen && (
              <div className="accent-dropdown landing-picker">
                <span className="accent-label">{t('theme','color')}</span>
                <div className="accent-grid">
                  {Object.entries(ACCENT_COLORS).map(([key,val])=>(
                    <button key={key} className={`swatch${accent===key?' sel':''}`} style={{ background:val.hex }}
                      onClick={()=>{ setAccent(key); setPickerOpen(false) }}>
                      {accent===key && <Check size={12} color="#fff" strokeWidth={3}/>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Link href="/auth/login" className="btn-link">{t('landing','login')}</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">{t('landing','signup')}</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge fade-up">
              <Sparkles size={12} />
              <span>{t('landing','badge')}</span>
            </div>
            
            <h1 className="hero-title fade-up d1" style={{ color: 'var(--primary)' }}>
              {t('landing','title')}
            </h1>
            
            <p className="hero-subtitle fade-up d2">
              {t('landing','sub')}
            </p>
            
            <div className="hero-cta fade-up d3">
              <Link href="/auth/register" className="btn btn-primary btn-lg shine">
                {t('landing','start')} <ArrowRight size={18}/>
              </Link>
              <Link href="/auth/login" className="btn btn-glass btn-lg">
                {t('landing','login')}
              </Link>
            </div>

            <div className="hero-stats fade-up d4">
              <div className="stat-item">
                <p className="stat-v">{stats.teachers > 0 ? stats.teachers : '50+'}</p>
                <p className="stat-l">{t('landing','activeProfessors')}</p>
              </div>
              <div className="stat-item">
                <p className="stat-v">{stats.sessions > 0 ? `${stats.sessions}+` : '1.2k+'}</p>
                <p className="stat-l">{t('landing','sessionsCompleted')}</p>
              </div>
              <div className="stat-item">
                <p className="stat-v">12</p>
                <p className="stat-l">{t('landing','subjects')}</p>
              </div>
            </div>
          </div>

          <div className="hero-visual fade-up d2">
            {/* 3D Icons Floating */}
            <div className="floating-asset asset-1">
              <Image
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=500"
                alt="Books Stack"
                className="asset-img"
                fill
                loading="lazy"
                sizes="(max-width: 992px) 40vw, 300px"
                style={{ objectFit: 'cover', borderRadius: '12px' }}
              />
            </div>

            <div className="floating-ui-card card-1">
              <Calendar size={20} color="var(--primary)" />
              <div>
                <p className="f-title">{t('landing','nextSession')}</p>
                <p className="f-sub">{t('landing','tomorrow')}</p>
              </div>
            </div>
            <div className="floating-ui-card card-2">
              <CheckCircle size={20} color="#16a34a" />
              <div>
                <p className="f-title">{t('landing','hwCorrected')}</p>
                <p className="f-sub">{lang==='ar' ? 'الرياضيات' : 'Mathématiques'}</p>
              </div>
            </div>
            <div className="floating-ui-card card-3">
              <MousePointer2 size={16} color="var(--primary)" />
              <span style={{ fontSize:'.75rem', fontWeight:600 }}>{t('landing','bookNowCard')}</span>
            </div>

            <div className="hero-main-visual">
               <Image
                 src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1600"
                 alt="Library"
                 className="hero-img"
                 fill
                 priority
                 sizes="(max-width: 992px) 100vw, 40vw"
                 style={{ objectFit: 'cover', borderRadius: '16px' }}
               />
               <div className="visual-overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('landing','whyTitle')}</h2>
            <p className="section-subtitle">{t('landing','whySub')}</p>
          </div>

          <div className="features-grid">
            {[
              { icon: Users, title: t('landing','feat1Title'), desc: t('landing','feat1Desc') },
              { icon: Layout, title: t('landing','feat4Title'), desc: t('landing','feat4Desc') }
            ].map((f, i) => (
              <div key={i} className="feature-card glass-card">
                <div className="feature-icon">
                  <f.icon size={24} color="var(--primary)" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('landing','howTitle')}</h2>
          </div>

          <div className="how-grid">
            {HOW.map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-number">{h.n}</div>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
               <GraduationCap size={20} color="var(--primary)" />
               <span>Dourous-Net</span>
            </div>
            <p className="copyright">{t('common','copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
