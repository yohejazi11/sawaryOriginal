const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sawary_token')
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('sawary_token')
    window.location.href = '/admin/login'
  }

  return res
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `POST ${path} → ${res.status}`)
  }
  return res.json()
}

export async function apiPut(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `PUT ${path} → ${res.status}`)
  }
}

export async function apiPatch<T = void>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `PATCH ${path} → ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : (undefined as T)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `DELETE ${path} → ${res.status}`)
  }
}

export async function apiUpload<T>(
  path: string,
  form: FormData,
): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `UPLOAD ${path} → ${res.status}`)
  }
  return res.json()
}
