import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, Flag, Heart, MessageCircle, MoreVertical, Send, UserX } from 'lucide-react'
import Card from '../../../components/Card'
import { addReview, listReviews, resolvePostImageUrl } from '../../../lib/postsApi'

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

export default function FeedCard({ post, liked, likes, onLike, onOpen }) {
  const [openComments, setOpenComments] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const toastTimer = useRef(null)
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

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
    const top = rect.bottom + 8
    const left = rect.right
    setMenuPos({ top, left })
    setMenuOpen(true)
  }
  const [commentItems, setCommentItems] = useState([])
  const [commentDraft, setCommentDraft] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    if (!openComments) return
    if (!post?.id) return

    let cancelled = false

    async function loadComments() {
      setCommentsLoading(true)
      try {
        const res = await listReviews(post.id)
        if (cancelled) return
        const mapped = (res ?? []).map((r) => ({
          id: r?.id ?? r?.review_id ?? Date.now(),
          user: r?.user?.username ? `@${r.user.username}` : r?.user?.fname ? `@${r.user.fname}` : '@kullanici',
          text: r?.review ?? r?.content ?? r?.text ?? '',
          time: r?.created_at ? new Date(r.created_at).toLocaleString('tr-TR') : '',
          user_photo_url: resolvePostImageUrl(r?.user?.photo ?? null),
        }))
        setCommentItems(mapped)
      } finally {
        if (!cancelled) setCommentsLoading(false)
      }
    }

    loadComments()
    return () => {
      cancelled = true
    }
  }, [openComments, post?.id])

  async function submitComment() {
    const trimmed = commentDraft.trim()
    if (!trimmed) return
    if (!post?.id) return

    try {
      await addReview({ postId: post.id, review: trimmed })
      setCommentDraft('')
      const res = await listReviews(post.id)
      const mapped = (res ?? []).map((r) => ({
        id: r?.id ?? r?.review_id ?? Date.now(),
        user: r?.user?.username ? `@${r.user.username}` : r?.user?.fname ? `@${r.user.fname}` : '@kullanici',
        text: r?.review ?? r?.content ?? r?.text ?? '',
        time: r?.created_at ? new Date(r.created_at).toLocaleString('tr-TR') : '',
        user_photo_url: resolvePostImageUrl(r?.user?.photo ?? null),
      }))
      setCommentItems(mapped)
    } catch {
      showToast('Hata', 'Yorum eklenemedi. Lütfen tekrar deneyin.')
    }
  }

  return (
    <Card className="group hover:scale-[1.005] hover:border-white/12 hover:bg-white/6 hover:shadow-[var(--shadow)]">
      <div className="p-4">
        <div className="flex items-center gap-3">
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
            <div className="truncate text-xs text-white/45">{post?.subtitle ?? ''}</div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/60 transition hover:bg-white/10 hover:text-white cursor-pointer"
            aria-label="Diğer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openMenuFrom(e.currentTarget)
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>

        <div
          className="relative mt-4 overflow-hidden rounded-[18px] border border-white/10 bg-white/6 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpen()
          }}
          aria-label="Gönderiyi aç"
        >
          {post?.image_url && !imageError ? (
            <img
              src={post.image_url}
              alt=""
              className="aspect-square w-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="aspect-square w-full bg-gradient-to-br from-white/10 via-white/0 to-[color:var(--gold)]/10" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(214,255,0,0.16),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {post.caption ? (
          <div className="mt-3 text-sm text-white/80">
            <span className="font-semibold text-white">{post.handle}</span>{' '}
            <span className="text-white/75">{post.caption}</span>
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike()
              }}
              type="button"
            >
              <Heart
                size={18}
                className={liked ? 'text-red-500' : 'text-white/70'}
                fill={liked ? 'currentColor' : 'none'}
              />
              <span>{likes}</span>
            </button>
            <button
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpenComments((v) => !v)
              }}
              type="button"
            >
              <MessageCircle size={18} className="text-white/70" />
              <span>{post?.comments ?? 0}</span>
            </button>
          </div>

          <div className="text-xs text-white/45">{post.category}</div>
        </div>

        {openComments ? (
          <div className="mt-4 rounded-[16px] border border-white/10 bg-white/4 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Yorumlar</div>
              <button
                type="button"
                onClick={() => setOpenComments(false)}
                className="text-xs font-medium text-white/60 transition hover:text-white"
              >
                Kapat
              </button>
            </div>

            <div className="mt-3 max-h-[190px] space-y-3 overflow-y-auto pr-1 rewora-scroll">
              {commentsLoading ? (
                <div className="text-xs text-white/55">Yükleniyor...</div>
              ) : commentItems.length ? (
                commentItems.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <CommentAvatar url={c.user_photo_url} />
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="min-w-0">
                        <span className="font-semibold text-white">{c.user}</span>{' '}
                        <span className="text-white/75">{c.text}</span>
                        <span className="ml-2 text-xs text-white/40">{c.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-white/55">Henüz yorum yok.</div>
              )}
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/8">
                  <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                </div>
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    if (e.shiftKey) return
                    e.preventDefault()
                    submitComment()
                  }}
                  placeholder="Yorum yaz..."
                  className="h-11 flex-1 rounded-full border border-white/12 bg-white/6 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--gold)]/40"
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] bg-white/10 text-white hover:bg-white/14 border border-white/10 h-10 px-4"
                  type="button"
                  disabled={!commentDraft.trim()}
                  aria-label="Gönder"
                  onClick={submitComment}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <>
              {menuOpen ? (
                <div
                  className="fixed inset-0 z-50"
                  onPointerDown={() => setMenuOpen(false)}
                  onClick={() => setMenuOpen(false)}
                >
                  <div
                    className="fixed w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-black/90 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur"
                    style={{
                      top: Math.min(window.innerHeight - 12, menuPos.top),
                      left: Math.min(
                        window.innerWidth - 12 - 240,
                        Math.max(12, menuPos.left - 240),
                      ),
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                            name={`reason-${post.id}`}
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
                            name={`reason-${post.id}`}
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
                            name={`reason-${post.id}`}
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
                          onClick={() => {
                            setReportOpen(false)
                            setReportReason('')
                            setReportDetails('')
                            showToast('Başarılı', 'Şikayetiniz başarıyla gönderildi.')
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
            </>,
            document.body,
          )
        : null}
    </Card>
  )
}
