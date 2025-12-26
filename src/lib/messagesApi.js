import { api } from './apiClient'
import { formatRelativeDate } from './postsApi'

const PUBLIC_ORIGIN = 'https://rewora.com.tr'

export function resolvePostImageUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${PUBLIC_ORIGIN}${url}`
  return `${PUBLIC_ORIGIN}/${url}`
}

function toArray(maybeArray) {
  if (!maybeArray) return []
  if (Array.isArray(maybeArray)) return maybeArray
  if (typeof maybeArray === 'object') {
    if (Array.isArray(maybeArray.data)) return maybeArray.data
  }
  return []
}

export function mapConversation(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.conversation_id
  
  // Response format: users array contains the other user(s)
  const users = Array.isArray(raw.users) ? raw.users : []
  // Get the first user (other user, not current user)
  const otherUser = users[0] ?? null
  
  // last_message is a string in the response
  const lastMessageText = raw.last_message ?? ''
  const lastMessageSender = raw.last_message_sender ?? null
  const currentUserId = null // Will be set from auth if needed

  return {
    ...raw,
    id,
    other_user: otherUser ? {
      id: otherUser.id,
      name: otherUser.fname && otherUser.lname 
        ? `${otherUser.fname} ${otherUser.lname}` 
        : otherUser.fname || otherUser.lname || otherUser.name || 'Kullanıcı',
      username: otherUser.username ?? null,
      photo: otherUser.photo ?? null,
      photo_url: resolvePostImageUrl(otherUser.photo ?? null),
    } : null,
    last_message: lastMessageText ? {
      id: null,
      text: lastMessageText,
      time: raw.updated_at ? formatRelativeDate(raw.updated_at) : '',
      from_me: false, // Will be determined by comparing last_message_sender with current user
    } : null,
    unread_count: raw.unread_count ?? raw.unread ?? 0,
    last_message_sender: lastMessageSender,
  }
}

export function mapMessage(raw, currentUserId = null) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.message_id
  const userId = raw.user_id ?? null
  // Determine if message is from current user by comparing user_id
  const fromMe = currentUserId ? (String(userId) === String(currentUserId)) : (raw.from_me ?? raw.is_me ?? false)

  return {
    ...raw,
    id,
    user_id: userId,
    text: raw.message ?? raw.text ?? raw.content ?? '',
    time: raw.created_at ? formatRelativeDate(raw.created_at) : '',
    from_me: fromMe,
    created_at: raw.created_at,
  }
}

export async function listConversations() {
  const res = await api.get('/conversation')
  // Response format: { success: true, message: "...", data: { conversations: [...] } }
  const responseData = res?.data ?? {}
  
  const conversationsPayload = responseData.conversations ?? responseData.data ?? responseData
  const list = Array.isArray(conversationsPayload)
    ? conversationsPayload
    : Array.isArray(conversationsPayload?.data)
      ? conversationsPayload.data
      : toArray(conversationsPayload)

  const conversations = list.map(mapConversation).filter(Boolean)
  return { conversations, meta: conversationsPayload ?? null }
}

export async function getConversation(conversationId) {
  const res = await api.get(`/conversation/${conversationId}`)
  const responseData = res?.data ?? {}
  
  const conversation = responseData.conversation ?? responseData
  return mapConversation(conversation)
}

export async function listMessages(conversationId, page = 1, currentUserId = null) {
  const res = await api.get(`/conversation/${conversationId}/message`, {
    params: { page },
  })
  // Response format: { success: true, message: "...", data: { data: [...], current_page, ... } }
  const responseData = res?.data ?? {}
  
  // Response has data.data array
  const messagesList = Array.isArray(responseData.data) ? responseData.data : []
  
  // Reverse to show newest first (or keep order if oldest first)
  const messages = messagesList.map((msg) => mapMessage(msg, currentUserId)).filter(Boolean)
  
  return { 
    messages, 
    meta: responseData ?? null,
    pagination: {
      current_page: responseData.current_page ?? page,
      last_page: responseData.last_page ?? 1,
      per_page: responseData.per_page ?? 48,
      total: responseData.total ?? 0,
      next_page_url: responseData.next_page_url ?? null,
      prev_page_url: responseData.prev_page_url ?? null,
    },
  }
}

export async function sendMessage(conversationId, message) {
  const res = await api.post(`/conversation/${conversationId}/message`, {
    message: message.trim(),
  })
  const responseData = res?.data ?? {}
  
  const sentMessage = responseData.message ?? responseData
  return mapMessage(sentMessage)
}

export async function createConversation(userId) {
  const res = await api.post('/conversation', {
    user_id: userId,
  })
  const responseData = res?.data ?? {}
  
  const conversation = responseData.conversation ?? responseData
  return mapConversation(conversation)
}

