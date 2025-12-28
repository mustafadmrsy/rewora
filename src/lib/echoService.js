// lib/echoService.js
import { getAccessToken } from './authStorage'

const APP_KEY =
  import.meta.env.VITE_REVERB_APP_KEY || 'm9dcd7nvmejhus3ebwpv'
const WS_URL = `wss://rewora.com.tr/app/${APP_KEY}`
const API_BASE = 'https://rewora.com.tr'

let socket = null
let socketId = null
let currentConversation = null
let isConnecting = false

export async function connectToConversation(conversationId) {
  // Eğer aynı conversation'a bağlanıyorsak, tekrar bağlanma
  if (socket && currentConversation === conversationId) {
    return
  }

  // Eğer farklı bir conversation'a bağlanıyorsak, önce eski bağlantıyı kapat
  if (socket && currentConversation !== conversationId) {
    socket.close()
    socket = null
    socketId = null
  }

  // Eğer zaten bağlanma işlemi devam ediyorsa, bekle
  if (isConnecting) {
    return
  }

  const token = getAccessToken()
  if (!token) {
    console.error('[WS] Token yok')
    return
  }

  isConnecting = true
  currentConversation = conversationId

  try {
    socket = new WebSocket(WS_URL)

    socket.onopen = () => {
      isConnecting = false
    }

    socket.onclose = () => {
      // Sadece bu conversation için kapatıldıysa temizle
      if (currentConversation === conversationId) {
        socket = null
        socketId = null
        currentConversation = null
      }
      isConnecting = false
    }

    socket.onerror = (e) => {
      console.error('[WS] Error', e)
      isConnecting = false
    }

    socket.onmessage = async (event) => {
      // Socket null kontrolü
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return
      }

      const payload = JSON.parse(event.data)

      // ping → pong
      if (payload.event === 'pusher:ping') {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ event: 'pusher:pong', data: {} }))
        }
        return
      }

      // connected
      if (payload.event === 'pusher:connection_established') {
        socketId = JSON.parse(payload.data).socket_id

        // Conversation değişmiş olabilir, kontrol et
        if (currentConversation !== conversationId) {
          return
        }

        try {
          // 🔐 MANUEL AUTH (MOBİLLE AYNI)
          const res = await fetch(`${API_BASE}/broadcasting/auth`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: `presence-conversation.${conversationId}`,
            }),
          })

          const auth = await res.json()

          // Socket hala açık ve aynı conversation mı kontrol et
          if (socket && socket.readyState === WebSocket.OPEN && currentConversation === conversationId) {
            socket.send(
              JSON.stringify({
                event: 'pusher:subscribe',
                data: {
                  channel: `presence-conversation.${conversationId}`,
                  auth: auth.auth,
                  channel_data: auth.channel_data,
                },
              })
            )
          }
        } catch (error) {
          console.error('[WS] Auth error:', error)
        }
        return
      }

      // 🔥 GLOBAL EVENT (Messages.jsx yakalayacak)
      window.dispatchEvent(
        new CustomEvent('ws-event', {
          detail: {
            event: payload.event,
            data:
              typeof payload.data === 'string'
                ? JSON.parse(payload.data)
                : payload.data,
          },
        })
      )
    }
  } catch (error) {
    console.error('[WS] Connection error:', error)
    isConnecting = false
    socket = null
    socketId = null
    currentConversation = null
  }
}

export function disconnect() {
  if (socket) {
    socket.close()
    socket = null
    socketId = null
    currentConversation = null
  }
  isConnecting = false
}

// Alias for disconnect (used in Header and Profile for logout)
export function resetEcho() {
  disconnect()
}
