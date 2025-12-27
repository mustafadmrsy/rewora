import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, CheckCircle, Flag, Heart, MessageCircle, Send, MoreVertical, UserX, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, cn, GoldBadge, IconButton } from '../components/ui'
import { addReview, formatRelativeDate, getPost, listReviews, reportPost, resolvePostImageUrl, toggleLike, deletePost } from '../lib/postsApi'
import { getUser } from '../lib/authStorage'

export default function PostDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const toastTimer = useRef(null)
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comment, setComment] = useState('')
  const [imageError, setImageError] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  const currentUser = getUser()
  const isOwnPost = useMemo(() => {
    return currentUser?.id && post?.user_id && currentUser.id === post.user_id
  }, [currentUser?.id, post?.user_id])

  function CommentAvatar({ url }) {
    const [error, setError] = useState(false)

    return (
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/8">
        {url && !error ? (
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setError(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
        )}
      </div>
    )
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function showToast(title, message) {
    setToast({ title, message })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  function openMenuFrom(el) {
    const rect = el.getBoundingClientRect()
    const top = Math.min(window.innerHeight - 10, rect.bottom + 8)
    const left = Math.min(window.innerWidth - 10, rect.right)
    setMenuPos({ top, left })
    setMenuOpen(true)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const detail = await getPost(id)
        const reviewsRes = await listReviews(id)
        if (cancelled) return

        setPost(detail.post)
        setLikes(detail.post?.likes ?? 0)
        setLiked(Boolean(detail.post?.is_liked))

        const mapped = (reviewsRes ?? []).map((r) => ({
          id: r?.id ?? r?.review_id ?? Date.now(),
          user: r?.user?.username ? `@${r.user.username}` : r?.user?.fname ? `@${r.user.fname}` : '@kullanici',
          text: r?.review ?? r?.content ?? r?.text ?? '',
          time: r?.created_at ? formatRelativeDate(r.created_at) : '',
          user_photo_url: resolvePostImageUrl(r?.user?.photo ?? null),
        }))
        setComments(mapped)
        setPost((prev) => (prev ? { ...prev, comments: mapped.length } : prev))
      } catch {
        if (cancelled) return
        setPost(null)
        setComments([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (id) load()

    return () => {
      cancelled = true
    }
  }, [id])

  async function submitComment() {
    const trimmed = comment.trim()
    if (!trimmed) return

    try {
      await addReview({ postId: id, review: trimmed })
      setComment('')
      const reviewsRes = await listReviews(id)
      const mapped = (reviewsRes ?? []).map((r) => ({
        id: r?.id ?? r?.review_id ?? Date.now(),
        user: r?.user?.username ? `@${r.user.username}` : r?.user?.fname ? `@${r.user.fname}` : '@kullanici',
        text: r?.review ?? r?.content ?? r?.text ?? '',
        time: r?.created_at ? new Date(r.created_at).toLocaleString('tr-TR') : '',
        user_photo_url: resolvePostImageUrl(r?.user?.photo ?? null),
      }))
      setComments(mapped)
      setPost((prev) => (prev ? { ...prev, comments: mapped.length } : prev))
    } catch {
      showToast('Hata', 'Yorum eklenemedi. Lütfen tekrar deneyin.')
    }
  }

  if (!post && !loading) {
    return (
      <div className="mx-auto max-w-[920px]">
        <Card>
          <div className="p-6">
            <div className="text-sm font-semibold text-white">Gönderi bulunamadı</div>
            <div className="mt-2 text-sm text-white/55">Bu gönderi silinmiş veya taşınmış olabilir.</div>
            <div className="mt-5">
              <Button variant="secondary" onClick={() => navigate(-1)} type="button">
                Geri dön
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  function renderComment(c) {
    return (
      <div key={c.id} className="flex items-start gap-2">
        <CommentAvatar url={c.user_photo_url} />
        <div className="min-w-0 flex-1 text-sm text-white/80">
          <span className="font-semibold text-white">{c.user}</span>{' '}
          <span className="font-semibold text-white">{c.text}</span>
          <span className="ml-2 text-xs text-white/40">{c.time}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header - geri butonu ve altın */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="inline-flex items-center justify-center text-white/80 transition hover:text-white"
            aria-label="Geri"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {post?.gold ? (
              <GoldBadge className="justify-center">
                <span className="text-xs font-semibold">{post.gold}</span>
                <span className="text-xs font-semibold">altın</span>
              </GoldBadge>
            ) : null}
            <IconButton
              type="button"
              aria-label="Diğer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openMenuFrom(e.currentTarget)
              }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <Card className="overflow-hidden">
            <div className="relative">
              {post?.image_url && !imageError ? (
                <img
                  src={post.image_url}
                  alt=""
                  className="aspect-square w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="aspect-square w-full bg-gradient-to-br from-white/10 via-white/0 to-[color:var(--gold)]/12" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(214,255,0,0.16),transparent_50%)]" />
            </div>
          </Card>

          <Card className="overflow-hidden lg:sticky lg:top-24 lg:h-[calc(100vh-220px)]">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-5 pt-5">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/8">
                  {post?.user_photo_url && !avatarError ? (
                    <img
                      src={post.user_photo_url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold text-white">{post?.handle ?? ''}</div>
                    <div className="text-xs text-white/45">{post?.time ?? ''}</div>
                  </div>
                  <div className="truncate text-xs text-white/45">{post?.category ?? ''}</div>
                </div>
                <IconButton
                  type="button"
                  aria-label="Diğer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openMenuFrom(e.currentTarget)
                  }}
                >
                  <MoreVertical size={18} />
                </IconButton>
              </div>

              <div className="px-5 pt-4 pb-3 border-b border-white/10">
                {post?.caption ? (
                  <div className="text-sm text-white/80 leading-relaxed">
                    <span className="font-semibold text-white">{post?.handle ?? ''}</span>{' '}
                    <span className="text-white/75">{post?.caption ?? ''}</span>
                  </div>
                ) : (
                  <div className="text-sm text-white/60">Bu gönderi için açıklama eklenmemiş.</div>
                )}
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <button
                    className={cn(
                      'inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white',
                      liked ? 'text-[color:var(--gold)]' : '',
                    )}
                    onClick={async () => {
                      const prevLiked = liked
                      setLiked((v) => !v)
                      setLikes((n) => Math.max(0, n + (prevLiked ? -1 : 1)))
                      try {
                        await toggleLike(id)
                      } catch {
                        setLiked(prevLiked)
                        setLikes((n) => Math.max(0, n + (prevLiked ? 1 : -1)))
                        showToast('Hata', 'Beğeni güncellenemedi.')
                      }
                    }}
                    type="button"
                  >
                    <Heart size={18} className={liked ? 'text-[color:var(--gold)]' : 'text-white/70'} />
                    <span>{likes}</span>
                  </button>

                  <div className="inline-flex items-center gap-2 text-sm text-white/70">
                    <MessageCircle size={18} className="text-white/70" />
                    <span>{post?.comments ?? 0}</span>
                  </div>
                </div>

                <div className="text-xs text-white/45">{post?.time ?? ''}</div>
              </div>

              <div className="flex-1 overflow-auto px-5 pb-4 rewora-scroll">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-sm text-white/55">Yükleniyor...</div>
                  ) : (
                    comments.map((c) => renderComment(c))
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/8">
                    <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                  </div>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      if (e.shiftKey) return
                      e.preventDefault()
                      submitComment()
                    }}
                    placeholder="Yorum yaz..."
                    className="h-11 flex-1 rounded-full border border-white/12 bg-white/6 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--gold)]/40"
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={submitComment}
                    className="px-4"
                    disabled={!comment.trim()}
                    aria-label="Gönder"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50"
          onPointerDown={() => setMenuOpen(false)}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="fixed w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-black/90 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur"
            style={{ top: menuPos.top, left: Math.max(12, menuPos.left - 240) }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {isOwnPost ? (
              <button
                type="button"
                className="w-full px-4 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-500/10 transition flex items-center gap-3"
                onClick={async () => {
                  setMenuOpen(false)
                  try {
                    await deletePost(id)
                    showToast('Başarılı', 'Gönderi silindi.')
                    setTimeout(() => {
                      navigate(-1)
                    }, 1000)
                  } catch {
                    showToast('Hata', 'Gönderi silinemedi.')
                  }
                }}
              >
                <Trash2 size={16} className="text-red-200" />
                Sil
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-500/10 transition flex items-center gap-3"
                  onClick={() => {
                    setMenuOpen(false)
                    showToast('Başarılı', 'Kullanıcı engellendi.')
                  }}
                >
                  <UserX size={16} className="text-red-200" />
                  Kullanıcıyı engelle
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-500/10 transition flex items-center gap-3"
                  onClick={() => {
                    setMenuOpen(false)
                    setReportOpen(true)
                  }}
                >
                  <Flag size={16} className="text-red-200" />
                  Gönderiyi şikayet et
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {reportOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onPointerDown={() => setReportOpen(false)}
          onClick={() => setReportOpen(false)}
        >
          <div
            className="mx-auto flex h-full w-full max-w-[520px] items-center p-3"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full rounded-[22px] border border-white/12 bg-[color:var(--bg-1)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Gönderiyi şikayet et</div>
                <button
                  type="button"
                  className="inline-flex h-9 px-3 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 text-xs cursor-pointer"
                  onClick={() => setReportOpen(false)}
                >
                  Kapat
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/85 cursor-pointer">
                  <input
                    type="radio"
                    name={`reason-post-${post.id}`}
                    value="spam"
                    checked={reportReason === 'spam'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="h-4 w-4 accent-[color:var(--gold)]"
                  />
                  Spam
                </label>
                <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/85 cursor-pointer">
                  <input
                    type="radio"
                    name={`reason-post-${post.id}`}
                    value="uygunsuz"
                    checked={reportReason === 'uygunsuz'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="h-4 w-4 accent-[color:var(--gold)]"
                  />
                  Uygunsuz
                </label>
                <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/85 cursor-pointer">
                  <input
                    type="radio"
                    name={`reason-post-${post.id}`}
                    value="taciz_siddet"
                    checked={reportReason === 'taciz_siddet'}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="h-4 w-4 accent-[color:var(--gold)]"
                  />
                  Taciz/Şiddet
                </label>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-white/70">Lütfen şikayet nedenini açıklayınız</div>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-[18px] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--gold)]/40"
                  placeholder="Kısa bir açıklama yaz..."
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 h-11 rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/85 hover:bg-white/10 transition cursor-pointer"
                  onClick={() => setReportOpen(false)}
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-full border border-red-500/25 bg-red-500/10 text-sm font-semibold text-red-200 hover:bg-red-500/15 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                  disabled={!reportReason || !reportDetails.trim()}
                  onClick={async () => {
                    try {
                      await reportPost({ postId: id, reason: reportReason, content: reportDetails })
                      setReportOpen(false)
                      setReportReason('')
                      setReportDetails('')
                      showToast('Başarılı', 'Şikayetiniz başarıyla gönderildi.')
                    } catch {
                      showToast('Hata', 'Şikayet gönderilemedi.')
                    }
                  }}
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed left-1/2 top-6 z-[70] w-[92%] max-w-[460px] -translate-x-1/2 rounded-[20px] border border-white/12 bg-black/85 px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-emerald-400">
              <CheckCircle size={22} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-emerald-400">{toast.title}</div>
              <div className="text-sm leading-relaxed text-white/85">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto text-white/60 transition hover:text-white"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
