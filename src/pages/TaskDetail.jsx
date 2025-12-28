import React, { useEffect, useState, useRef } from 'react'
import { CheckCircle, Clock, Loader2, MapPin } from 'lucide-react'

// Mock Components
const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/6 ${className}`}>
    {children}
  </div>
)

const Button = ({ children, variant = 'primary', className = '', onClick, disabled, type = 'button' }) => {
  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClass = variant === 'primary'
    ? 'bg-[#D6FF00] text-black hover:bg-[#c2e600]'
    : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'

  return (
    <button type={type} className={`${baseClass} ${variantClass} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

const GoldBadge = ({ children, className = '' }) => (
  <div className={`inline-flex items-center gap-1.5 rounded-full bg-[#D6FF00] px-3 py-1.5 ${className}`}>
    {children}
  </div>
)

// Mock Data & API
const mockMission = {
  id: 1,
  title: 'Günlük Yürüyüş',
  description: '5000 adım at ve sağlıklı kal',
  coin: 250,
  created_at: '2024-12-20T10:00:00Z',
  image_url: null
}

const mockUserMission = {
  id: 101,
  mission_id: 1,
  status: 'processing', // processing, pending, completed, cancelled
  mission: mockMission
}

const mockOffers = [
  { id: 1, title: 'Starbucks İndirim', coin: 500, discount: 15, vendor: 'Starbucks' },
  { id: 2, title: 'Nike Ayakkabı', coin: 1500, discount: 20, vendor: 'Nike' },
]

const getMission = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockMission
}

const listUserMissions = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { userMissions: [mockUserMission] }
}

const startMission = async (missionId) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { data: { user_mission: mockUserMission } }
}

const updateUserMissionStatus = async (userMissionId, status) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { data: { user_mission: { ...mockUserMission, status } } }
}

const listOffers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { offers: mockOffers }
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Bugün'
  if (days === 1) return 'Dün'
  if (days < 7) return `${days}g`
  if (days < 30) return `${Math.floor(days / 7)}h`
  if (days < 365) return `${Math.floor(days / 30)}a`
  return `${Math.floor(days / 365)}y`
}

