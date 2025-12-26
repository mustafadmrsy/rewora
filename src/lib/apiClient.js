import { getAccessToken, getTokenType } from './authStorage'

const BASE_URL = 'https://rewora.com.tr/api'

async function parseJsonSafely(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, { method = 'GET', headers, body } = {}) {
  const token = getAccessToken()
  const tokenType = getTokenType()

  const finalHeaders = {
    Accept: 'application/json',
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers ?? {}),
  }

  if (token) {
    finalHeaders.Authorization = `${tokenType} ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })

  const data = await parseJsonSafely(res)

  if (!res.ok) {
    const err = new Error('API_ERROR')
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  post(path, body, options) {
    return apiRequest(path, { method: 'POST', body, ...(options ?? {}) })
  },
  get(path, options) {
    return apiRequest(path, { method: 'GET', ...(options ?? {}) })
  },
  put(path, body, options) {
    return apiRequest(path, { method: 'PUT', body, ...(options ?? {}) })
  },
  del(path, options) {
    return apiRequest(path, { method: 'DELETE', ...(options ?? {}) })
  },
}
