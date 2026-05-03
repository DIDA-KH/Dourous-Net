import { NextResponse, type NextRequest } from 'next/server'

function isTokenUsable(token?: string) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length < 2) return false
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { exp?: number }
    if (typeof payload.exp !== 'number') return true
    const nowSec = Math.floor(Date.now() / 1000)
    return payload.exp > nowSec
  } catch {
    return false
  }
}

function clearAuthCookies(res: NextResponse) {
  const opts = { path: '/', maxAge: 0 as const }
  res.cookies.set('dn_sb_access', '', opts)
  res.cookies.set('dn_sb_refresh', '', opts)
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuth = pathname.startsWith('/auth')

  // We keep it simple: protect dashboard by presence of our auth cookie.
  // The actual data security is handled by Supabase RLS at the database level.
  const access = request.cookies.get('dn_sb_access')?.value
  const hasValidAccess = isTokenUsable(access)

  if (isDashboard && !hasValidAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    const res = NextResponse.redirect(url)
    clearAuthCookies(res)
    return res
  }

  // Keep auth pages accessible even when logged in, so users can switch accounts.
  // If cookies exist but are invalid, clean stale cookies and continue.
  if (isAuth && access && !hasValidAccess) {
    clearAuthCookies(response)
  }

  return response
}

export const config = { matcher: ['/dashboard/:path*', '/auth/:path*'] }
