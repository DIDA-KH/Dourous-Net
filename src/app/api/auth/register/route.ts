import { NextResponse } from 'next/server'
import { supabaseSignUp, supabaseSignInWithPassword, supabaseUpdateProfile } from '@/lib/supabase/rest'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/session'
import { decodeJwtPayload } from '@/lib/auth/jwt'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const full_name = String(body?.full_name ?? '').trim()
  const role = String(body?.role ?? 'student')
  const wilaya = String(body?.wilaya ?? '')
  const level = String(body?.level ?? '')
  const specialty = String(body?.specialty ?? '')

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (role !== 'student' && role !== 'teacher') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const { error: signUpErr } = await supabaseSignUp({
    email,
    password,
    data: { full_name, role },
  })
  if (signUpErr) {
    return NextResponse.json({ error: signUpErr }, { status: 400 })
  }

  // If email confirmation is enabled, user may need to confirm before login works.
  // We try to sign in right away; if it fails, we still return ok with a hint.
  const { session, error: signInErr } = await supabaseSignInWithPassword({ email, password })
  if (signInErr || !session?.access_token) {
    return NextResponse.json({
      ok: true,
      needsEmailConfirm: true,
      message: 'Account created. Please confirm your email, then login.',
    })
  }

  const payload = decodeJwtPayload(session.access_token)
  const userId = String(payload?.sub ?? '')
  if (userId) {
    const patch: any = { role, full_name }
    if (wilaya) patch.wilaya = wilaya
    if (role === 'student' && level) patch.level = level
    if (role === 'teacher' && specialty) patch.specialty = specialty

    if (Object.keys(patch).length) {
      const { error: profErr } = await supabaseUpdateProfile({
        accessToken: session.access_token,
        userId,
        patch,
      })
      if (profErr) {
        return NextResponse.json({ error: profErr }, { status: 400 })
      }
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

