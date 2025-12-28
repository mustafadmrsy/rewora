import React, { useEffect, useMemo, useState, useCallback } from 'react'
import Card from '../components/Card'
import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listNotifications, markAllNotificationsRead } from '../lib/notificationsApi'

export default function Notifications() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('tum')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  // Initial load
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await listNotifications()
        if (cancelled) return
        setItems(res.notifications ?? [])
        setHasMore(res.pagination?.next_page_url ? true : false)
        setPage(1)
      } catch {
        if (cancelled) return
        setItems([])
        setHasMore(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Load more notifications on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await listNotifications(nextPage)

      if (res.notifications && res.notifications.length > 0) {
        setItems((prev) => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = res.notifications.filter(item => item.id && !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
        setPage(nextPage)
        setHasMore(res.pagination?.next_page_url ? true : false)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading more notifications:', err)
      }
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [page, loadingMore, hasMore])

  // Handle scroll for infinite loading (window scroll like Home page)
  useEffect(() => {
    function handleScroll() {
      // Load more when scrolled near bottom (within 300px)
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop - clientHeight < 300 && hasMore && !loadingMore) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore, loadingMore, loadMore])

  const filtered = useMemo(() => {
    if (filter === 'tum') return items
    return items.filter((d) => d.type === filter)
  }, [filter, items])

  function goToTarget(item) {
    const page = String(item?.target_page ?? '').toLowerCase()
    const id = item?.target_id
    if (!page) return

    if ((page === 'post' || page === 'post_detail' || page === 'postdetail') && id) {
      navigate(`/post/${id}`)
      return
    }

    if ((page === 'profile' || page === 'profil') && id) {
      navigate(`/profil/${id}`)
      return
    }

    if (page === 'gorevler' || page === 'gorev' || page === 'task' || page === 'tasks') {
      navigate(id ? `/gorevler/${id}` : '/gorevler')
      return
    }

    if (page === 'oduller' || page === 'odul' || page === 'reward' || page === 'rewards') {
      navigate(id ? `/oduller/${id}` : '/oduller')
      return
    }
  }

  // Handle mark all read from header button
  useEffect(() => {
    function handleMarkAllRead() {
      if (marking) return
      async function markAll() {
        try {
          setMarking(true)
          await markAllNotificationsRead()
          const res = await listNotifications(1)
          setItems(res.notifications ?? [])
          setPage(1)
          setHasMore(res.pagination?.next_page_url ? true : false)
        } finally {
          setMarking(false)
        }
      }
      markAll()
    }

    window.addEventListener('markAllRead', handleMarkAllRead)
    return () => {
      window.removeEventListener('markAllRead', handleMarkAllRead)
    }
  }, [marking])

  return (
    <div className="space-y-5 w-full overflow-x-hidden">
      <div className="space-y-3 w-full overflow-x-hidden">
        {loading ? (
          <Card>
            <div className="p-5 text-sm text-white/60">Yükleniyor...</div>
          </Card>
        ) : filtered.length ? (
          <>
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="relative overflow-hidden cursor-pointer"
                onClick={() => goToTarget(item)}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(214,255,0,0.06),transparent_55%)]" />
                <div className="relative flex items-start gap-3 p-4 sm:p-5">
                  <div className="mt-1 h-12 w-12 overflow-hidden rounded-[14px] border border-white/10 bg-white/6">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                    <div className="text-sm font-semibold text-white break-words">{item.title}</div>
                    <div className="text-sm text-white/65 leading-relaxed break-words">{item.content}</div>
                    <div className="flex items-center gap-2 text-xs text-white/45">
                      <Clock size={14} />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {loadingMore && (
              <Card>
                <div className="p-5 text-sm text-white/60 text-center">Yükleniyor...</div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <div className="p-5 text-sm text-white/60">Bildirim bulunamadı.</div>
          </Card>
        )}
      </div>
    </div>
  )
}
