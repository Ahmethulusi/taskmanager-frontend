const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface ApiErrorBody {
  message?: string
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, ...rest } = options
  const headers = new Headers(rest.headers)

  const token = localStorage.getItem('authToken')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      window.location.href = '/login'
    }

    let message = 'Bir hata oluştu'
    try {
      const errorBody = (await response.json()) as ApiErrorBody
      if (errorBody.message) {
        message = errorBody.message
      }
    } catch {
      // response body JSON değilse generic mesaj kullanılır
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
