import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { Button, Chip, GoldBadge } from '../components/ui'
import { listOffers, listUserOffers } from '../lib/rewardsApi'
import { listUserMissions } from '../lib/missionsApi'

function RewardCard({ item, type = 'offer' }) {
  const navigate = useNavigate()

  // For missions, extract mission data
  const isMission = type === 'mission'
  const mission = isMission ? item?.mission : null
  const displayItem = isMission ? mission : item

  if (!displayItem) return null

  // Google Maps URL from company coordinates (only for offers)
  const handleLocationClick = (e) => {
    e.stopPropagation()
    if (isMission) return
    
    const company = item?.company
    if (company?.latitude && company?.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${company.latitude},${company.longitude}`
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    } else if (company?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Status text for missions
  const statusText = isMission && item?.status === 'completed' 
    ? 'Tamamlandı' 
    : isMission && item?.status === 'approved' 
      ? 'Onaylandı' 
      : ''

  // Background image
  const backgroundImage = isMission 
    ? displayItem?.image_url 
    : item?.company_image_url ?? item?.image_url

  // Logo (only for offers with company logo)
  const logoUrl = isMission ? null : item?.logo_url

  // Price/Coin
  const price = isMission ? displayItem?.coin ?? 0 : item?.price ?? 0

  // Navigation
  const handleClick = () => {
    if (isMission) {
      navigate(`/gorevler/${displayItem?.id}`)
    } else {
      navigate(`/oduller/${item.id}`)
    }
  }

  return (
    <Card>
      <div className="p-5">
        <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/6 aspect-[16/8]">
          {/* Background Image */}
          {backgroundImage ? (
            <img 
              src={backgroundImage} 
              alt="" 
              className="absolute inset-0 h-full w-full object-cover" 
              loading="lazy" 
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
          )}
          
          {/* Center Logo Circle (only for offers) */}
          {logoUrl && (
            <div className="relative z-10 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm" 
                loading="lazy" 
              />
            </div>
          )}

          {/* Location Button (only for offers) */}
          {!isMission && (
            <button 
              onClick={handleLocationClick}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-[color:var(--gold)] backdrop-blur border border-white/10 hover:bg-black/60 transition"
              type="button"
              aria-label="Konumu göster"
            >
              <MapPin size={18} />
            </button>
          )}

          {/* Gold Badge */}
          <GoldBadge className="absolute bottom-3 right-3 z-10">
            <span className="text-xs font-semibold">{price}</span>
            <span className="text-xs font-semibold">altın</span>
          </GoldBadge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">{displayItem?.title ?? ''}</div>
            {isMission ? (
              <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
                {statusText && (
                  <>
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>{statusText}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-1 text-sm text-white/55">{item?.vendor ?? ''}</div>
            )}
          </div>
          {!isMission && (
            <div className="shrink-0 rounded-full bg-white/8 px-3 py-1 text-sm text-white/80">
              %{item?.discount ?? 0} indirim!
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-white text-black font-bold border border-white/20 hover:bg-white/90 shadow-none"
            variant="primary"
            onClick={handleClick}
            type="button"
          >
            {isMission ? 'Detayları Gör' : 'İncele'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function Rewards() {
  const [tab, setTab] = useState('oduller')

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [missionHistory, setMissionHistory] = useState([])
  const [user, setUser] = useState(null)
  const [pageSize, setPageSize] = useState(4)
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [offersRes, userOffersRes, userMissionsRes] = await Promise.all([
          listOffers(), 
          listUserOffers(),
          listUserMissions()
        ])
        if (cancelled) return
        setItems(offersRes.offers ?? [])
        setHistory(userOffersRes.userOffers ?? [])
        // Filter completed/approved missions for history
        const completedMissions = (userMissionsRes.userMissions ?? []).filter(
          (um) => um?.status === 'completed' || um?.status === 'approved'
        )
        setMissionHistory(completedMissions)
        setUser(userOffersRes.user ?? offersRes.user ?? null)
      } catch {
        if (cancelled) return
        setItems([])
        setHistory([])
        setMissionHistory([])
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

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
        <div className="space-y-4">
          <Card>
            <div className="p-6">
              <div className="text-lg font-semibold text-white">Ödül Geçmişim</div>
              <div className="mt-2 text-sm text-white/55">
                {loading
                  ? 'Yükleniyor...'
                  : ''}
              </div>
            </div>
          </Card>

          {loading ? (
            <Card>
              <div className="p-6 text-sm text-white/55">Yükleniyor...</div>
            </Card>
          ) : history.length > 0 || missionHistory.length > 0 ? (
            <>
              {history.length > 0 && (
                <div>
                  <div className="mb-4 text-sm font-semibold text-white/80">Kullandığınız Ödüller</div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {history.map((uo) => (
                      <RewardCard key={uo.id} item={uo.offer ?? uo} />
                    ))}
                  </div>
                </div>
              )}
              
              {missionHistory.length > 0 && (
                <div>
                  <div className="mb-4 text-sm font-semibold text-white/80">Tamamladığınız Görevler</div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {missionHistory.map((um) => (
                      <RewardCard key={um.id} item={um} type="mission" />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <div className="p-6 text-sm text-white/55">Henüz ödül veya görev geçmişiniz bulunmuyor.</div>
            </Card>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <Card>
              <div className="p-6 text-sm text-white/55">Yükleniyor...</div>
            </Card>
          ) : current.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {current.map((it) => (
                <RewardCard key={it.id} item={it} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="p-6 text-sm text-white/55">Ödül bulunamadı.</div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
