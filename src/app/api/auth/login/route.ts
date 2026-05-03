import { NextResponse } from 'next/server'
import { supabaseSignInWithPassword, supabaseUpdateProfile } from '@/lib/supabase/rest'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/session'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
  }

  const { session, error } = await supabaseSignInWithPassword({ email, password })
  if (error || !session?.access_token) {
    return NextResponse.json({ error: error ?? 'Login failed' }, { status: 401 })
  }

  // Auto-sync role and full_name to public.profiles for older accounts
  if (session.user?.id) {
    const role = session.user.user_metadata?.role
    const full_name = session.user.user_metadata?.full_name
    if (role || full_name) {
      const patch: any = {}
      if (role) patch.role = role
      if (full_name) patch.full_name = full_name
      supabaseUpdateProfile({
        accessToken: session.access_token,
        userId: session.user.id,
        patch
      }).catch(() => null)
    }
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  })
  res.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  })
  return res
}

