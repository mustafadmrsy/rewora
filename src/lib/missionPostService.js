// Mission Post Service - Görev tamamlama postları
import { apiRequest } from './apiClient'

/**
 * Görev tamamlama postu gönder
 * API: POST /api/post
 * FormData: { user_mission_id, content, image }
 */
export async function submitMissionPost({ userMissionId, content, file }) {
  const form = new FormData()
  form.append('user_mission_id', String(userMissionId))
  form.append('content', content ?? '')
  if (file) form.append('image', file)

  return apiRequest('/post', { method: 'POST', body: form })
}

