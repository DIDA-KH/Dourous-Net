import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/rest'

export async function POST() {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Call the custom RPC function to delete the user
  const res = await fetch(`${supabaseUrl()}/rest/v1/rpc/delete_user`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error: 'Failed to delete account: ' + error }, { status: res.status })
  }

  // Clear cookies
  cookies().delete('dn_sb_access')
  cookies().delete('dn_sb_refresh')
  
  return NextResponse.json({ ok: true })
}
