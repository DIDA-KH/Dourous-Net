type SupabaseSession = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at?: number
  user: any
}

function mustEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export function supabaseUrl() {
  return mustEnv('NEXT_PUBLIC_SUPABASE_URL')
}

export function supabaseAnonKey() {
  return mustEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

async function readBody(res: Response): Promise<{ text: string; json: any | null }> {
  const text = await res.text().catch(() => '')
  if (!text) return { text: '', json: null }
  try {
    return { text, json: JSON.parse(text) }
  } catch {
    return { text, json: null }
  }
}

export async function supabaseSignUp(args: {
  email: string
  password: string
  data?: Record<string, unknown>
}): Promise<{ session: SupabaseSession | null; error: string | null }> {
  const res = await fetch(`${supabaseUrl()}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${supabaseAnonKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: args.email,
      password: args.password,
      data: args.data ?? {},
    }),
  })

  const { json, text } = await readBody(res)
  if (!res.ok) {
    return {
      session: null,
      error: (json?.msg ||
        json?.error_description ||
        json?.error ||
        json?.message ||
        text ||
        res.statusText) as string,
    }
  }

  // Depending on email confirmation settings, session can be null.
  // Supabase returns a user object; session may not be included.
  return { session: (json?.session ?? null) as any, error: null }
}

export async function supabaseSignInWithPassword(args: {
  email: string
  password: string
}): Promise<{ session: SupabaseSession | null; error: string | null }> {
  const res = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${supabaseAnonKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: args.email, password: args.password }),
  })

  const { json, text } = await readBody(res)
  if (!res.ok) {
    return {
      session: null,
      error: (json?.error_description ||
        json?.error ||
        json?.message ||
        text ||
        res.statusText) as string,
    }
  }

  return { session: json as any, error: null }
}

export async function supabaseUpdateProfile(args: {
  accessToken: string
  userId: string
  patch: Record<string, unknown>
}): Promise<{ error: string | null }> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/profiles?id=eq.${encodeURIComponent(args.userId)}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${args.accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(args.patch),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    return { error: (json?.message || json?.hint || json?.details || res.statusText) as string }
  }
  return { error: null }
}

export async function supabaseGetProfile(args: {
  accessToken: string
  userId: string
}): Promise<{ profile: any | null; error: string | null }> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(args.userId)}`, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${args.accessToken}`,
    },
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) return { profile: null, error: (json?.message || res.statusText) as string }
  return { profile: Array.isArray(json) ? (json[0] ?? null) : null, error: null }
}

