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

  // QR categories mapping - backend'den qr_categories olarak geliyor
  const qrCategories = (raw.qr_categories ?? raw.qrCategories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name ?? '',
    photo: resolveUrl(cat.photo),
    products: (cat.products ?? []).map((prod) => ({
      id: prod.id,
      name: prod.name ?? '',
      description: prod.description ?? '',
      price: prod.price ?? 0,
      old_price: prod.old_price ?? null,
      photo: resolveUrl(prod.photo)
    }))
  }))

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
    qrCategories,
    qr_categories: qrCategories, // Backward compatibility
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
    code: raw.code ?? null,
    used: raw.used === true || raw.used === 1,
    products: raw.products ?? null,
    title: offer?.title ?? raw.title ?? '',
    vendor: offer?.vendor ?? raw.vendor ?? '',
    discount: offer?.discount ?? 0,
    price: offer?.price ?? 0,
    image_url: offer?.image_url ?? null,
    company_image_url: offer?.company_image_url ?? null,
    logo_url: offer?.logo_url ?? null,
    company: offer?.company ?? null,
    description: offer?.description ?? '',
    qrCategories: offer?.qrCategories ?? [],
    qr_categories: offer?.qr_categories ?? [],
  }
}

export async function listOffers(pageOrUrl = null) {
  try {
    // pageOrUrl can be a page number or next_page_url
    const url = typeof pageOrUrl === 'string' && pageOrUrl.startsWith('http')
      ? pageOrUrl.replace('https://rewora.com.tr/api', '')
      : pageOrUrl ? `/offer?page=${pageOrUrl}` : '/offer'

    const res = await api.get(url)
    const paginationWrapper = res?.data ?? res

    const offersList = Array.isArray(paginationWrapper?.data)
      ? paginationWrapper.data
      : toArray(paginationWrapper)

    const offers = offersList.map(mapOffer).filter(Boolean)

    return {
      offers,
      nextPageUrl: paginationWrapper?.next_page_url ?? null,
      currentPage: paginationWrapper?.current_page ?? 1,
      lastPage: paginationWrapper?.last_page ?? 1,
      total: paginationWrapper?.total ?? offers.length,
      meta: paginationWrapper ?? null
    }
  } catch (error) {
    console.error('listOffers error:', error)
    return {
      offers: [],
      nextPageUrl: null,
      currentPage: 1,
      lastPage: 1,
      total: 0,
      meta: null
    }
  }
}

export async function listUserOffers(page = 1) {
  try {
    const res = await api.get(`/offer/user?page=${page}`)

    // Backend response format:
    // { success: true, message: "...", data: { data: [...], current_page: 1, next_page_url: "..." } }
    // api.get() returns the full response object

    // Extract the pagination wrapper
    const paginationWrapper = res?.data ?? res

    // paginationWrapper.data is the actual array of user offers (Laravel pagination)
    const userOffersList = Array.isArray(paginationWrapper?.data)
      ? paginationWrapper.data
      : toArray(paginationWrapper)

    const userOffers = userOffersList.map(mapUserOffer).filter(Boolean)

    return {
      userOffers,
      currentPage: paginationWrapper?.current_page ?? page,
      nextPageUrl: paginationWrapper?.next_page_url ?? null,
      lastPage: paginationWrapper?.last_page ?? 1,
      total: paginationWrapper?.total ?? userOffers.length,
      meta: paginationWrapper ?? null
    }
  } catch (error) {
    console.error('listUserOffers error:', error)
    return {
      userOffers: [],
      currentPage: page,
      nextPageUrl: null,
      lastPage: 1,
      total: 0,
      meta: null
    }
  }
}

export async function redeemOffer(offerId) {
  return api.get(`/offer/get/${offerId}`)
}
