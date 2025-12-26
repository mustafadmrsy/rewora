import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getAccessToken } from './authStorage'

const REVERB_APP_ID = import.meta.env.VITE_REVERB_APP_ID || '418614'
const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || 'm9dcd7nvmejhus3ebwpv'
const WS_HOST = import.meta.env.VITE_REVERB_HOST || 'rewora.com.tr'
const WS_PORT = import.meta.env.VITE_REVERB_PORT || 8080
// Laravel broadcasting auth endpoint - usually at /api/broadcasting/auth
const AUTH_ENDPOINT = `${import.meta.env.VITE_API_URL || 'https://rewora.com.tr/api'}/broadcasting/auth`

let echoInstance = null

function buildEcho() {
  const token = getAccessToken()

  if (typeof window !== 'undefined') {
    window.Pusher = Pusher
  }

  return new Echo({
    broadcaster: 'reverb',
    key: REVERB_APP_KEY,
    wsHost: WS_HOST,
    wsPort: WS_PORT,
    wssPort: WS_PORT,
    forceTLS: false, // Reverb usually runs on HTTP, not HTTPS
    enabledTransports: ['ws'], // Use only ws (not wss) to avoid SSL errors
    authEndpoint: AUTH_ENDPOINT,
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
}

export function getEcho() {
  if (!echoInstance) {
    echoInstance = buildEcho()
    return echoInstance
  }

  const token = getAccessToken()
  const pusher = echoInstance?.connector?.pusher
  if (pusher && token) {
    pusher.config.auth = pusher.config.auth || {}
    pusher.config.auth.headers = {
      ...(pusher.config.auth.headers || {}),
      Authorization: `Bearer ${token}`,
    }
  }

  return echoInstance
}

export function resetEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}
