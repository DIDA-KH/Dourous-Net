'use client'
import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Palette, Check } from 'lucide-react'
import { useUi, ACCENT_COLORS } from '@/context/UiContext'
import type { Lang } from '@/context/UiContext'

export default function Topbar({ title, subtitle, userName }: { title?: string; subtitle?: string; userName?: string }) {
  const { theme, setTheme, toggleTheme, accent, setAccent, lang, setLang, t } = useUi()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const LANGS: { code: Lang; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ]

  return (
    <div className="topbar">
      {/* Left */}
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '.95rem', color: 'var(--text)', letterSpacing: '-.02em', lineHeight: 1.3 }}>
          {title || 'Dourous-Net'}
        </p>
        {subtitle && <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexShrink: 0 }}>
        {/* Theme toggle - defer icon to avoid hydration mismatch */}
        <button onClick={toggleTheme} className="icon-btn" title={t('theme', 'appearance')}>
          {!mounted ? <Sun size={15} /> : (theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />)}
        </button>

        {/* Accent + appearance picker */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setOpen(o => !o)} className={`icon-btn${open ? ' accent-active' : ''}`} title={t('theme', 'color')}>
            <Palette size={15} />
          </button>
          
          {open && (
            <div className="accent-dropdown">
              <span className="accent-label">{t('theme', 'color')}</span>
              <div className="accent-grid">
                {Object.entries(ACCENT_COLORS).map(([key, val]) => (
                  <button key={key} className={`swatch${accent === key ? ' sel' : ''}`}
                    style={{ background: val.hex }} title={val.name}
                    onClick={() => { setAccent(key); setOpen(false) }}>
                    {mounted && accent === key && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>

              <div className="theme-row">
                <span className="accent-label" style={{ margin: 0 }}>{t('theme', 'appearance')}</span>
                <div style={{ display: 'flex', gap: '.35rem', flex: 1, justifyContent: 'flex-end' }}>
                  {(['light', 'dark'] as const).map(th => (
                    <button key={th} className={`theme-pill${mounted && theme === th ? ' on' : ''}`} onClick={() => setTheme(th)}>
                      {th === 'light' ? '☀' : '🌙'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
                <span className="accent-label">{t('theme', 'lang')}</span>
                <div style={{ display: 'flex', gap: '.35rem', flexDirection: 'column' }}>
                  {LANGS.map(({ code, label }) => (
                    <button key={code}
                      className={`theme-pill${lang === code ? ' on' : ''}`}
                      style={{ textAlign: 'start', padding: '.5rem 1rem', width: '100%', fontFamily: code === 'ar' ? 'Cairo, sans-serif' : 'inherit' }}
                      onClick={() => { 
                        setLang(code); 
                        setOpen(false); 
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {userName && (
          <div className="av av-md av-circle" style={{ boxShadow: '0 2px 6px var(--primary-shadow)', fontSize: '.85rem' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
