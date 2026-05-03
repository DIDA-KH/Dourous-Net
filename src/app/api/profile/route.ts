import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseUpdateProfile } from '@/lib/supabase/rest'

export async function PATCH(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const patch: Record<string, any> = {}

  if (body.full_name !== undefined) patch.full_name = String(body.full_name).trim()
  if (body.bio !== undefined) patch.bio = String(body.bio).trim()
  if (body.wilaya !== undefined) patch.wilaya = String(body.wilaya).trim()
  if (body.level !== undefined) patch.level = String(body.level).trim()
  if (body.specialty !== undefined) patch.specialty = String(body.specialty).trim()
  if (body.experience_years !== undefined) patch.experience_years = Number(body.experience_years) || 0

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabaseUpdateProfile({
    accessToken: access,
    userId,
    patch,
  })

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
