import React, { useEffect, useState, useRef, useMemo } from 'react'
import { ChevronLeft, CheckCircle } from 'lucide-react'

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

const ProgressBar = ({ value }) => (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${value}%` }}
        />
    </div>
)

// Component
function CompletedTaskCard({ task, onView }) {
    return (
        <Card>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-semibold tracking-tight text-white">
                            {task.title}
                        </div>
                        {task.description && (
                            <div className="mt-2 text-sm leading-relaxed text-white/65 line-clamp-2">
                                {task.description}
                            </div>
                        )}
                    </div>

                    <GoldBadge className="shrink-0">
                        <span className="text-xs font-semibold text-black">{task.reward}</span>
                        <span className="text-xs font-semibold text-black">Altın</span>
                    </GoldBadge>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                        <div className="text-white/55">İlerleme</div>
                        <div className="font-semibold text-emerald-400">Tamamlandı</div>
                    </div>
                    <ProgressBar value={100} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
                        <CheckCircle size={14} className="mr-1.5" />
                        Tamamlandı
                    </div>

                    <Button variant="secondary" onClick={onView} type="button">
                        Görüntüle
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default function CompletedMissions() {
    const [loading, setLoading] = useState(true)
    const [completedMissions, setCompletedMissions] = useState([])
    const [nextPageUrl, setNextPageUrl] = useState(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const scrollContainerRef = useRef(null)

    // Initial load
    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                const result = await listCompletedMissions()
                if (cancelled) return

                setCompletedMissions(result.completedMissions ?? [])
                setNextPageUrl(result.nextPageUrl ?? null)
            } catch (err) {
                console.error('Error loading completed missions:', err)
                if (cancelled) return
                setCompletedMissions([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    // Infinite scroll - VERTICAL
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) return

        async function handleScroll() {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer
            const isNearEnd = scrollTop + clientHeight >= scrollHeight - 100

            if (isNearEnd && nextPageUrl && !isLoadingMore) {
                setIsLoadingMore(true)
                try {
                    const result = await listCompletedMissions(nextPageUrl)
                    setCompletedMissions(prev => [...prev, ...(result.completedMissions ?? [])])
                    setNextPageUrl(result.nextPageUrl ?? null)
                } catch (error) {
                    console.error('Load more completed missions error:', error)
                } finally {
                    setIsLoadingMore(false)
                }
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [nextPageUrl, isLoadingMore])

    // Map completed missions
    const tasks = useMemo(() => {
        return (completedMissions ?? []).map((um) => {
            const m = um?.mission
            if (!m) return null

            return {
                id: m.id,
                user_mission_id: um?.id,
                title: m.title,
                description: m.description,
                reward: m.coin,
                status: um?.status ?? 'completed',
                created_at: m.created_at,
                image_url: m.image_url,
            }
        }).filter(Boolean)
    }, [completedMissions])

    return (
        <div className="mx-auto w-full max-w-[1480px] p-4 bg-[#0a0a0a] min-h-screen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10"
                        aria-label="Geri"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 text-center text-2xl font-semibold tracking-tight text-white">
                        Tamamlanan Görevler
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Count */}
                {!loading && tasks.length > 0 && (
                    <div className="text-center text-sm text-white/55">
                        {tasks.length} tamamlanmış görev
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <Card>
                        <div className="p-6 text-center text-sm text-white/55">Yükleniyor...</div>
                    </Card>
                ) : tasks.length > 0 ? (
                    <div
                        ref={scrollContainerRef}
                        className="overflow-y-auto scrollbar-hide"
                        style={{ maxHeight: 'calc(100vh - 200px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-4">
                            {tasks.map((t) => (
                                <CompletedTaskCard
                                    key={t.user_mission_id ?? t.id}
                                    task={t}
                                    onView={() => alert(`Navigate to /gorevler/${t.id}`)}
                                />
                            ))}
                        </div>

                        {isLoadingMore && (
                            <div className="flex justify-center py-6">
                                <div className="text-sm text-white/55">Daha fazla yükleniyor...</div>
                            </div>
                        )}

                        {!nextPageUrl && completedMissions.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="text-xs text-white/40">Tüm tamamlanan görevler gösterildi</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <div className="p-10">
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/50">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="text-sm font-semibold text-white/40">
                                    Tamamlanmış göreviniz bulunmamaktadır.
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}