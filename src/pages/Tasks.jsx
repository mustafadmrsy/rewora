import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, ProgressBar } from '../components/ui'
import { listMissions, listUserMissions } from '../lib/missionsApi'
import { formatRelativeDate } from '../lib/postsApi'

function ActiveTaskCard({ task, onContinue }) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white/80">Devam Edenler</div>
            <div className="mt-2 truncate text-xl font-semibold tracking-tight text-white">{task.title}</div>
          </div>

          <GoldBadge className="shrink-0">
            <span className="text-xs font-semibold">{task.reward}</span>
            <span className="text-xs font-semibold">Altın</span>
          </GoldBadge>
        </div>

        {task.description && (
          <div className="mt-4">
            <div className="text-sm leading-relaxed text-white/65 line-clamp-2">{task.description}</div>
          </div>
        )}

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

export default function Tasks() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [missions, setMissions] = useState([])
  const [userMissions, setUserMissions] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [m, um] = await Promise.all([listMissions(), listUserMissions()])
        if (cancelled) return
        setMissions(m.missions ?? [])
        setUserMissions(um.userMissions ?? [])
      } catch {
        if (cancelled) return
        setMissions([])
        setUserMissions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeUserMission = useMemo(
    () => userMissions.find((um) => String(um?.status ?? '') === 'pending') ?? null,
    [userMissions],
  )

  const activeTask = useMemo(() => {
    const m = activeUserMission?.mission
    if (!m) return null
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      reward: m.coin,
      progress: 50,
      created_at: m.created_at,
      image_url: m.image_url,
    }
  }, [activeUserMission])

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
  const pageSize = 2
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(recommended.length / pageSize))
  const current = useMemo(
    () => recommended.slice(page * pageSize, page * pageSize + pageSize),
    [recommended, page],
  )

  return (
    <div className="space-y-6">
      {loading ? null : activeTask ? (
        <ActiveTaskCard task={activeTask} onContinue={() => navigate(`/gorevler/${activeTask.id}`)} />
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">Görevler</div>
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
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {current.map((t) => (
          <RecommendedTaskCard key={t.id} task={t} onInspect={() => navigate(`/gorevler/${t.id}`)} />
        ))}
      </div>
    </div>
  )
}
