import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { Button, Chip, GoldBadge } from '../components/ui'
import { rewards } from '../data/rewards'

function RewardCard({ item }) {
  const navigate = useNavigate()

  return (
    <Card>
      <div className="p-5">
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
          <div className="aspect-[16/8] w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
          <button className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-[color:var(--gold)] backdrop-blur border border-white/10">
            <MapPin size={18} />
          </button>
          <GoldBadge className="absolute bottom-3 right-3">
            <span className="text-xs font-semibold">{item.price}</span>
            <span className="text-xs font-semibold">altın</span>
          </GoldBadge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{item.title}</div>
            <div className="mt-1 text-sm text-white/55">{item.vendor}</div>
          </div>
          <div className="shrink-0 rounded-full bg-white/8 px-3 py-1 text-sm text-white/80">
            %{item.discount} indirim!
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-white text-black font-bold border border-white/20 hover:bg-white/90 shadow-none"
            variant="primary"
            onClick={() => navigate(`/oduller/${item.id}`)}
            type="button"
          >
            İncele
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function Rewards() {
  const [tab, setTab] = useState('oduller')

  const items = useMemo(() => rewards, [])
  const [pageSize, setPageSize] = useState(4)
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize],
  )

  useEffect(() => {
    function syncPageSize() {
      setPageSize(window.innerWidth < 768 ? 2 : 4)
    }
    syncPageSize()
    window.addEventListener('resize', syncPageSize)
    return () => window.removeEventListener('resize', syncPageSize)
  }, [])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-white">
            Ödüller
          </div>
          <div className="mt-1 text-sm text-white/55">
            Altınlarını partner ödüllerde kullan.
          </div>
        </div>
        {tab === 'oduller' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Önceki"
            >
              <ChevronLeft size={16} />
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
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Chip active={tab === 'oduller'} onClick={() => setTab('oduller')}>
          Ödüller
        </Chip>
        <Chip active={tab === 'gecmis'} onClick={() => setTab('gecmis')}>
          Ödül Geçmişim
        </Chip>
      </div>

      {tab === 'gecmis' ? (
        <Card>
          <div className="p-6">
            <div className="text-lg font-semibold text-white">Geçmiş</div>
            <div className="mt-2 text-sm text-white/55">
              Buraya daha sonra sipariş/geçmiş akışı gelecek.
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {current.map((it) => (
            <RewardCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  )
}