// Components
function RewardPreviewCard({ item, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="w-full text-left">
      <Card className="shrink-0 w-[280px]">
        <div className="p-4">
          <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
            <div className="aspect-[16/10] w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />

            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-[#D6FF00] backdrop-blur border border-white/10"
              aria-label="Konum"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={18} />
            </button>

            <GoldBadge className="absolute bottom-3 right-3">
              <span className="text-xs font-semibold text-black">{item.coin}</span>
              <span className="text-xs font-semibold text-black">altın</span>
            </GoldBadge>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{item.title}</div>
              <div className="mt-1 text-sm text-white/55">%{item.discount} indirim</div>
            </div>
          </div>

          <div className="mt-4">
            <Button className="w-full" variant="secondary" onClick={(e) => { e.stopPropagation(); onOpen(); }} type="button">
              Ödüller
            </Button>
          </div>
        </div>
      </Card>
    </button>
  )
}

export default function TaskDetail() {
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef(null)
  const [isStarting, setIsStarting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState(null)
  const [userMission, setUserMission] = useState(null)
  const [status, setStatus] = useState('idle') // idle, processing, pending, completed, cancelled
  const [offers, setOffers] = useState([])

  const missionId = 1 // From URL params in real app

  // Status checks
  const isCancelled = status === 'cancelled'
  const isCompleted = status === 'completed'
  const isPending = status === 'pending'
  const isProcessing = status === 'processing'
  const isActive = isPending || isProcessing // Görev aktif (devam ediyor)

  // Progress calculation (Flutter mantığı)
  const getProgress = () => {
    if (isCancelled) return 0
    if (isProcessing) return 33
    if (isPending) return 66
    if (isCompleted) return 100
    return 0
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  // Initial load
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [m, um, o] = await Promise.all([
          getMission(missionId),
          listUserMissions(),
          listOffers()
        ])
        if (cancelled) return

        const currentMission = m ?? null
        const currentUserMission =
          (um?.userMissions ?? []).find((x) => String(x.mission_id) === String(missionId)) ?? null

        if (cancelled) return

        setMission(currentMission)
        setUserMission(currentUserMission)
        setStatus(currentUserMission?.status ?? 'idle')
        setOffers(o.offers ?? [])
      } catch (err) {
        console.error('Error loading task detail:', err)
        if (cancelled) return
        setMission(null)
        setUserMission(null)
        setStatus('idle')
        setOffers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (missionId) load()
    return () => {
      cancelled = true
    }
  }, [missionId])

  async function onStart() {
    if (!mission?.id) return
    if (isStarting) return

    try {
      setIsStarting(true)
      const res = await startMission(mission.id)

      const created = res?.data?.user_mission ?? null
      const createdId = created?.id ?? null
      const createdStatus = created?.status ?? 'processing'

      setUserMission(createdId ? { ...(created ?? {}), id: createdId, mission_id: mission.id, status: createdStatus } : (created ?? null))
      setStatus(createdStatus)

      setShowToast(true)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setShowToast(false), 2200)
    } catch (err) {
      const msg = err?.data?.message
      if (typeof msg === 'string' && msg.length) {
        setShowToast(true)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setShowToast(false), 2200)
      }
    } finally {
      setIsStarting(false)
    }
  }

  async function onCancel() {
    if (!userMission?.id) return
    try {
      await updateUserMissionStatus(userMission.id, 'cancelled')
      setStatus('cancelled')
    } catch (err) {
      console.error('Cancel error:', err)
    }
  }

  async function onComplete() {
    const umId = userMission?.id
    alert(`Navigate to /gorevler/${missionId}/tamamla?um=${umId}`)
  }

  if (!loading && !mission) {
    return (
      <div className="mx-auto max-w-[920px] p-4 bg-[#0a0a0a] min-h-screen">
        <Card>
          <div className="p-6">
            <div className="text-sm font-semibold text-white">Görev bulunamadı</div>
            <div className="mt-2 text-sm text-white/55">Bu görev kaldırılmış olabilir.</div>
            <div className="mt-5">
              <Button variant="secondary" onClick={() => window.history.back()} type="button">
                Geri dön
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[920px] space-y-6 p-4 bg-[#0a0a0a] min-h-screen">
      {mission && (
        <>
          {/* Mission Info Card */}
          <Card>
            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
                    {mission.image_url ? (
                      <img src={mission.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-[#D6FF00]/10" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg sm:text-xl font-semibold tracking-tight text-white">
                      "{mission.title ?? ''}"
                    </div>
                    <div className="mt-1 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm text-white/55">
                      <Clock size={16} />
                      <span>{formatRelativeDate(mission.created_at)}</span>
                    </div>
                  </div>
                </div>

                <GoldBadge className="shrink-0 px-3 py-2 sm:px-4">
                  <span className="text-[11px] sm:text-xs font-semibold text-black">{mission.coin ?? 0}</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-black">altın</span>
                </GoldBadge>
              </div>
            </div>
          </Card>

          {/* Mission Description */}
          <div className="space-y-3">
            <div className="text-2xl font-semibold tracking-tight text-white">Görev Hedefleri</div>
            <div className="text-sm leading-relaxed text-white/65">"{mission.description ?? ''}"</div>
          </div>

          {/* Action Section */}
          {isActive || isCancelled || isCompleted ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-white/80">
                <div>İlerleme</div>
                <div
                  className={`font-semibold ${
                    isCancelled ? 'text-red-400' :
                    isCompleted ? 'text-emerald-400' :
                    'text-[#D6FF00]'
                  }`}
                >
                  {isCancelled ? 'İptal Edildi' :
                   isCompleted ? 'Tamamlandı' :
                   `${getProgress()}% Devam ediyor`}
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    isCancelled
                      ? 'bg-red-500 shadow-[0_0_16px_rgba(248,113,113,0.35)]'
                      : isCompleted
                      ? 'bg-emerald-500 shadow-[0_0_16px_rgba(52,211,153,0.35)]'
                      : 'bg-[#D6FF00] shadow-[0_0_20px_rgba(214,255,0,0.30)]'
                  }`}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>

              {/* Action Buttons */}
              {!isCompleted && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isCancelled}
                    className={`h-12 rounded-full px-6 text-sm font-semibold transition active:scale-[0.99] ${
                      isCancelled
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/16'
                    }`}
                  >
                    {isCancelled ? 'İptal Edildi' : 'İptal Et'}
                  </button>
                  <button
                    type="button"
                    disabled={isCancelled}
                    className={`h-12 rounded-full px-6 text-sm font-semibold transition active:scale-[0.99] ${
                      isCancelled
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-emerald-500 text-white hover:bg-emerald-400'
                    }`}
                    onClick={onComplete}
                  >
                    Tamamla
                  </button>
                </div>
              )}

              {isCompleted && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 border border-emerald-500/20">
                    <CheckCircle size={18} />
                    Görev Tamamlandı
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Başlat Button
            <div className="pt-2">
              <button
                type="button"
                onClick={onStart}
                disabled={isStarting}
                className={`mx-auto block h-14 w-full max-w-[360px] rounded-full text-lg font-semibold text-white transition active:scale-[0.99] ${
                  isStarting
                    ? 'bg-white/15 text-white/80 disabled:cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400'
                }`}
              >
                {isStarting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Başlatılıyor...
                  </span>
                ) : (
                  'Başlat'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Rewards Section */}
      <div className="space-y-4">
        <div className="text-2xl font-semibold tracking-tight text-white">Ödüllere Göz At</div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {offers.map((r) => (
            <RewardPreviewCard
              key={r.id}
              item={r}
              onOpen={() => alert('Navigate to /oduller')}
            />
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed left-1/2 top-6 z-50 w-[92%] max-w-[460px] -translate-x-1/2 rounded-[20px] border border-white/12 bg-black/85 px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-emerald-400">
              <CheckCircle size={22} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-emerald-400">Başarılı</div>
              <div className="text-sm leading-relaxed text-white/85">
                Görevi başarıyla aldınız, bitirdikten sonra onaya göndermeyi unutmayınız.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="ml-auto text-white/60 transition hover:text-white"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}