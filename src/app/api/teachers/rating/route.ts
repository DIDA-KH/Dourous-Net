import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function POST(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || !body.teacherId || !body.rating) {
    return NextResponse.json({ error: 'Missing teacherId or rating' }, { status: 400 })
  }

  // Call the custom RPC function to update the teacher's rating
  const res = await fetch(`${supabaseUrl()}/rest/v1/rpc/rate_teacher`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ p_teacher_id: body.teacherId, p_rating: body.rating })
  })

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error: 'Failed to rate teacher: ' + error }, { status: res.status })
  }

  return NextResponse.json({ ok: true })
}
