import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { Bell, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip } from '../components/ui'
import { listNotifications, markAllNotificationsRead } from '../lib/notificationsApi'

export default function Notifications() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('tum')
  const pageSize = 4
  const [page, setPage] = useState(0)

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await listNotifications()
        if (cancelled) return
        setItems(res.notifications ?? [])
      } catch {
        if (cancelled) return
        setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'tum') return items
    return items.filter((d) => d.type === filter)
  }, [filter, items])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = useMemo(
    () => filtered.slice(page * pageSize, page * pageSize + pageSize),
    [filtered, page],
  )

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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[color:var(--gold)]">
          <Bell size={18} />
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight text-white">Bildirimler</div>
          <div className="text-sm text-white/60">Görev ve ödül güncellemelerini buradan takip et.</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="text-[11px] font-semibold text-white"
            type="button"
            disabled={marking || loading}
            onClick={async () => {
              if (marking) return
              try {
                setMarking(true)
                await markAllNotificationsRead()
                const res = await listNotifications()
                setItems(res.notifications ?? [])
              } finally {
                setMarking(false)
              }
            }}
          >
            {marking ? 'İşleniyor...' : 'Tümünü okundu yap'}
          </Button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Önceki"
          >
            ‹
          </button>
          <div className="text-xs font-semibold text-white/70">
            {page + 1}/{totalPages}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Sonraki"
          >
            ›
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card>
            <div className="p-5 text-sm text-white/60">Yükleniyor...</div>
          </Card>
        ) : current.length ? (
          current.map((item) => (
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
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="text-sm text-white/65 leading-relaxed">{item.content}</div>
                  <div className="flex items-center gap-2 text-xs text-white/45">
                    <Clock size={14} />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-5 text-sm text-white/60">Bildirim bulunamadı.</div>
          </Card>
        )}
      </div>
    </div>
  )
}
