// Mission Service - Tüm görevleri listele ve tek görev getir
import { api } from './apiClient'
import { toArray, mapMission } from './missionHelpers'

/**
 * Tüm görevleri listele (Kullanıcının almadığı görevler)
 * API: GET /api/mission
 * Response: { success: true, data: { missions: {...}, categories: [...], user: {...} } }
 */
export async function listMissions(pageOrUrl = 1, categoryId = null) {
  let url = '/mission'

  if (typeof pageOrUrl === 'string' && (pageOrUrl.startsWith('http') || pageOrUrl.startsWith('/'))) {
    url = pageOrUrl.startsWith('http')
      ? pageOrUrl.replace('https://rewora.com.tr/api', '')
      : pageOrUrl
  } else {
    const params = { page: pageOrUrl }
    if (categoryId != null && categoryId !== 0) {
      params.category = categoryId
    }
    url = `/mission?${new URLSearchParams(params).toString()}`
  }

  const res = await api.get(url)

  // Response: { success: true, data: { missions: {...}, categories: [...], user: {...} } }
  const responseData = res?.data ?? res
  const missionsPayload = responseData?.missions ?? {}

  const list = Array.isArray(missionsPayload?.data)
    ? missionsPayload.data
    : toArray(missionsPayload)

  const missions = list.map(mapMission).filter(Boolean)

  return {
    missions,
    categories: responseData?.categories ?? [],
    user: responseData?.user ?? null,
    pagination: missionsPayload,
  }
}

/**
 * Tek bir görevi getir
 * API: GET /api/mission/{id}
 */
export async function getMission(missionId) {
  const res = await api.get(`/mission/${missionId}`)
  const responseData = res?.data ?? {}
  const missionRaw = responseData.mission ?? null
  return missionRaw ? mapMission(missionRaw) : null
}

