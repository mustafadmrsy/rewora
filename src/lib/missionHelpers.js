// Helper functions for mission services

export function toArray(maybeArray) {
  if (!maybeArray) return []
  if (Array.isArray(maybeArray)) return maybeArray
  if (typeof maybeArray === 'object') {
    if (Array.isArray(maybeArray.data)) return maybeArray.data
  }
  return []
}

export function resolveUrl(url) {
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
  if (!raw || typeof raw !== 'object') {
    console.warn('mapMission: raw is not an object', raw)
    return null
  }

  const category = raw.category ?? null

  const mapped = {
    ...raw,
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    coin: typeof raw.coin === 'number' ? raw.coin : Number(raw.coin ?? 0),
    image: raw.image ?? null,
    image_url: resolveUrl(raw.image),
    category,
    category_id: raw.category_id ?? category?.id ?? null,
    category_title: category?.title ?? '',
    category_slug: category?.slug ?? '',
    created_at: raw.created_at ?? null,
  }
  return mapped
}

export function mapUserMission(raw) {
  if (!raw || typeof raw !== 'object') {
    console.warn('mapUserMission: raw is not an object', raw)
    return null
  }

  const mission = raw.mission ?? null
  const category = raw.category ?? null

  const mapped = {
    ...raw,
    id: raw.id,
    user_id: raw.user_id,
    mission_id: raw.mission_id ?? mission?.id ?? null,
    category_id: raw.category_id ?? category?.id ?? null,
    status: raw.status ?? 'pending',
    mission: mission ? mapMission(mission) : null,
    category: category,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  }

  return mapped
}

