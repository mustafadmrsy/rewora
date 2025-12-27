import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles, RotateCw } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, ProgressBar, Skeleton } from '../components/ui'
import FeedCard from './home/components/FeedCard'
import RightColumn from './home/components/RightColumn'
import { listPosts, toggleLike } from '../lib/postsApi'
import { listUserMissions } from '../lib/missionsApi'

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
  const cat = params.get('cat') ?? '#tümü'
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [loadingTask, setLoadingTask] = useState(true)

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
      } catch {
        if (cancelled) return
        setPosts([])
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

  // Load active task
  useEffect(() => {
    let cancelled = false

    async function loadTask() {
      setLoadingTask(true)
      try {
        const res = await listUserMissions()
        if (cancelled) return
        
        // Find active task (status: 'pending' means active/in progress)
        const activeUserMission = res.userMissions?.find(
          (um) => String(um?.status ?? '') === 'pending'
        )
        
        if (activeUserMission && activeUserMission.mission) {
          const mission = activeUserMission.mission
          // Use default progress of 50% if not available (similar to Tasks.jsx)
          const progress = activeUserMission.progress ?? activeUserMission.percentage ?? 50
          
          setActiveTask({
            id: activeUserMission.mission_id ?? mission.id,
            title: mission.title ?? '',
            reward: mission.coin ?? 0,
            progress: progress,
            description: mission.description ?? '',
          })
        } else {
          setActiveTask(null)
        }
      } catch {
        if (cancelled) return
        setActiveTask(null)
      } finally {
        if (!cancelled) setLoadingTask(false)
      }
    }

    loadTask()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCat = cat === '#tümü' || p.category === cat
      if (!matchesCat) return false
      if (!q) return true
      const hay = `${p.handle} ${p.subtitle} ${p.category}`.toLowerCase()
      return hay.includes(q)
    })
  }, [posts, cat, q])

  const miniRewards = useMemo(
    () => [
      { id: 1, title: 'Vera Makarna', price: 3500 },
      { id: 2, title: 'Halley Coffee', price: 3500 },
      { id: 3, title: 'Sinema Bileti', price: 6000 },
    ],
    [],
  )

  const activeTasks = useMemo(
    () => {
      if (!activeTask) return []
      return [activeTask]
    },
    [activeTask],
  )

  const [showMiniModal, setShowMiniModal] = useState(false)
  const [showTasksModal, setShowTasksModal] = useState(false)
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
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {loadingTask ? (
            <Card className="overflow-hidden hidden lg:block">
              <div className="p-6">
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ) : activeTask ? (
            <div className="hidden lg:block">
              <ActiveTaskCard task={activeTask} onContinue={() => navigate('/gorevler')} />
            </div>
          ) : null}
          {loading ? (
            <div className="mx-auto w-full max-w-[560px] space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[520px]" />
              ))}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[560px] space-y-5">
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
          activeTasks={activeTasks}
          onInspectReward={() => navigate('/oduller')}
          onGoRewards={() => navigate('/oduller')}
          onContinueTask={() => navigate('/gorevler')}
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

      {showTasksModal ? (
        <Modal title="Devam Eden Görevler" onClose={() => setShowTasksModal(false)}>
          <div className="space-y-3">
            {activeTasks.map((t, i) => (
              <div
                key={`${t.title}-${i}`}
                className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/4 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                  <div className="text-xs text-white/55">İlerleme: {t.progress}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <GoldBadge className="px-2 py-1">
                    <span className="text-xs font-semibold">{t.reward}</span>
                    <span className="text-xs font-semibold">altın</span>
                  </GoldBadge>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-400 transition"
                    onClick={() => navigate(t.id ? `/gorevler/${t.id}` : '/gorevler')}
                  >
                    Git
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

    </div>
  )
}
