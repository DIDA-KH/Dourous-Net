export type JwtPayload = Record<string, unknown> & {
  sub?: string
  exp?: number
  role?: string
  email?: string
}

function base64UrlDecode(input: string) {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  const b64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64').toString('utf8')
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const json = base64UrlDecode(parts[1]!)
    return JSON.parse(json)
  } catch {
    return null
  }
}

