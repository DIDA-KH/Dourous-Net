import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function GET(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  const spec = (url.searchParams.get('s') ?? '').trim()

  // RLS policy "profiles_select_teachers" allows selecting role='teacher' for authenticated users.
  let query = `${supabaseUrl()}/rest/v1/profiles?select=id,full_name,specialty,rating,wilaya,bio,hourly_rate,google_meet_link,total_sessions,experience_years&role=eq.teacher&order=rating.desc.nullslast,full_name.asc`

  if (spec && spec !== 'ALL') {
    query += `&specialty=eq.${encodeURIComponent(spec)}`
  }
  if (q) {
    // Supabase PostgREST: ilike with wildcards
    query += `&full_name=ilike.*${encodeURIComponent(q)}*`
  }

  const res = await fetch(query, {
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
    },
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) return NextResponse.json({ error: text || res.statusText }, { status: 400 })

  let teachers: any[] = []
  try {
    teachers = JSON.parse(text)
  } catch {}

  return NextResponse.json({ teachers })
}

