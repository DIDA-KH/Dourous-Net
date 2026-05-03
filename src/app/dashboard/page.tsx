import { getServerLang } from '@/lib/i18n'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import StudentDashboard from '@/components/dashboard/StudentDashboard'

import { getServerUserAndProfile } from '@/lib/auth/session'

export default async function DashboardPage() {
  const lang = getServerLang()
  const { user, profile } = await getServerUserAndProfile()
  const isTeacher = profile?.role?.toLowerCase() === 'teacher'

  return (
    <div style={{ width: '100%' }}>
      {isTeacher ? (
        <TeacherDashboard user={user} profile={profile} lang={lang} />
      ) : (
        <StudentDashboard user={user} profile={profile} lang={lang} />
      )}
    </div>
  )
}
