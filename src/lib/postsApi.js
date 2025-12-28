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

export function formatRelativeDate(dateInput) {
  if (!dateInput) return ''

  // Handle ISO 8601 format and other date strings
  let d
  if (typeof dateInput === 'string') {
    // Replace space with 'T' for ISO format if needed
    const normalized = dateInput.includes('T') ? dateInput : dateInput.replace(' ', 'T')
    d = new Date(normalized)
  } else {
    d = new Date(dateInput)
  }

  if (Number.isNaN(d.getTime())) {
    // Try parsing as timestamp
    const timestamp = typeof dateInput === 'string' ? Date.parse(dateInput) : dateInput
    if (!Number.isNaN(timestamp)) {
      d = new Date(timestamp)
    } else {
      return ''
    }
  }

  if (Number.isNaN(d.getTime())) return ''

  const diffMs = Date.now() - d.getTime()
  if (diffMs < 0) return 'şimdi' // Future date

  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (sec < 60) return `${sec}s`
  if (min < 60) return `${min}dk`
  if (hr < 24) return `${hr}sa`
  return `${day}g`
}

export function resolvePostImageUrl(image) {
  if (!image) return null
  if (typeof image !== 'string') return null
  const raw = image.trim()
  if (!raw) return null

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return `${PUBLIC_ORIGIN}${raw}`
  return `${PUBLIC_ORIGIN}/${raw}`
}

