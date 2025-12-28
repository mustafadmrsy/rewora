import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Menu, Search, CircleDollarSign } from 'lucide-react'
import { GoldBadge } from '../components/ui'
import { useNavigate, useParams } from 'react-router-dom'
import { getProfile, toggleLike, resolvePostImageUrl, getFollowers, getFollowing } from '../lib/postsApi'
import FeedCard from './home/components/FeedCard'
import { getUser, clearSession } from '../lib/authStorage'
import { resetEcho } from '../lib/echoService'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = getUser()
  const currentUserId = currentUser?.id
  
  // If no id provided, use current user's id
  const profileId = id || currentUserId
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const modalPanelRef = useRef(null)
  
  const [likedIds, setLikedIds] = useState(() => new Set())
  const [likeCounts, setLikeCounts] = useState(() => {
    const map = {}
    posts.forEach((p) => {
      map[p.id] = p.likes
    })
    return map
  })

  const isOwn = !id || id === 'me' || String(profileId) === String(currentUserId)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setModal(null)
        setMenuOpen(false)
      }
    }
    function onProfileMenuOpen() {
      if (isOwn) {
        setMenuOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('profileMenuOpen', onProfileMenuOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('profileMenuOpen', onProfileMenuOpen)
    }
  }, [isOwn])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!profileId) return
      setLoading(true)
      try {
        const res = await getProfile(profileId)
        if (cancelled) return
        
        setProfile(res.profile)
        setPosts(res.posts ?? [])
        setPagination(res.pagination)
        
        // Set liked posts
        const likedSet = new Set()
        res.posts?.forEach((p) => {
          if (p?.is_liked) likedSet.add(p.id)
        })
        setLikedIds(likedSet)
        
        // Set like counts
        const counts = {}
        res.posts?.forEach((p) => {
          counts[p.id] = p.likes ?? 0
        })
        setLikeCounts(counts)
      } catch {
        if (cancelled) return
        setProfile(null)
        setPosts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [profileId])

  const followersCount = profile?.followers_count ?? 0
  const followingCount = profile?.following_count ?? 0
  const postsCount = profile?.posts_count ?? 0

  async function openList(kind) {
    setModal(kind)
    
    // Load followers or following when modal opens
    if (kind === 'followers' && followers.length === 0 && !loadingFollowers) {
      setLoadingFollowers(true)
      try {
        const data = await getFollowers(profileId)
        setFollowers(data)
      } catch (err) {
        setFollowers([])
      } finally {
        setLoadingFollowers(false)
      }
    } else if (kind === 'following' && following.length === 0 && !loadingFollowing) {
      setLoadingFollowing(true)
      try {
        const data = await getFollowing(profileId)
        setFollowing(data)
      } catch (err) {
        setFollowing([])
      } finally {
        setLoadingFollowing(false)
      }
    }
  }

  function onUserClick(userId) {
    setModal(null)
    navigate(`/profil/${userId}`)
  }

  async function handleLike(postId) {
    const wasLiked = likedIds.has(postId)
    const newLikedIds = new Set(likedIds)
    if (wasLiked) {
      newLikedIds.delete(postId)
    } else {
      newLikedIds.add(postId)
    }
    setLikedIds(newLikedIds)

    const currentCount = likeCounts[postId] ?? 0
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    }))

    try {
      await toggleLike(postId)
    } catch {
      // Revert on error
      setLikedIds(likedIds)
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: currentCount,
      }))
    }
  }

  function handlePostClick(postId) {
    navigate(`/post/${postId}`)
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[520px] lg:max-w-[920px]">
        <div className="relative flex items-center justify-center py-2">
          <div className="text-xl font-semibold tracking-tight text-white">Profil</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-[92px] w-[92px] rounded-full border-2 border-[color:var(--gold)] bg-white/8 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-[520px] lg:max-w-[920px]">
        <div className="relative flex items-center justify-center py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
            aria-label="Geri"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-xl font-semibold tracking-tight text-white">Profil</div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-semibold text-white">Profil bulunamadı</div>
          <div className="mt-2 text-sm text-white/50">Bu kullanıcı bulunamadı veya silinmiş olabilir.</div>
        </div>
      </div>
    )
  }

  const fullName = profile.fname && profile.lname 
    ? `${profile.fname} ${profile.lname}` 
    : profile.fname || profile.lname || 'Kullanıcı'
  const photoUrl = resolvePostImageUrl(profile.photo)

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-[92px] w-[92px] rounded-full border-2 border-[color:var(--gold)] bg-white/8 overflow-hidden">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={fullName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="min-w-[64px] text-center">
            <div className="text-lg font-semibold text-white">{postsCount}</div>
            <div className="text-xs text-white/60">Post</div>
          </div>
          <button
            type="button"
            className="min-w-[64px] text-center cursor-pointer"
            onClick={() => openList('followers')}
          >
            <div className="text-lg font-semibold text-white">{followersCount}</div>
            <div className="text-xs text-white/60">Takipçi</div>
          </button>
          <button
            type="button"
            className="min-w-[64px] text-center cursor-pointer"
            onClick={() => openList('following')}
          >
            <div className="text-lg font-semibold text-white">{followingCount}</div>
            <div className="text-xs text-white/60">Takip</div>
          </button>
        </div>
      </div>

      <div>
        <div className="text-lg font-semibold text-white">{fullName}</div>
        {isOwn && (
          <GoldBadge className="mt-2 w-fit">
            <CircleDollarSign size={16} />
            <span className="text-sm font-semibold">{currentUser?.coin ?? 0} altın</span>
          </GoldBadge>
        )}
      </div>

      {posts.length > 0 ? (
        <div>
          <div className="grid grid-cols-3 gap-[6px]">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handlePostClick(post.id)}
                className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-white/10 bg-white/6 hover:border-white/20 transition cursor-pointer group"
                aria-label="Post detayını görüntüle"
              >
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt="" 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/4 to-white/10" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border border-white/10 bg-white/6" />
            <div className="absolute inset-0 grid place-items-center text-white/55">
              <Search size={28} />
            </div>
          </div>
          <div className="mt-4 text-sm text-white/50">Henüz gönderi bulunmamaktadır.</div>
        </div>
      )}

      {modal ? (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          onPointerDown={() => setModal(null)}
          onClick={() => setModal(null)}
        >
          <div
            className="mx-auto flex h-full w-full max-w-[520px] items-center p-3"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={modalPanelRef}
              className="w-full rounded-[22px] border border-white/12 bg-[color:var(--bg-1)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  {modal === 'followers' ? 'Takipçiler' : 'Takip'}
                </div>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="inline-flex h-9 px-3 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 text-xs"
                >
                  Kapat
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto rewora-scroll pr-1">
                {(modal === 'followers' ? loadingFollowers : loadingFollowing) ? (
                  <div className="text-center text-sm text-white/50 py-4">Yükleniyor...</div>
                ) : (modal === 'followers' ? followers : following).length > 0 ? (
                  (modal === 'followers' ? followers : following).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-white/6 px-3 py-3"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                        onClick={() => onUserClick(u.id)}
                      >
                        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10 overflow-hidden shrink-0">
                          {u.photo_url ? (
                            <img 
                              src={u.photo_url} 
                              alt={u.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{u.name}</div>
                          {u.subtitle && (
                            <div className="truncate text-xs text-white/55">{u.subtitle}</div>
                          )}
                        </div>
                      </button>
                      {isOwn && (
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/6 px-3 text-xs font-semibold text-white/85 hover:bg-white/10 cursor-pointer"
                        >
                          {modal === 'followers' ? 'Çıkar' : 'Takibi bırak'}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-white/50 py-4">
                    {modal === 'followers' ? 'Henüz takipçi yok.' : 'Henüz takip edilen yok.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-[color:var(--bg-1)]"
          onPointerDown={() => setMenuOpen(false)}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="mx-auto flex h-full w-full max-w-[520px] lg:max-w-[920px] flex-col"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex shrink-0 items-center justify-center px-4 py-3">
              <button
                type="button"
                className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 cursor-pointer"
                aria-label="Geri"
                onClick={() => setMenuOpen(false)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-lg font-semibold text-white">Menü</div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-6 lg:pt-2 pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-6">
              <div className="space-y-3">
                {isOwn ? (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  >
                    <div className="text-sm font-semibold text-white">Profili Düzenle</div>
                    <ChevronRight size={18} className="text-white/60" />
                  </button>
                ) : null}

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/oduller')
                  }}
                >
                  <div className="text-sm font-semibold text-white">Ödül Geçmişim</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/gorevler')
                  }}
                >
                  <div className="text-sm font-semibold text-white">Görev Geçmişim</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Güvenlik</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Engellenen Kullanıcılar</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <div className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4">
                  <div className="text-sm font-semibold text-white">Bildirimler</div>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled((v) => !v)}
                    className={`relative h-7 w-12 rounded-full border border-white/10 transition cursor-pointer ${
                      notificationsEnabled ? 'bg-emerald-500/90' : 'bg-white/12'
                    }`}
                    aria-label="Bildirimleri aç/kapat"
                  >
                    <span
                      className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${
                        notificationsEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Gizlilik Politikası</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Kullanıcı Sözleşmesi</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Hesabımı Sil</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearSession()
                    resetEcho()
                    navigate('/giris')
                  }}
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Çıkış yap</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
