'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, User, Info, LogOut, GraduationCap, BookMarked } from 'lucide-react'
import { useUi } from '@/context/UiContext'

export default function Sidebar({ profile }: { profile: any | null }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { t }    = useUi()
  const isTeacher = profile?.role?.toLowerCase() === 'teacher'

  const NAV = isTeacher ? [
    { href: '/dashboard',          icon: LayoutDashboard, label: t('nav','dashboard') },
    { href: '/dashboard/sessions', icon: BookMarked,      label: t('nav','myCourses') },
    { href: '/dashboard/profile',  icon: User,            label: t('nav','myProfile') },
    { href: '/dashboard/about',    icon: Info,            label: t('nav','about') },
  ] : [
    { href: '/dashboard',           icon: LayoutDashboard, label: t('nav','dashboard') },
    { href: '/dashboard/teachers',  icon: Users,           label: t('nav','teachers') },
    { href: '/dashboard/sessions',  icon: BookOpen,        label: t('nav','sessions') },
    { href: '/dashboard/profile',   icon: User,            label: t('nav','profile') },
    { href: '/dashboard/about',     icon: Info,            label: t('nav','about') },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}

    // Clear local UI cache so another account starts clean.
    try {
      localStorage.removeItem('dn_teacher_ratings')
    } catch {}

    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '1rem 1rem .85rem', borderBottom: '1px solid var(--sidebar-border)', marginBottom: '.35rem', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '.625rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px var(--primary-shadow)', flexShrink: 0 }}>
            <GraduationCap size={17} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '.88rem', color: 'var(--sidebar-text)', letterSpacing: '-.025em', lineHeight: 1.2 }}>Dourous-Net</p>
            <p style={{ margin: 0, fontSize: '.6rem', color: 'var(--sidebar-muted)' }}>دروس نت</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {profile && (
        <div style={{ padding: '0 .85rem .5rem' }}>
          <span className={isTeacher ? 'badge badge-teacher' : 'badge badge-student'} style={{ fontSize: '.67rem' }}>
            {isTeacher ? t('auth','teacher') : t('auth','student')}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '.2rem 0', display: 'flex', flexDirection: 'column', gap: '.05rem' }}>
        <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--sidebar-muted)', display: 'block', padding: '.35rem 1.35rem .25rem' }}>
          {t('nav','menu')}
        </span>
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`nav-item${isActive(href) ? ' active' : ''}`}>
            <Icon size={15} strokeWidth={isActive(href) ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Profile + logout */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '.75rem .65rem .85rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.45rem .7rem', borderRadius: 'var(--r-md)', background: 'rgba(128,128,128,.08)', marginBottom: '.3rem' }}>
          <div className="av av-sm av-circle" style={{ background: 'var(--primary)', boxShadow: '0 2px 5px var(--primary-shadow)', flexShrink: 0, width: 28, height: 28 }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '.78rem', color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name ?? '—'}
            </p>
            <p style={{ margin: 0, fontSize: '.65rem', color: 'var(--sidebar-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.email}
            </p>
          </div>
        </div>
        <button onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '.45rem', width: '100%', padding: '.38rem .85rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--r-md)', fontSize: '.78rem', color: 'var(--sidebar-muted)', transition: 'all .15s', textAlign: 'start' }}
          onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.color='#ef4444'; el.style.background='rgba(239,68,68,.07)'; }}
          onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.color='var(--sidebar-muted)'; el.style.background='none'; }}>
          <LogOut size={13} />
          <span>{t('nav','logout')}</span>
        </button>
      </div>
    </aside>
  )
}
