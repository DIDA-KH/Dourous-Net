import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeJwtPayload } from '@/lib/auth/jwt'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/rest'

export async function POST(req: Request) {
  const access = cookies().get('dn_sb_access')?.value
  if (!access) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = decodeJwtPayload(access)
  const userId = String(payload?.sub ?? '')
  if (!userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 })

  const form = await req.formData()
  const courseId = String(form.get('course_id') ?? '')
  const file = form.get('file') as File | null

  if (!courseId) return NextResponse.json({ error: 'Missing course_id' }, { status: 400 })
  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

  // 1) Upsert interaction row (Table C) for this user+course
  const upsertRes = await fetch(
    `${supabaseUrl()}/rest/v1/interactions?on_conflict=user_id,course_id`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
        status: 'pending',
      }),
    }
  )

  const upsertJson = await upsertRes.json().catch(() => null)
  if (!upsertRes.ok) {
    return NextResponse.json(
      { error: upsertJson?.message ?? upsertRes.statusText },
      { status: 400 }
    )
  }

  const interactionId = String(upsertJson?.[0]?.id ?? '')
  if (!interactionId) return NextResponse.json({ error: 'Failed to create interaction' }, { status: 400 })

  // 2) Upload file to Storage with path: <userId>/<interactionId>/<filename>
  const safeName = String(file.name || 'document').replace(/[^\w.\-]+/g, '_')
  const objectPath = `${userId}/${interactionId}/${safeName}`

  const uploadRes = await fetch(
    `${supabaseUrl()}/storage/v1/object/interaction-files/${encodeURI(objectPath)}`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    }
  )

  if (!uploadRes.ok) {
    const txt = await uploadRes.text().catch(() => '')
    return NextResponse.json({ error: txt || uploadRes.statusText }, { status: 400 })
  }

  // 3) Save file_path back to interaction
  const patchRes = await fetch(
    `${supabaseUrl()}/rest/v1/interactions?id=eq.${encodeURIComponent(interactionId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: supabaseAnonKey(),
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        file_path: objectPath,
        file_mime: file.type || null,
      }),
    }
  )

  if (!patchRes.ok) {
    const json = await patchRes.json().catch(() => null)
    return NextResponse.json({ error: json?.message ?? patchRes.statusText }, { status: 400 })
  }

  return NextResponse.json({ ok: true, interactionId, filePath: objectPath })
}

