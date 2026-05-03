import { getServerLang, ts } from '@/lib/i18n'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { getServerUserAndProfile } from '@/lib/auth/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getServerUserAndProfile()
  
  const lang = getServerLang()
  const t    = (s: string, k: string) => ts(lang as any, s, k)

  const isTeacher = profile?.role?.toLowerCase() === 'teacher'
  const subtitle = isTeacher
    ? ((profile as any)?.specialty ?? t('nav','dashboard'))
    : ((profile as any)?.level ?? t('nav','dashboard'))

  return (
    <div className="app-shell">
      <Sidebar profile={profile} />
      <main className="main-content">
        <div className="page-wrap">
          <Topbar
            title="Dourous-Net"
            subtitle={subtitle ?? undefined}
            userName={profile?.full_name ?? undefined}
          />
          {children}
        </div>
      </main>
    </div>
  )
}
