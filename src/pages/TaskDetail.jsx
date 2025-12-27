import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle, Clock, Loader2, MapPin } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, IconButton } from '../components/ui'
import { listMissions, listUserMissions, startMission, updateUserMissionStatus } from '../lib/missionsApi'

const rewardPreview = [
  { id: 1, title: 'Vera Makarna Chicken', price: 3500, discount: 15 },
  { id: 2, title: 'Halley Coffee', price: 3500, discount: 10 },
]

export default function TaskDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef(null)
  const [isStarting, setIsStarting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState(null)
  const [userMission, setUserMission] = useState(null)
  const [status, setStatus] = useState('idle') // idle | pending | cancelled

  const isCancelled = status === 'cancelled'
  const isPending = status === 'pending'

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [m, um] = await Promise.all([listMissions(), listUserMissions()])
        if (cancelled) return

        const currentMission = (m.missions ?? []).find((x) => String(x.id) === String(id)) ?? null
        const currentUserMission =
          (um.userMissions ?? []).find((x) => String(x.mission_id) === String(id)) ?? null

        setMission(currentMission)
        setUserMission(currentUserMission)
        setStatus(currentUserMission?.status ?? 'idle')
      } catch {
        if (cancelled) return
        setMission(null)
        setUserMission(null)
        setStatus('idle')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function onStart() {
    if (!mission?.id) return
    if (isStarting) return

    try {
      setIsStarting(true)
      const res = await startMission(mission.id)

      const created = res?.data?.user_mission ?? null
      const createdId = created?.id ?? null

      setUserMission(createdId ? { ...(created ?? {}), id: createdId, mission_id: mission.id, status: 'pending' } : (created ?? null))
      setStatus('pending')

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

  if (!mission && !loading) {
    return (
      <div className="mx-auto max-w-[920px]">
        <Card>
          <div className="p-6">
            <div className="text-sm font-semibold text-white">Görev bulunamadı</div>
            <div className="mt-2 text-sm text-white/55">Bu görev kaldırılmış olabilir.</div>
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

  return (
    <div className="mx-auto max-w-[920px] space-y-6">
      {loading ? null : null}
      <div className="flex items-center gap-3">
        <IconButton isBack onClick={() => navigate(-1)} type="button" aria-label="Geri">
          <ArrowLeft size={18} />
        </IconButton>
        <div className="flex-1 text-center text-lg font-semibold tracking-tight text-white">
          {mission?.category_title ?? ''}
        </div>
        <div className="w-10" />
      </div>

      <Card>
        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
                {mission?.image_url ? (
                  <img src={mission.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-[color:var(--gold)]/10" />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg sm:text-xl font-semibold tracking-tight text-white">"{mission?.title ?? ''}"</div>
                <div className="mt-1 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm text-white/55">
                  <Clock size={16} />
                  <span></span>
                </div>
              </div>
            </div>

            <GoldBadge className="shrink-0 px-3 py-2 sm:px-4">
              <span className="text-[11px] sm:text-xs font-semibold">{mission?.coin ?? 0}</span>
              <span className="text-[11px] sm:text-xs font-semibold">altın</span>
            </GoldBadge>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="text-2xl font-semibold tracking-tight text-white">Görev Hedefleri</div>
        <div className="text-sm leading-relaxed text-white/65">“{mission?.description ?? ''}”</div>
      </div>

      {isPending || isCancelled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-white/80">
            <div>İlerleme</div>
            <div
              className={`font-semibold ${
                isCancelled ? 'text-red-400' : 'text-[color:var(--gold)]'
              }`}
            >
              {isCancelled ? 'İptal Edildi' : `Devam ediyor`}
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                isCancelled
                  ? 'bg-red-500 shadow-[0_0_16px_rgba(248,113,113,0.35)]'
                  : 'bg-[color:var(--gold)] shadow-[0_0_20px_rgba(214,255,0,0.30)]'
              }`}
              style={{ width: isCancelled ? '100%' : `45%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={async () => {
                if (!userMission?.id) return
                try {
                  await updateUserMissionStatus(userMission.id, 'cancelled')
                  setStatus('cancelled')
                } catch {
                  // ignore
                }
              }}
              className={`h-12 rounded-full px-6 text-sm font-semibold transition active:scale-[0.99] ${
                isCancelled
                  ? 'bg-red-500 text-white hover:bg-red-400'
                  : 'bg-white/10 text-white hover:bg-white/16'
              }`}
            >
              {isCancelled ? 'İptal Edildi' : 'İptal Et'}
            </button>
            <button
              type="button"
              className="h-12 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.99]"
              onClick={() => {
                const umId = userMission?.id
                navigate(`/gorevler/${id}/tamamla${umId ? `?um=${umId}` : ''}`)
              }}
            >
              Tamamla
            </button>
          </div>
        </div>
      ) : (
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

      <div className="space-y-4">
        <div className="text-2xl font-semibold tracking-tight text-white">Ödüllere Göz At</div>
        <div className="rewora-scroll flex gap-4 overflow-x-auto pb-2">
          {rewardPreview.map((r) => (
            <Card key={r.id} className="shrink-0 w-[280px]">
              <div className="p-4">
                <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
                  <div className="aspect-[16/10] w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-[color:var(--gold)] backdrop-blur border border-white/10"
                    aria-label="Konum"
                  >
                    <MapPin size={18} />
                  </button>
                  <GoldBadge className="absolute bottom-3 right-3">
                    <span className="text-xs font-semibold">{r.price}</span>
                    <span className="text-xs font-semibold">altın</span>
                  </GoldBadge>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                    <div className="mt-1 text-sm text-white/55">%{r.discount} indirim</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="w-full" variant="secondary" onClick={() => navigate('/oduller')} type="button">
                    Ödüller
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {showToast ? (
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
      ) : null}
    </div>
  )
}
