import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

function getAuth() {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return { access: '', userId: '', error: 'Not authenticated' }
  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return { access: '', userId: '', error: 'Invalid session' }
  return { access, userId, error: '' }
}

export async function POST(req: Request) {
  const { access, userId, error } = getAuth()
  if (error) return NextResponse.json({ error }, { status: 401 })

  const form = await req.formData()
  const courseId = String(form.get('course_id') ?? '').trim()
  const file = form.get('file') as File | null
  if (!courseId) return NextResponse.json({ error: 'Missing course_id' }, { status: 400 })
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

  const safeName = String(file.name || 'document.pdf').replace(/[^\w.\-]+/g, '_')
  const filePath = `${userId}/courses/${courseId}/${safeName}`

  const up = await fetch(
    `${supabaseUrl()}/storage/v1/object/interaction-files/${encodeURI(filePath)}`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        'Content-Type': file.type || 'application/pdf',
        'x-upsert': 'true',
      },
      body: file,
    }
  )
  if (!up.ok) {
    const text = await up.text().catch(() => '')
    return NextResponse.json({ error: text || up.statusText }, { status: 400 })
  }

  return NextResponse.json({ ok: true, filePath })
}

export async function DELETE(req: Request) {
  const { access, userId, error } = getAuth()
  if (error) return NextResponse.json({ error }, { status: 401 })

  const body = await req.json().catch(() => null)
  const courseId = String(body?.courseId ?? '').trim()
  const filePath = String(body?.filePath ?? '').trim()
  if (!courseId || !filePath) {
    return NextResponse.json({ error: 'Missing courseId or filePath' }, { status: 400 })
  }
  if (!filePath.startsWith(`${userId}/courses/${courseId}/`)) {
    return NextResponse.json({ error: 'Unauthorized file path' }, { status: 403 })
  }

  const del = await fetch(`${supabaseUrl()}/storage/v1/object/interaction-files/${encodeURI(filePath)}`, {
    method: 'DELETE',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${access}`,
    },
  })
  if (!del.ok) {
    const text = await del.text().catch(() => '')
    return NextResponse.json({ error: text || del.statusText }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

