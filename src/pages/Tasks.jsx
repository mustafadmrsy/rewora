import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Clock, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, ProgressBar } from '../components/ui'
import { listMissions, listUserMissions } from '../lib/missionsApi'
import { formatRelativeDate } from '../lib/postsApi'
import { listOffers } from '../lib/rewardsApi'

function MiniActiveTaskRow({ task, onContinue }) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-tight text-white">{task.title}</div>
          </div>

          <GoldBadge className="shrink-0">
            <span className="text-xs font-semibold">{task.reward}</span>
            <span className="text-xs font-semibold">Altın</span>
          </GoldBadge>
        </div>

        {task.description ? (
          <div className="mt-3">
            <div className="text-sm leading-relaxed text-white/65 line-clamp-2">{task.description}</div>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-white/55">İlerleme</div>
            <div className="font-semibold text-[color:var(--gold)]">{task.progress}%</div>
          </div>
          <div className="mt-3">
            <ProgressBar value={task.progress} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {['canceled', 'cancelled'].includes(String(task.status ?? '')) ? (
            <div className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/20">
              İptal Edildi
            </div>
          ) : (
            <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
              Devam Ediyor
            </div>
          )}

          {['canceled', 'cancelled'].includes(String(task.status ?? '')) ? (
            <Button variant="secondary" disabled type="button">
              İptal Edildi
            </Button>
          ) : (
            <Button variant="secondary" onClick={onContinue} type="button">
              Devam Et
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function RecommendedTaskCard({ task, onInspect }) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/6">
              {task?.image_url ? (
                <img src={task.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-[color:var(--gold)]/10" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold tracking-tight text-white">{task.title}</div>
              {task.created_at && (
                <div className="mt-2 flex items-center gap-2 text-sm text-white/55">
                  <Clock size={16} />
                  <span>{formatRelativeDate(task.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          <GoldBadge className="shrink-0">
            <span className="text-xs font-semibold">{task.reward}</span>
            <span className="text-xs font-semibold">altın</span>
          </GoldBadge>
        </div>

        {task.description && (
          <div className="mt-4">
            <div className="text-sm leading-relaxed text-white/65 line-clamp-2">{task.description}</div>
          </div>
        )}

        <div className="mt-4">
          <Button
            className="w-full bg-emerald-500 text-white hover:bg-emerald-400 border-none"
            variant="primary"
            onClick={onInspect}
            type="button"
          >
            İncele
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function RewardPreviewCard({ item, onOpen }) {
  const backgroundImage = item?.company_image_url ?? item?.image_url

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left"
    >
      <Card>
        <div className="p-4">
          <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/6 aspect-[16/8]">
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

            {item?.logo_url ? (
              <div className="relative z-10 flex items-center justify-center">
                <img
                  src={item.logo_url}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-[color:var(--gold)] backdrop-blur border border-white/10">
              <MapPin size={16} />
            </div>

            <GoldBadge className="absolute bottom-3 right-3 z-10">
              <span className="text-xs font-semibold">{item?.coin ?? item?.price ?? 0}</span>
              <span className="text-xs font-semibold">altın</span>
            </GoldBadge>
          </div>

          <div className="mt-3 min-w-0">
            <div className="truncate text-sm font-semibold text-white">{item?.title ?? ''}</div>
            <div className="mt-1 truncate text-xs text-white/55">{item?.vendor ?? ''}</div>
          </div>
        </div>
      </Card>
    </button>
  )
}

export default function Tasks() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [missions, setMissions] = useState([])
  const [userMissions, setUserMissions] = useState([])
  const [offers, setOffers] = useState([])
  const [showAllRecommended, setShowAllRecommended] = useState(false)
  const [activePageSize, setActivePageSize] = useState(1)
  const [activePage, setActivePage] = useState(0)
  const [rewardPageSize, setRewardPageSize] = useState(2)
  const [rewardPage, setRewardPage] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [m, um, o] = await Promise.all([listMissions(), listUserMissions(), listOffers()])
        if (cancelled) return
        setMissions(m.missions ?? [])
        setUserMissions(um.userMissions ?? [])
        setOffers(o.offers ?? [])
      } catch {
        if (cancelled) return
        setMissions([])
        setUserMissions([])
        setOffers([])
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
    function syncSizes() {
      setActivePageSize(window.innerWidth < 768 ? 1 : 2)
      setRewardPageSize(window.innerWidth < 768 ? 2 : 4)
    }
    syncSizes()
    window.addEventListener('resize', syncSizes)
    return () => window.removeEventListener('resize', syncSizes)
  }, [])

  const activeTasks = useMemo(() => {
    return (userMissions ?? [])
      .filter((um) => {
        const s = String(um?.status ?? '')
        return s === 'pending' || s === 'canceled' || s === 'cancelled'
      })
      .map((um) => {
        const m = um?.mission
        if (!m) return null
        return {
          id: m.id,
          user_mission_id: um?.id,
          title: m.title,
          description: m.description,
          reward: m.coin,
          progress: 50,
          status: um?.status ?? 'pending',
          created_at: m.created_at,
          image_url: m.image_url,
        }
      })
      .filter(Boolean)
  }, [userMissions])

  const activeTotalPages = useMemo(
    () => Math.max(1, Math.ceil(activeTasks.length / activePageSize)),
    [activeTasks.length, activePageSize],
  )
  const activeCurrent = useMemo(
    () => activeTasks.slice(activePage * activePageSize, activePage * activePageSize + activePageSize),
    [activeTasks, activePage, activePageSize],
  )

  useEffect(() => {
    setActivePage((p) => Math.min(p, activeTotalPages - 1))
  }, [activeTotalPages])

  const takenMissionIds = useMemo(
    () => new Set((userMissions ?? []).map((um) => um?.mission_id).filter(Boolean)),
    [userMissions],
  )

  const recommended = useMemo(() => {
    return (missions ?? [])
      .filter((m) => !takenMissionIds.has(m.id))
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        reward: m.coin,
        created_at: m.created_at,
        image_url: m.image_url,
      }))
  }, [missions, takenMissionIds])
  const recommendedPreview = useMemo(() => {
    if (showAllRecommended) return recommended
    return recommended.slice(0, 2)
  }, [recommended, showAllRecommended])

  const rewardTotalPages = useMemo(
    () => Math.max(1, Math.ceil((offers ?? []).length / rewardPageSize)),
    [offers, rewardPageSize],
  )
  const rewardsPreview = useMemo(
    () => (offers ?? []).slice(rewardPage * rewardPageSize, rewardPage * rewardPageSize + rewardPageSize),
    [offers, rewardPage, rewardPageSize],
  )

  useEffect(() => {
    setRewardPage((p) => Math.min(p, rewardTotalPages - 1))
  }, [rewardTotalPages])

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold tracking-tight text-white">Devam Edenler</div>

          {!loading && activeTasks.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
                onClick={() => setActivePage((p) => Math.max(0, p - 1))}
                disabled={activePage === 0}
                aria-label="Önceki"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold text-white/70">
                {activePage + 1}/{activeTotalPages}
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
                onClick={() => setActivePage((p) => Math.min(activeTotalPages - 1, p + 1))}
                disabled={activePage >= activeTotalPages - 1}
                aria-label="Sonraki"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>

        {loading ? null : activeCurrent.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeCurrent.map((t) => (
              <MiniActiveTaskRow key={t.user_mission_id ?? t.id} task={t} onContinue={() => navigate(`/gorevler/${t.id}`)} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-6 text-sm text-white/55">Devam eden görev bulunamadı.</div>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold tracking-tight text-white">Önerilenler</div>
          {recommended.length > 2 ? (
            <button
              type="button"
              className="text-sm font-semibold text-white/60 hover:text-white/85 transition"
              onClick={() => setShowAllRecommended(true)}
            >
              Tümünü Gör
            </button>
          ) : null}
        </div>

        {loading ? null : recommendedPreview.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {recommendedPreview.map((t) => (
              <RecommendedTaskCard key={t.id} task={t} onInspect={() => navigate(`/gorevler/${t.id}`)} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-10">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/50">
                  <Search size={24} />
                </div>
                <div className="text-sm font-semibold text-white/40">Önerilen görev bulunamadı</div>
              </div>
            </div>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold tracking-tight text-white">Ödüller</div>
          {!loading && (offers ?? []).length ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
                onClick={() => setRewardPage((p) => Math.max(0, p - 1))}
                disabled={rewardPage === 0}
                aria-label="Önceki"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold text-white/70">
                {rewardPage + 1}/{rewardTotalPages}
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-40"
                onClick={() => setRewardPage((p) => Math.min(rewardTotalPages - 1, p + 1))}
                disabled={rewardPage >= rewardTotalPages - 1}
                aria-label="Sonraki"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-white/60 hover:text-white/85 transition"
              onClick={() => navigate('/oduller')}
            >
              Tümünü Gör
            </button>
          )}
        </div>

        {loading ? null : rewardsPreview.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {rewardsPreview.map((it) => (
              <RewardPreviewCard key={it.id} item={it} onOpen={() => navigate(`/oduller/${it.id}`)} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-6 text-sm text-white/55">Ödül bulunamadı.</div>
          </Card>
        )}
      </section>
    </div>
  )
}
