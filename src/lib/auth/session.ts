import { cookies } from 'next/headers'
import { decodeJwtPayload } from './jwt'
import { supabaseGetProfile } from '@/lib/supabase/rest'

export const ACCESS_COOKIE = 'dn_sb_access'
export const REFRESH_COOKIE = 'dn_sb_refresh'

export function getAccessTokenFromCookies() {
  return cookies().get(ACCESS_COOKIE)?.value ?? null
}

export function getUserIdFromAccessToken(accessToken: string) {
  const payload = decodeJwtPayload(accessToken)
  return payload?.sub ?? null
}

export async function getServerUserAndProfile() {
  const accessToken = getAccessTokenFromCookies()
  if (!accessToken) return { user: null as any, profile: null as any }

  const payload = decodeJwtPayload(accessToken)
  const userId = payload?.sub ?? null
  if (!userId) return { user: null as any, profile: null as any }

  const { profile } = await supabaseGetProfile({ accessToken, userId })
  if (profile && !profile.email && payload?.email) {
    profile.email = payload.email
  }

  const user = { id: userId, email: payload?.email } as any
  return { user, profile }
}

