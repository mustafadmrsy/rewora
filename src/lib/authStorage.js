const ACCESS_TOKEN_KEY = 'rewora_access_token'
const TOKEN_TYPE_KEY = 'rewora_token_type'
const USER_KEY = 'rewora_user'
const DEVICE_TOKEN_KEY = 'rewora_device_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getTokenType() {
  return localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer'
}

export function setSession({ accessToken, tokenType, user }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (tokenType) localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
  if (user !== undefined) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `dt_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function getOrCreateDeviceToken() {
  const existing = localStorage.getItem(DEVICE_TOKEN_KEY)
  if (existing) return existing
  const next = uuid()
  localStorage.setItem(DEVICE_TOKEN_KEY, next)
  return next
}
