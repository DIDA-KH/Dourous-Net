import ProfileClient from './ProfileClient'
import { getServerUserAndProfile } from '@/lib/auth/session'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/rest'
import { cookies } from 'next/headers'

export default async function ProfilePage() {
  const { user, profile } = await getServerUserAndProfile()
  
  let courseCount = 0
  if (profile?.role === 'teacher' && user?.id) {
    const access = cookies().get('dn_sb_access')?.value
    if (access) {
      try {
        const res = await fetch(`${supabaseUrl()}/rest/v1/courses?select=id&teacher_id=eq.${encodeURIComponent(user.id)}`, {
          headers: { apikey: supabaseAnonKey(), Authorization: `Bearer ${access}` },
          cache: 'no-store'
        })
        if (res.ok) {
          const courses = await res.json().catch(() => [])
          courseCount = courses.length
        }
      } catch {}
    }
  }

  return <ProfileClient profile={profile} user={user} courseCount={courseCount} />
}
