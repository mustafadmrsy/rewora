// User Mission Service - Kullanıcının görevlerini yönet
import { api } from './apiClient'
import { toArray, mapUserMission } from './missionHelpers'

/**
 * Kullanıcının görevlerini listele
 * API: GET /api/mission/user
 * Response: { success: 200, data: { user_missions: {...} } }
 */
export async function listUserMissions(pageOrUrl = null) {
    let url = '/mission/user'

    if (typeof pageOrUrl === 'string' && pageOrUrl) {
        if (pageOrUrl.startsWith('http')) {
            url = pageOrUrl.replace('https://rewora.com.tr/api', '')
        } else if (pageOrUrl.startsWith('/')) {
            url = pageOrUrl
        } else if (pageOrUrl.startsWith('?')) {
            url = `/mission/user${pageOrUrl}`
        }
    }

    const res = await api.get(url)
    const responseData = res?.data ?? res
    const userMissionsPayload = responseData?.user_missions ?? {}
    const list = Array.isArray(userMissionsPayload?.data)
        ? userMissionsPayload.data
        : toArray(userMissionsPayload)
    const userMissions = list.map(mapUserMission).filter(Boolean)
    return {
        userMissions,
        nextPageUrl: userMissionsPayload?.next_page_url ?? null,
        pagination: userMissionsPayload,
    }
}

/**
 * Tamamlanan görevleri listele
 * API: GET /api/mission/user?status=completed
 */
export async function listCompletedMissions(pageOrUrl = null) {
    let url = '/mission/user?status=completed'

    if (typeof pageOrUrl === 'string' && pageOrUrl) {
        if (pageOrUrl.startsWith('http')) {
            url = pageOrUrl.replace('https://rewora.com.tr/api', '')
        } else if (pageOrUrl.startsWith('/')) {
            url = pageOrUrl
        }
    }

    const res = await api.get(url)
    const responseData = res?.data ?? res
    const userMissionsPayload = responseData?.user_missions ?? {}

    const list = Array.isArray(userMissionsPayload?.data)
        ? userMissionsPayload.data
        : toArray(userMissionsPayload)

    const completedMissions = list.map(mapUserMission).filter(Boolean)

    return {
        completedMissions,
        nextPageUrl: userMissionsPayload?.next_page_url ?? null,
        pagination: userMissionsPayload,
    }
}

/**
 * Görevi başlat
 * API: POST /api/mission
 * Body: { mission_id: number }
 */
export async function startMission(missionId) {
    return api.post('/mission', { mission_id: Number(missionId) })
}

/**
 * Görev durumunu güncelle (iptal et)
 * API: PUT /api/mission/user/{id}
 * Body: { status: 'cancelled' }
 */
export async function updateUserMissionStatus(userMissionId, status) {
    return api.put(`/mission/user/${userMissionId}`, { status })
}

