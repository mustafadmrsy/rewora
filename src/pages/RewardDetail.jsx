import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, MapPin, Ticket, Image as ImageIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, GoldBadge } from '../components/ui'
import { listOffers, listUserOffers, redeemOffer } from '../lib/rewardsApi'

export default function RewardDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [reward, setReward] = useState(null)
  const [user, setUser] = useState(null)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const userGold = useMemo(() => Number(user?.coin ?? 0), [user])

  // Scroll to menu when it opens
  useEffect(() => {
    if (showMenu && menuRef.current) {
      setTimeout(() => {
        menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showMenu])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [offersRes, userOffersRes] = await Promise.all([listOffers(), listUserOffers()])
        if (cancelled) return

        const offerId = String(id)
        const fromOffers = (offersRes.offers ?? []).find((o) => String(o.id) === offerId) ?? null

        const fromHistory = (userOffersRes.userOffers ?? [])
          .map((uo) => uo.offer ?? uo)
          .find((o) => String(o.id) === offerId)
          ?? null

        setReward(fromOffers ?? fromHistory)
        setUser(userOffersRes.user ?? offersRes.user ?? null)
      } catch {
        if (cancelled) return
        setReward(null)
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (!reward && !loading) {
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
            <span>{reward?.coin ?? 0} altın</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-3 sm:px-4 pt-2.5 pb-9 space-y-2.5">
        <div className="space-y-4">
          {/* Görsel alanı */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-white/6 border border-white/8 aspect-[3/2]">
            {/* Background Image */}
            {reward?.company_image_url ? (
              <img 
                src={reward.company_image_url} 
                alt="" 
                className="absolute inset-0 h-full w-full object-cover" 
                loading="lazy" 
              />
            ) : reward?.image_url ? (
              <img 
                src={reward.image_url} 
                alt="" 
                className="absolute inset-0 h-full w-full object-cover" 
                loading="lazy" 
              />
            ) : (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-white/10 via-white/4 to-white/10" />
            )}
            
            {/* Center Logo Circle */}
            {reward?.logo_url && (
              <div className="relative z-10 flex items-center justify-center">
                <img 
                  src={reward.logo_url} 
                  alt="" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm" 
                  loading="lazy" 
                />
              </div>
            )}

            <button
              type="button"
              className="absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-[color:var(--gold)] backdrop-blur border border-white/10"
            >
              <Ticket size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                const company = reward?.company
                if (company?.latitude && company?.longitude) {
                  const mapsUrl = `https://www.google.com/maps?q=${company.latitude},${company.longitude}`
                  window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                } else if (company?.address) {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`
                  window.open(mapsUrl, '_blank', 'noopener,noreferrer')
                }
              }}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-[color:var(--gold)] backdrop-blur border border-white/10 hover:bg-black/85 transition"
            >
              <MapPin size={16} />
            </button>
            <GoldBadge className="absolute bottom-3 right-3 z-10 px-3 py-1 text-xs font-semibold shadow-[0_0_0_4px_rgba(214,255,0,0.12)] transition hover:shadow-[0_0_0_6px_rgba(214,255,0,0.16)]">
              <span className="text-xs font-semibold">{reward?.coin ?? 0}</span>
              <span className="text-xs font-semibold">altın</span>
            </GoldBadge>
          </div>

          {/* Bilgi bloğu */}
          <div className="rounded-2xl bg-transparent border-none p-3 sm:p-4 space-y-4">
            <div className="space-y-2 text-center">
              <div className="text-xl font-bold text-white">%{reward?.discount ?? 0} indirim!</div>
              <div className="text-[13px] text-white/65 leading-relaxed">{reward?.description ?? ''}</div>
            </div>

            <div className="flex items-center justify-center">
              <GoldBadge className="px-3 py-1 text-sm font-semibold">
                <span className="text-xs font-semibold">{reward?.coin ?? 0}</span>
                <span className="text-xs font-semibold">altın</span>
              </GoldBadge>
            </div>
          </div>

          {/* Butonlar */}
          <div className="space-y-2.5">
            {error ? <div className="text-sm font-semibold text-rose-300">{error}</div> : null}

            <button
              type="button"
              disabled={loading || redeeming}
              className="w-full h-11 rounded-full bg-white text-black text-[13px] font-semibold transition hover:bg-white/90 disabled:opacity-60"
              onClick={async () => {
                if (!reward?.id) return
                if (redeeming) return
                setError('')
                try {
                  setRedeeming(true)
                  await redeemOffer(reward.id)
                  const userOffersRes = await listUserOffers()
                  setUser(userOffersRes.user ?? user)
                  setError('Kupon başarıyla oluşturuldu. Profilinizden kupon koduna ulaşabilirsiniz.')
                } catch (err) {
                  const msg = err?.data?.message
                  setError(typeof msg === 'string' && msg.length ? msg : 'Kupon oluşturulamadı.')
                } finally {
                  setRedeeming(false)
                }
              }}
            >
              {redeeming ? 'İşleniyor...' : 'Kuponu kullan'}
            </button>
            <div className="space-y-2.5">
              <button 
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-full h-11 rounded-full bg-[color:var(--gold)] text-black text-[13px] font-semibold transition hover:bg-[color:var(--gold-2)]"
              >
                {showMenu ? 'Menüyü Gizle' : 'Menüyü Görüntüle'}
              </button>

              {showMenu && reward?.qr_categories && reward.qr_categories.length > 0 && (
                <div ref={menuRef} id="menu-section" className="space-y-4 rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-lg font-semibold text-white">Menü</div>
                  {reward.qr_categories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        {category.photo && (
                          <img 
                            src={category.photo} 
                            alt={category.name} 
                            className="h-12 w-12 rounded-lg object-cover border border-white/10"
                            loading="lazy"
                          />
                        )}
                        <div className="text-base font-semibold text-white">{category.name}</div>
                      </div>
                      
                      {category.products && category.products.length > 0 && (
                        <div className="space-y-2 pl-0 sm:pl-14">
                          {category.products.map((product) => (
                            <div 
                              key={product.id} 
                              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/6 p-3"
                            >
                              {product.photo && (
                                <img 
                                  src={product.photo} 
                                  alt={product.name} 
                                  className="h-16 w-16 rounded-lg object-cover border border-white/10 shrink-0"
                                  loading="lazy"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white">{product.name}</div>
                                {product.description && (
                                  <div className="mt-1 text-xs text-white/65">{product.description}</div>
                                )}
                                <div className="mt-2 text-sm font-semibold text-[color:var(--gold)]">
                                  {product.price} ₺
                                  {product.old_price && (
                                    <span className="ml-2 text-xs text-white/50 line-through">
                                      {product.old_price} ₺
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
