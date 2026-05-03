import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function GET() {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  // RLS on interactions ensures only own rows are returned
  const res = await fetch(
    `${supabaseUrl()}/rest/v1/interactions?select=id,status,interaction_date,created_at,course_id,file_path,file_mime&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
      },
    }
  )

  const text = await res.text().catch(() => '')
  if (!res.ok) return NextResponse.json({ error: text || res.statusText }, { status: 400 })

  let interactions: any[] = []
  try {
    interactions = JSON.parse(text)
  } catch {}

  return NextResponse.json({ interactions })
}

