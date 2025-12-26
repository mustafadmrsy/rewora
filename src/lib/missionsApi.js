import { api, apiRequest } from './apiClient'

function toArray(maybeArray) {
  if (!maybeArray) return []
  if (Array.isArray(maybeArray)) return maybeArray
  if (typeof maybeArray === 'object') {
    if (Array.isArray(maybeArray.data)) return maybeArray.data
  }
  return []
}

function resolveUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  const raw = url.trim()
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return `https://rewora.com.tr${raw}`
  return `https://rewora.com.tr/${raw}`
}

export function mapMission(raw) {
  if (!raw || typeof raw !== 'object') return null

  const category = raw.category ?? null

  return {
    ...raw,
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    coin: typeof raw.coin === 'number' ? raw.coin : Number(raw.coin ?? 0),
    image: raw.image ?? null,
    image_url: resolveUrl(raw.image),
    category,
    category_title: category?.title ?? '',
    category_slug: category?.slug ?? '',
  }
}

export function mapUserMission(raw) {
  if (!raw || typeof raw !== 'object') return null

  const mission = raw.mission ?? raw.mission_detail ?? null

  return {
    ...raw,
    id: raw.id,
    mission_id: raw.mission_id ?? mission?.id ?? null,
    status: raw.status ?? 'pending',
    mission: mission ? mapMission(mission) : null,
  }
}

export async function listMissions() {
  const res = await api.get('/mission')
  // Response format: { success: 200, message: "...", data: { missions: { data: [...], ...pagination }, categories: [...], user: {...} } }
  const responseData = res?.data ?? {}
  const missionsPayload = responseData.missions

  // Handle paginated response: missions can be { data: [...], current_page, ... } or direct array
  const list =
    Array.isArray(missionsPayload)
      ? missionsPayload
      : Array.isArray(missionsPayload?.data)
        ? missionsPayload.data
        : toArray(missionsPayload)

  const missions = list.map(mapMission).filter(Boolean)
  return { 
    missions, 
    categories: responseData.categories ?? [], 
    user: responseData.user ?? null, 
    meta: missionsPayload ?? null 
  }
}

export async function listUserMissions() {
  const res = await api.get('/mission/user')
  // Response format: { success: 200, message: "...", data: { user_missions: { data: [...], ...pagination } } }
  const responseData = res?.data ?? {}
  const userMissionsPayload = responseData.user_missions

  // Handle paginated response: user_missions can be { data: [...], current_page, ... } or direct array
  const list =
    Array.isArray(userMissionsPayload)
      ? userMissionsPayload
      : Array.isArray(userMissionsPayload?.data)
        ? userMissionsPayload.data
        : toArray(userMissionsPayload)

  const userMissions = list.map(mapUserMission).filter(Boolean)
  return { 
    userMissions, 
    meta: userMissionsPayload ?? null 
  }
}

export async function startMission(missionId) {
  return api.post('/mission', { mission_id: Number(missionId) })
}

export async function updateUserMissionStatus(userMissionId, status) {
  return api.put(`/mission/user/${userMissionId}`, { status })
}

export async function submitMissionPost({ userMissionId, content, file }) {
  const form = new FormData()
  form.append('user_mission_id', String(userMissionId))
  form.append('content', content ?? '')
  if (file) form.append('image', file)

  return apiRequest('/post', { method: 'POST',body: form })
}
