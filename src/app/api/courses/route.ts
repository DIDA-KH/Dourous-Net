import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function GET(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(req.url)
  const teacherId = (url.searchParams.get('teacherId') ?? '').trim()
  const mine = (url.searchParams.get('mine') ?? '').trim() === '1'

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')

  let query = `${supabaseUrl()}/rest/v1/courses?select=id,title,subject,description,created_at,teacher_id&order=created_at.desc`
  if (mine && userId) {
    query += `&teacher_id=eq.${encodeURIComponent(userId)}`
  } else if (teacherId) {
    query += `&teacher_id=eq.${encodeURIComponent(teacherId)}`
  }

  const res = await fetch(query, {
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
    },
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) return NextResponse.json({ error: text || res.statusText }, { status: 400 })

  let courses: any[] = []
  try {
    courses = JSON.parse(text)
  } catch {}

  return NextResponse.json({ courses })
}

export async function POST(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const title = String(body?.title ?? '').trim()
  const subject = String(body?.subject ?? '').trim()
  const description = String(body?.description ?? '').trim()

  if (!title || !subject) return NextResponse.json({ error: 'Missing title or subject' }, { status: 400 })

  const res = await fetch(`${supabaseUrl()}/rest/v1/courses`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      teacher_id: userId,
      title,
      subject,
      description: description || null,
    }),
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) return NextResponse.json({ error: text || res.statusText }, { status: 400 })

  let created: any = null
  try {
    created = JSON.parse(text)?.[0] ?? null
  } catch {}

  if (created) {
    try {
      const profRes = await fetch(`${supabaseUrl()}/rest/v1/profiles?select=total_sessions&id=eq.${encodeURIComponent(userId)}`, {
        headers: {
          apikey: supabaseAnonKey(),
          Authorization: `Bearer ${access}`,
        }
      })
      const profData = await profRes.json().catch(() => null)
      if (profData && profData[0]) {
        const currentSessions = Number(profData[0].total_sessions) || 0
        await fetch(`${supabaseUrl()}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseAnonKey(),
            Authorization: `Bearer ${access}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ total_sessions: currentSessions + 1 })
        })
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, course: created })
}

export async function DELETE(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const courseId = String(body?.courseId ?? '').trim()
  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

  const res = await fetch(
    `${supabaseUrl()}/rest/v1/courses?id=eq.${encodeURIComponent(courseId)}&teacher_id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        Prefer: 'return=minimal',
      },
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json({ error: text || res.statusText }, { status: 400 })
  }

  try {
    const profRes = await fetch(`${supabaseUrl()}/rest/v1/profiles?select=total_sessions&id=eq.${encodeURIComponent(userId)}`, {
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
      }
    })
    const profData = await profRes.json().catch(() => null)
    if (profData && profData[0]) {
      const currentSessions = Number(profData[0].total_sessions) || 0
      const newSessions = Math.max(0, currentSessions - 1)
      await fetch(`${supabaseUrl()}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseAnonKey(),
          Authorization: `Bearer ${access}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ total_sessions: newSessions })
      })
    }
  } catch {}

  return NextResponse.json({ ok: true })
}

