/**
 * Oturum açan kullanıcının id'si yalnızca JWT içinde taşınır; /api/auth yanıtı
 * (AuthResponse) id alanı döndürmez. Backend token'ı ClaimTypes.NameIdentifier
 * ile üretir, bu da JWT'ye kısa ad olan "nameid" olarak yazılır.
 */
const USER_ID_CLAIMS = [
  'nameid',
  'sub',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
]

function decodeBase64Url(value: string): string | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function readClaims(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1]
  if (!payload) {
    return null
  }
  const json = decodeBase64Url(payload)
  if (!json) {
    return null
  }
  try {
    const parsed = JSON.parse(json) as unknown
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function getCurrentUserId(): string | null {
  const token = localStorage.getItem('authToken')
  if (!token) {
    return null
  }

  const claims = readClaims(token)
  if (!claims) {
    return null
  }

  for (const claim of USER_ID_CLAIMS) {
    const value = claims[claim]
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }
  }

  return null
}
