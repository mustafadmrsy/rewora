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

  // Discount: rate field is used in API response
  const discount =
    typeof raw.discount === 'number'
      ? raw.discount
      : typeof raw.rate === 'number'
        ? raw.rate
        : typeof raw.discount_rate === 'number'
          ? raw.discount_rate
          : Number(raw.discount ?? raw.rate ?? raw.discount_rate ?? 0)

  const price =
    typeof raw.coin === 'number'
      ? raw.coin
      : typeof raw.price === 'number'
        ? raw.price
        : typeof raw.cost === 'number'
          ? raw.cost
          : Number(raw.coin ?? raw.price ?? raw.cost ?? 0)

  const coin = typeof raw.coin === 'number' ? raw.coin : Number(raw.coin ?? 0)

  // Image: check offer image first, then company image/logo
  const image =
    raw.image ??
    raw.photo ??
    raw.cover ??
    raw.banner ??
    raw.company?.image ??
    raw.company?.logo ??
    null

  // Company logo for center circle
  const logo = raw.company?.logo ?? null
  const logo_url = resolveUrl(logo)

  // Company image for background
  const companyImage = raw.company?.image ?? null
  const companyImage_url = resolveUrl(companyImage)

  return {
    ...raw,
    id,
    title,
    vendor,
    discount,
    price,
    coin,
    image,
    image_url: resolveUrl(image),
    logo_url,
    company_image_url: companyImage_url,
    company: raw.company ?? null,
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
    company_image_url: offer?.company_image_url ?? null,
    logo_url: offer?.logo_url ?? null,
    company: offer?.company ?? null,
    description: offer?.description ?? '',
  }
}

export async function listOffers() {
  const res = await api.get('/offer')
  // Response format: { success: 200, message: "...", data: { data: [...], ...pagination } } or { data: [...] }
  const responseData = res?.data ?? {}
  
  // Handle paginated response: data can be { data: [...], current_page, ... } or direct array
  const payload =
    responseData?.offers ??
    responseData?.data ??
    responseData

  const list =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : toArray(payload)

  const offers = list.map(mapOffer).filter(Boolean)

  const user = responseData?.user ?? null
  return { offers, user, meta: payload ?? null }
}

export async function listUserOffers() {
  const res = await api.get('/offer/user')
  // Response format: { success: 200, message: "...", data: { userOffers: { data: [...], ...pagination } } } or { data: { userOffers: [...] } }
  const responseData = res?.data ?? {}
  
  // Handle paginated response: userOffers can be { data: [...], current_page, ... } or direct array
  const userOffersPayload =
    responseData?.userOffers ??
    responseData?.user_offers ??
    responseData?.data?.userOffers ??
    responseData?.data?.user_offers ??
    responseData?.data ??
    responseData

  const list =
    Array.isArray(userOffersPayload)
      ? userOffersPayload
      : Array.isArray(userOffersPayload?.data)
        ? userOffersPayload.data
        : toArray(userOffersPayload)

  const userOffers = list.map(mapUserOffer).filter(Boolean)
  const user = responseData?.user ?? null

  return { 
    userOffers, 
    user, 
    meta: userOffersPayload ?? null 
  }
}

export async function redeemOffer(offerId) {
  return api.get(`/offer/get/${offerId}`)
}
