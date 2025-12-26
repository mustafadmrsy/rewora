import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { getAccessToken } from './authStorage'

const PUSHER_KEY = 'abc123xyz'
const WS_HOST = 'rewora.com.tr'
const AUTH_ENDPOINT = 'https://rewora.com.tr/api/broadcasting/auth'

let echoInstance = null

function buildEcho() {
  const token = getAccessToken()

  if (typeof window !== 'undefined') {
    window.Pusher = Pusher
  }

  return new Echo({
    broadcaster: 'pusher',
    key: PUSHER_KEY,
    cluster: 'mt1',
    forceTLS: true,
    wsHost: WS_HOST,
    wsPort: 8080,
    wssPort: 8080,
    enabledTransports: ['ws', 'wss'],
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
