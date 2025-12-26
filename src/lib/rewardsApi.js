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

function resolveUrl(url) {
  if (!url) return null
  if (typeof url !== 'string') return null
  const raw = url.trim()
  if (!raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return `${PUBLIC_ORIGIN}${raw}`
  return `${PUBLIC_ORIGIN}/${raw}`
}

export function mapOffer(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.offer_id
  const title = raw.title ?? raw.name ?? raw.offer_title ?? ''
  const vendor = raw.company?.title ?? raw.company?.name ?? raw.vendor ?? raw.brand ?? ''

  const discount =
    typeof raw.discount === 'number'
      ? raw.discount
      : typeof raw.discount_rate === 'number'
        ? raw.discount_rate
        : Number(raw.discount ?? raw.discount_rate ?? 0)

  const price =
    typeof raw.coin === 'number'
      ? raw.coin
      : typeof raw.price === 'number'
        ? raw.price
        : typeof raw.cost === 'number'
          ? raw.cost
          : Number(raw.coin ?? raw.price ?? raw.cost ?? 0)

  const image = raw.image ?? raw.photo ?? raw.cover ?? raw.banner ?? null

  return {
    ...raw,
    id,
    title,
    vendor,
    discount,
    price,
    image,
    image_url: resolveUrl(image),
    description: raw.description ?? raw.desc ?? raw.content ?? '',
  }
}

export function mapUserOffer(raw) {
  if (!raw || typeof raw !== 'object') return null

  const offer = raw.offer ? mapOffer(raw.offer) : null
  const id = raw.id ?? raw.user_offer_id ?? offer?.id

  return {
    ...raw,
    id,
    offer,
    title: offer?.title ?? raw.title ?? '',
    vendor: offer?.vendor ?? raw.vendor ?? '',
    discount: offer?.discount ?? 0,
    price: offer?.price ?? 0,
    image_url: offer?.image_url ?? null,
    description: offer?.description ?? '',
  }
}

export async function listOffers() {
  const res = await api.get('/offer')
  const data = res?.data ?? res

  const payload =
    data?.offers ??
    data?.data?.offers ??
    data?.data ??
    data

  const list =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : toArray(payload)

  const offers = list.map(mapOffer).filter(Boolean)

  const user = data?.user ?? data?.data?.user ?? null
  return { offers, user, meta: payload ?? null }
}

export async function listUserOffers() {
  const res = await api.get('/offer/user')
  const data = res?.data ?? res

  const payload =
    data?.userOffers ??
    data?.user_offers ??
    data?.data?.userOffers ??
    data?.data?.user_offers ??
    data?.data ??
    data

  const list =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : toArray(payload)

  const userOffers = list.map(mapUserOffer).filter(Boolean)
  const user = data?.user ?? data?.data?.user ?? null

  return { userOffers, user, meta: payload ?? null }
}

export async function redeemOffer(offerId) {
  return api.get(`/offer/get/${offerId}`)
}
