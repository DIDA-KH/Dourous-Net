import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function POST(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const courseId = body?.courseId

  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

  // Upsert interaction row to mark course as viewed
  const upsertRes = await fetch(
    `${supabaseUrl()}/rest/v1/interactions?on_conflict=user_id,course_id`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
        status: 'completed',
      }),
    }
  )

  if (!upsertRes.ok) {
    const errorText = await upsertRes.text().catch(() => '')
    return NextResponse.json({ error: 'Failed to record view: ' + errorText }, { status: upsertRes.status })
  }

  return NextResponse.json({ ok: true })
}
