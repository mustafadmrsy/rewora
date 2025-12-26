import { api } from './apiClient'

const PUBLIC_ORIGIN = 'https://rewora.com.tr'

function toArray(maybeArray) {
  if (!maybeArray) return []
  if (Array.isArray(maybeArray)) return maybeArray
  if (typeof maybeArray === 'object') {
    if (Array.isArray(maybeArray.data)) return maybeArray.data
  }
  return []
}

function formatRelativeDate(dateInput) {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 60) return `${sec}s`
  if (min < 60) return `${min} dk`
  if (hr < 24) return `${hr} sa`
  return `${day} gün`
}

function resolveNotificationImageUrl(image) {
  if (!image) return null
  if (typeof image !== 'string') return null
  const raw = image.trim()
  if (!raw) return null

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return `${PUBLIC_ORIGIN}${raw}`
  return `${PUBLIC_ORIGIN}/${raw}`
}

function inferTypeFromTargetPage(targetPage) {
  const page = String(targetPage ?? '').toLowerCase()
  if (!page) return 'tum'
  if (page.includes('odul') || page.includes('reward') || page.includes('offer')) return 'odul'
  if (page.includes('gorev') || page.includes('task') || page.includes('mission')) return 'gorev'
  return 'tum'
}

export function mapNotification(raw) {
  if (!raw || typeof raw !== 'object') return null

  const payload = raw.data ?? raw.payload ?? {}

  const id = raw.id ?? raw.notification_id ?? raw.uuid ?? raw._id
  const title = payload?.title ?? raw.title ?? raw.subject ?? 'Bildirim'
  const content = payload?.content ?? payload?.body ?? raw.content ?? raw.body ?? raw.message ?? ''
  const image = payload?.image ?? raw.image ?? null
  const imageUrl = resolveNotificationImageUrl(image)

  const targetId = payload?.target_id ?? raw.target_id ?? null
  const targetPage = payload?.target_page ?? raw.target_page ?? null
  const role = payload?.role ?? raw.role ?? null

  const createdAt = raw.created_at ?? raw.createdAt ?? raw.time ?? null
  const time = raw.time_text ?? raw.time ?? formatRelativeDate(createdAt)
  const type = raw.type ?? payload?.type ?? inferTypeFromTargetPage(targetPage)

  const readAt = raw.read_at ?? raw.readAt ?? null
  const unread = readAt ? false : Boolean(raw.unread ?? raw.is_unread ?? raw.not_read ?? false)

  return {
    ...raw,
    id,
    title,
    content,
    image,
    image_url: imageUrl,
    time,
    type,
    target_id: targetId,
    target_page: targetPage,
    role,
    unread,
  }
}

export async function listNotifications() {
  const res = await api.get('/notification')
  const data = res?.data ?? {}
  const payload = data.notifications

  const list =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : toArray(payload)

  const notifications = list.map(mapNotification).filter(Boolean)
  return { notifications, user: data.user ?? null, meta: payload ?? null }
}

export async function markAllNotificationsRead() {
  return api.get('/notification/makeread')
}