export function mapPost(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.post_id
  const user = raw.user ?? raw.owner ?? null

  const userPhoto = user?.photo ?? raw.user_photo ?? raw.photo ?? null
  const userPhotoUrl = resolvePostImageUrl(userPhoto)

  const categoryObj = raw.category ?? null
  const categorySlug = categoryObj?.slug ?? raw.category_slug ?? null
  const categoryTitle = categoryObj?.title ?? categoryObj?.name ?? raw.category_title ?? null

  const handle =
    raw.handle ??
    raw.username ??
    (user?.username
      ? `@${user.username}`
      : user?.fname
        ? `@${user.fname}`
        : raw.user_id
          ? `@user${raw.user_id}`
          : '@user')

  const subtitle =
    raw.subtitle ??
    (user?.fname || user?.lname ? `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim() : user?.email ?? '')

  const category = categorySlug
    ? `#${categorySlug}`
    : categoryTitle
      ? `#${String(categoryTitle).toLowerCase()}`
      : raw.category_id
        ? `#kategori_${raw.category_id}`
        : '#tümü'

  const caption = raw.caption ?? raw.content ?? ''

  const likes =
    typeof raw.likes === 'number'
      ? raw.likes
      : typeof raw.like === 'number'
        ? raw.like
        : typeof raw.like_count === 'number'
          ? raw.like_count
          : 0

  const comments =
    typeof raw.comments === 'number'
      ? raw.comments
      : typeof raw.review === 'number'
        ? raw.review
        : typeof raw.review_count === 'number'
          ? raw.review_count
          : 0

  const image = raw.image ?? raw.photo ?? raw.media ?? null
  const imageUrl = resolvePostImageUrl(image)

  const isLiked = Boolean(raw.is_liked)

  return {
    ...raw,
    id,
    user_id: raw.user_id ?? user?.id ?? null,
    handle,
    subtitle,
    category,
    category_slug: categorySlug,
    category_title: categoryTitle,
    caption,
    likes,
    comments,
    time: raw.time ?? formatRelativeDate(raw.created_at),
    gold: raw.gold ?? raw.coin ?? raw.reward ?? 0,
    image,
    image_url: imageUrl,
    user,
    user_photo_url: userPhotoUrl,
    is_liked: isLiked,
  }
}

export async function listPosts() {
  const res = await api.get('/post')
  const data = res?.data ?? {}

  const postsPayload = data.posts
  const postsRaw =
    Array.isArray(postsPayload)
      ? postsPayload
      : Array.isArray(postsPayload?.data)
        ? postsPayload.data
        : toArray(postsPayload)

  const posts = postsRaw.map(mapPost).filter(Boolean)
  return {
    posts,
    categories: data.categories ?? [],
    user: data.user ?? null,
    meta: postsPayload ?? null,
    continue_mission: data.continiue_mission ?? data.continue_mission ?? null, // Backend'de typo var: continiue_mission
    last_three_offers: data.last_three_offers ?? []
  }
}

export async function getPost(postId) {
  const res = await api.get(`/post/${postId}`)
  const raw = res?.data?.post ?? null
  return { post: mapPost(raw), user: res?.data?.user ?? null }
}

export async function toggleLike(postId) {
  return api.post('/post/like/update', { post_id: Number(postId) })
}

export async function listReviews(postId) {
  const res = await api.get(`/post/review/${postId}`)
  const payload = res?.data ?? res

  const candidates = [
    payload?.reviews,
    payload?.data?.reviews,
    payload?.data,
    payload?.reviews?.data,
    payload?.data?.data,
    payload,
  ]

  for (const c of candidates) {
    const arr = toArray(c)
    if (arr.length) return arr
  }

  return []
}

export async function addReview({ postId, review }) {
  return api.post('/post/review/store', { post_id: Number(postId), review })
}

export async function reportPost({ postId, reason, content }) {
  return api.post(`/post/report/${postId}`, { reason, content })
}

export async function deletePost(postId) {
  return api.del(`/post/${postId}/delete`)
}

export async function getProfile(userId) {
  const res = await api.get(`/profile/${userId}`)
  // Response format: { success: true, message: "...", data: { profile: {...}, posts: [...], pagination: {...} } }
  const responseData = res?.data ?? {}

  const profile = responseData.profile ?? null
  const posts = Array.isArray(responseData.posts) ? responseData.posts : []
  const pagination = responseData.pagination ?? responseData.posts_pagination ?? null

  // Map posts using mapPost function - posts may have different structure in profile
  const mappedPosts = posts.map((p) => {
    // If post already has full structure, use mapPost
    // Otherwise, map minimal structure for profile posts
    if (p.id && p.image) {
      return {
        id: p.id,
        image: p.image,
        image_url: resolvePostImageUrl(p.image),
        // Add other fields if available
        ...mapPost(p),
      }
    }
    return mapPost(p)
  }).filter(Boolean)

  return {
    profile,
    posts: mappedPosts,
    pagination,
    is_following: responseData.is_following ?? false,
    is_follower: responseData.is_follower ?? false,
  }
}

export async function getFollowers(userId) {
  const res = await api.get(`/followers/${userId}`)
  // Response format: { success: true, message: "...", data: { followers: { data: [{ follower: {...} }] } } }
  const responseData = res?.data ?? res ?? {}

  // Handle paginated response: data.followers.data[].follower
  const followersPayload = responseData.followers ?? responseData.data?.followers ?? {}
  const followersList = Array.isArray(followersPayload.data) ? followersPayload.data : []

  return followersList.map((item) => {
    if (!item || typeof item !== 'object') return null
    const follower = item.follower ?? item ?? {}
    return {
      id: follower.id,
      name: follower.fname && follower.lname ? `${follower.fname} ${follower.lname}` : follower.fname || follower.lname || 'Kullanıcı',
      username: follower.username ?? null,
      photo: follower.photo ?? null,
      photo_url: resolvePostImageUrl(follower.photo ?? null),
      subtitle: follower.username ? `@${follower.username}` : null,
    }
  }).filter(Boolean)
}

export async function getFollowing(userId) {
  const res = await api.get(`/following/${userId}`)
  // Response format: { success: true, message: "...", data: { following: { data: [{ following: {...} }] } } }
  const responseData = res?.data ?? res ?? {}

  // Handle paginated response: data.following.data[].following
  const followingPayload = responseData.following ?? responseData.data?.following ?? {}
  const followingList = Array.isArray(followingPayload.data) ? followingPayload.data : []

  return followingList.map((item) => {
    if (!item || typeof item !== 'object') return null
    const following = item.following ?? item ?? {}
    return {
      id: following.id,
      name: following.fname && following.lname ? `${following.fname} ${following.lname}` : following.fname || following.lname || 'Kullanıcı',
      username: following.username ?? null,
      photo: following.photo ?? null,
      photo_url: resolvePostImageUrl(following.photo ?? null),
      subtitle: following.username ? `@${following.username}` : null,
    }
  }).filter(Boolean)
}

export async function updatePassword(password, passwordConfirmation) {
  const res = await api.post('/profile', {
    password,
    password_confirmation: passwordConfirmation,
  })
  return res?.data ?? res
}
