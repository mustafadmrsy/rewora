import { api } from './apiClient'
import { resolvePostImageUrl } from './postsApi'

export async function listBlockedUsers(pageOrUrl = 1) {
  let url = '/block'
  if (typeof pageOrUrl === 'string' && pageOrUrl.startsWith('http')) {
    // Full URL is provided, extract the path
    url = pageOrUrl.replace('https://rewora.com.tr/api', '')
  } else if (pageOrUrl) {
    url = `/block?page=${pageOrUrl}`
  }
  
  const res = await api.get(url)
  const responseData = res?.data ?? res ?? {}
  
  const blockedUsersPayload = responseData.blocked_users ?? {}
  const blockedUsersList = Array.isArray(blockedUsersPayload.data) 
    ? blockedUsersPayload.data 
    : []
  
  const blockedUsers = blockedUsersList.map((item) => {
    if (!item || typeof item !== 'object') return null
    const blocked = item.blocked ?? {}
    return {
      id: blocked.id,
      fname: blocked.fname ?? '',
      lname: blocked.lname ?? '',
      name: blocked.fname && blocked.lname 
        ? `${blocked.fname} ${blocked.lname}` 
        : blocked.fname || blocked.lname || 'Kullanıcı',
      photo: blocked.photo ?? null,
      photo_url: resolvePostImageUrl(blocked.photo ?? null),
    }
  }).filter(Boolean)
  
  return {
    blockedUsers,
    pagination: blockedUsersPayload ?? null,
    nextPageUrl: blockedUsersPayload?.next_page_url ?? null,
  }
}

export async function blockUser(blockedId) {
  const res = await api.post('/block', { blocked_id: blockedId })
  return res?.data ?? res
}

export async function unblockUser(blockedId) {
  const res = await api.del(`/block/${blockedId}`)
  return res?.data ?? res
}

