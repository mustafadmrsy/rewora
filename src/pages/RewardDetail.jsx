import React from 'react'
import { ArrowLeft, MapPin, Ticket, Image as ImageIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, GoldBadge } from '../components/ui'
import { rewards } from '../data/rewards'

export default function RewardDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const reward = rewards.find((r) => String(r.id) === String(id)) ?? null
  const userGold = 0

  if (!reward) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-6">
        <div className="rounded-[18px] border border-white/10 bg-black/50 px-5 py-6">
          <div className="text-lg font-semibold text-white">Ödül bulunamadı</div>
          <div className="mt-2 text-sm text-white/65">Bu ödül kaldırılmış veya süresi dolmuş olabilir.</div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)} type="button">
              Geri dön
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-1)] text-white">
      {/* Üst bar */}
      <div className="sticky top-0 z-10 border-b border-white/8 bg-[color:var(--bg-1)]/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-3.5 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center text-white transition active:scale-95"
            aria-label="Geri"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--gold)] px-3 py-1 text-xs font-semibold text-black">
            <span>{userGold} altın</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-3 sm:px-4 pt-2.5 pb-9 space-y-2.5">
        <h1 className="text-center text-base font-semibold text-white">{reward.title}</h1>

        <div className="space-y-4">
          {/* Görsel alanı */}
          <div className="relative overflow-hidden rounded-2xl bg-white/6 border border-white/8">
            <div className="aspect-[3/2] w-full flex items-center justify-center bg-gradient-to-br from-white/10 via-white/4 to-white/10">
              <div className="flex h-12 w-12 md:h-10 md:w-10 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-black/40 border border-white/15 text-white/70">
                <ImageIcon size={16} />
              </div>
            </div>
            <button
              type="button"
              className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-[color:var(--gold)] backdrop-blur border border-white/10"
            >
              <Ticket size={16} />
            </button>
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-[color:var(--gold)] backdrop-blur border border-white/10"
            >
              <MapPin size={16} />
            </button>
            <GoldBadge className="absolute bottom-3 right-3 px-3 py-1 text-xs font-semibold shadow-[0_0_0_4px_rgba(214,255,0,0.12)] transition hover:shadow-[0_0_0_6px_rgba(214,255,0,0.16)]">
              <span className="text-xs font-semibold">{reward.price}</span>
              <span className="text-xs font-semibold">altın</span>
            </GoldBadge>
          </div>

          {/* Bilgi bloğu */}
          <div className="rounded-2xl bg-transparent border-none p-3 sm:p-4 space-y-4">
            <div className="space-y-2 text-center">
              <div className="text-xl font-bold text-white">%{reward.discount} indirim!</div>
              <div className="text-[13px] text-white/65 leading-relaxed">{reward.description}</div>
            </div>

            <div className="flex items-center justify-center">
              <GoldBadge className="px-3 py-1 text-sm font-semibold">
                <span className="text-xs font-semibold">{reward.price}</span>
                <span className="text-xs font-semibold">altın</span>
              </GoldBadge>
            </div>
          </div>

          {/* Butonlar */}
          <div className="space-y-2.5">
            <button className="w-full h-11 rounded-full bg-white text-black text-[13px] font-semibold transition hover:bg-white/90">
              Kuponu kullan
            </button>
            <button className="w-full h-11 rounded-full bg-[color:var(--gold)] text-black text-[13px] font-semibold transition hover:bg-[color:var(--gold-2)]">
              Menüyü Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
