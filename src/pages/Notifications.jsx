import React, { useMemo, useState } from 'react'
import Card from '../components/Card'
import { Bell, Clock } from 'lucide-react'
import { Button, Chip } from '../components/ui'

const data = [
  {
    id: 1,
    title: 'Yeni görev önerisi',
    desc: '5 dk içinde 1200 altın kazanabileceğin mini görev hazır.',
    time: '1 saat önce',
    type: 'gorev',
  },
  {
    id: 2,
    title: 'Ödül stok güncellendi',
    desc: 'Halley Coffee tekrar aktif, kaçırma!',
    time: '2 saat önce',
    type: 'odul',
  },
  {
    id: 3,
    title: 'Görev onaylandı',
    desc: 'Eğlenceni Göster görevin onaylandı, altın hesaba geçti.',
    time: 'Dün',
    type: 'gorev',
  },
  {
    id: 4,
    title: 'Yeni partner mağaza',
    desc: 'FitStore partnerleri eklendi. Spor ekipmanında %14 indirim.',
    time: '2 gün önce',
    type: 'odul',
  },
  {
    id: 5,
    title: 'Mini ödül kazandın',
    desc: 'Vera Makarna kısa görevini tamamladın, 1200 altın eklendi.',
    time: '3 gün önce',
    type: 'odul',
  },
  {
    id: 6,
    title: 'Görev süresi bitiyor',
    desc: 'Alışveriş Avı görevinde 30 dk kaldı, fişini yüklemeyi unutma.',
    time: '3 gün önce',
    type: 'gorev',
  },
  {
    id: 7,
    title: 'Ödül indirimi bitti',
    desc: 'Sinema Bileti indirim süresi doldu, yakında yenilenecek.',
    time: '4 gün önce',
    type: 'odul',
  },
  {
    id: 8,
    title: 'Hızlı Görev hazır',
    desc: 'Su Hatırlatıcısı için 8/8 bardak tamamla, 2100 altın kazan.',
    time: '5 gün önce',
    type: 'gorev',
  },
]

export default function Notifications() {
  const [filter, setFilter] = useState('tum')
  const pageSize = 4
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (filter === 'tum') return data
    return data.filter((d) => d.type === filter)
  }, [filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = useMemo(
    () => filtered.slice(page * pageSize, page * pageSize + pageSize),
    [filtered, page],
  )

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
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={filter === 'tum'} onClick={() => { setFilter('tum'); setPage(0) }}>
          Tümü
        </Chip>
          <Chip active={filter === 'gorev'} onClick={() => { setFilter('gorev'); setPage(0) }}>
          Görev
        </Chip>
          <Chip active={filter === 'odul'} onClick={() => { setFilter('odul'); setPage(0) }}>
          Ödül
        </Chip>
        </div>
        <div className="flex items-center gap-2">
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
        {current.map((item) => (
          <Card key={item.id} className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(214,255,0,0.06),transparent_55%)]" />
            <div className="relative flex items-start gap-3 p-4 sm:p-5">
              <div
                className={`mt-1 rounded-full p-2 ${
                  item.type === 'odul'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/30'
                    : 'bg-[color:var(--gold)]/10 text-[color:var(--gold)] border border-[color:var(--gold)]/30'
                }`}
              >
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-sm text-white/65 leading-relaxed">{item.desc}</div>
                <div className="flex items-center gap-2 text-xs text-white/45">
                  <Clock size={14} />
                  <span>{item.time}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="text-[11px] font-semibold text-white">
                Detayları Aç
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
