import { NextResponse } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/session'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const clearOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false,
    path: '/',
    maxAge: 0,
  }
  res.cookies.set(ACCESS_COOKIE, '', clearOptions)
  res.cookies.set(REFRESH_COOKIE, '', clearOptions)
  return res
}

