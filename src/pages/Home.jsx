import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles, RotateCw, ListTodo } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, ProgressBar, Skeleton } from '../components/ui'
import FeedCard from './home/components/FeedCard'
import RightColumn from './home/components/RightColumn'
import { listPosts, toggleLike } from '../lib/postsApi'
import { mapUserMission } from '../lib/missionHelpers'
import { mapOffer } from '../lib/rewardsApi'
import { updateUser } from '../lib/authStorage'

function ActiveTaskCard({ task, onContinue }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white/80">Devam Edenler</div>
            <div className="mt-2 truncate text-xl font-semibold tracking-tight text-white">
              {task.title}
            </div>
          </div>
          <GoldBadge className="shrink-0">
            <span className="text-xs font-semibold">{task.reward}</span>
            <span className="text-xs font-semibold">gold</span>
          </GoldBadge>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <div className="text-white/55">İlerleme</div>
            <div className="font-semibold text-[color:var(--gold)]">{task.progress}%</div>
          </div>
          <div className="mt-3">
            <ProgressBar value={task.progress} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end">
          <Button variant="secondary" onClick={onContinue} type="button">
            Devam Et
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const cat = params.get('cat') ?? ''
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [miniRewards, setMiniRewards] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await listPosts()
        if (cancelled) return
        const nextPosts = res.posts ?? []
        setPosts(nextPosts)

        setLikedIds(() => new Set(nextPosts.filter((p) => p?.is_liked).map((p) => p.id)))
        setLikeCounts(() => {
          const map = {}
          nextPosts.forEach((p) => {
            map[p.id] = p.likes
          })
          return map
        })

        // Send categories to Header via custom event
        if (res.categories) {
          window.dispatchEvent(new CustomEvent('categoriesLoaded', { detail: { categories: res.categories } }))
        }

        // Update user session with latest data from API
        if (res.user) {
          updateUser(res.user)
        }

        // Continue mission - PostService'den gelen continue_mission
        const continueMission = res.continue_mission
        if (continueMission) {
          const mappedMission = mapUserMission(continueMission)
          if (mappedMission && mappedMission.mission) {
            const mission = mappedMission.mission
            let progress = 50
            const status = String(mappedMission.status ?? '').toLowerCase()
            if (status === 'processing') progress = 33
            if (status === 'pending') progress = 66

            setActiveTask({
              id: mission.id ?? mappedMission.mission_id,
              title: mission.title ?? '',
              reward: mission.coin ?? 0,
              progress: progress,
              description: mission.description ?? '',
            })
          } else {
            setActiveTask(null)
          }
        } else {
          setActiveTask(null)
        }

        // Last three offers - PostService'den gelen last_three_offers
        const lastThreeOffers = res.last_three_offers ?? []
        const mappedMiniRewards = lastThreeOffers.map((offer) => {
          const mapped = mapOffer(offer)
          return {
            id: mapped?.id ?? offer?.id,
            title: mapped?.title ?? offer?.title ?? '',
            price: mapped?.coin ?? mapped?.price ?? offer?.coin ?? offer?.price ?? 0,
            vendor: mapped?.vendor ?? offer?.company?.name ?? '',
            image_url: mapped?.image_url ?? mapped?.company_image_url ?? offer?.image_url ?? null,
          }
        }).filter(Boolean)
        setMiniRewards(mappedMiniRewards)
      } catch {
        if (cancelled) return
        setPosts([])
        setActiveTask(null)
        setMiniRewards([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const [likedIds, setLikedIds] = useState(() => new Set())
  const [likeCounts, setLikeCounts] = useState(() => {
    const map = {}
    posts.forEach((p) => {
      map[p.id] = p.likes
    })
    return map
  })

  useEffect(() => {
    setLikeCounts((prev) => {
      const next = { ...prev }
      posts.forEach((p) => {
        if (typeof next[p.id] !== 'number') next[p.id] = p.likes
      })
      return next
    })
  }, [posts])


  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCat = !cat || cat === '' || p.category_slug === cat
      if (!matchesCat) return false
      if (!q) return true
      const hay = `${p.handle} ${p.subtitle} ${p.category}`.toLowerCase()
      return hay.includes(q)
    })
  }, [posts, cat, q])


  const [showMiniModal, setShowMiniModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  function Modal({ title, onClose, children }) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[420px] overflow-hidden rounded-[20px] border border-white/10 bg-[#161616] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="text-sm font-semibold text-white">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 transition hover:text-white"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto px-5 py-4 rewora-scroll">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <Card className="overflow-hidden hidden lg:block">
              <div className="p-6">
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ) : activeTask ? (
            <div className="hidden lg:block">
              <ActiveTaskCard task={activeTask} onContinue={() => navigate(`/gorevler/${activeTask.id}`)} />
            </div>
          ) : (
            <Card className="overflow-hidden hidden lg:block">
              <div className="p-6">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/40">
                    <ListTodo size={28} />
                  </div>
                  <div className="text-sm font-semibold text-white/80">Devam eden göreviniz bulunmamaktadır</div>
                  <div className="text-xs text-white/55">Yeni görevler için görevler sayfasını ziyaret edin</div>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => navigate('/gorevler')}
                    className="mt-2"
                  >
                    Görevlere Git
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {loading ? (
            <div className="w-full space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[520px]" />
              ))}
            </div>
          ) : (
            <div className="w-full space-y-5">
              {filteredPosts.map((p) => (
                <FeedCard
                  key={p.id}
                  post={p}
                  liked={likedIds.has(p.id)}
                  likes={likeCounts[p.id] ?? p.likes}
                  onOpen={() => navigate(`/post/${p.id}`)}
                  onLike={async () => {
                    const alreadyLiked = likedIds.has(p.id)

                    setLikedIds((prev) => {
                      const next = new Set(prev)
                      if (alreadyLiked) next.delete(p.id)
                      else next.add(p.id)
                      return next
                    })

                    setLikeCounts((counts) => ({
                      ...counts,
                      [p.id]: Math.max(0, (counts[p.id] ?? p.likes) + (alreadyLiked ? -1 : 1)),
                    }))

                    try {
                      await toggleLike(p.id)
                    } catch {
                      setLikedIds((prev) => {
                        const next = new Set(prev)
                        if (alreadyLiked) next.add(p.id)
                        else next.delete(p.id)
                        return next
                      })
                      setLikeCounts((counts) => ({
                        ...counts,
                        [p.id]: Math.max(0, (counts[p.id] ?? p.likes) + (alreadyLiked ? 1 : -1)),
                      }))
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <RightColumn
          miniRewards={miniRewards}
          loadingRewards={loading}
          onInspectReward={(reward) => navigate(`/oduller/${reward.id}`)}
          onGoRewards={() => navigate('/oduller')}
        />
      </div>

      {showMiniModal ? (
        <Modal title="Mini Ödüller" onClose={() => setShowMiniModal(false)}>
          <div className="space-y-3">
            {miniRewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 bg-white/4 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                  <div className="mt-1 text-xs text-white/55">Yakınındaki partner ödül</div>
                </div>

                <GoldBadge className="px-2 py-1">
                  <span className="text-xs font-semibold">{r.price}</span>
                  <span className="text-xs font-semibold">altın</span>
                </GoldBadge>

                <Button
                  className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-400 border-none"
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => navigate('/oduller')}
                >
                  İncele
                </Button>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}


    </div>
  )
}
