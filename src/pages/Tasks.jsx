import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Clock, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listMissions, listUserMissions } from '../lib/missionsApi'
import { listOffers } from '../lib/rewardsApi'
import { formatRelativeDate } from '../lib/postsApi'

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
            className="h-full rounded-full bg-[#D6FF00] transition-all duration-500"
            style={{ width: `${value}%` }}
        />
    </div>
)

// Components
function MiniActiveTaskRow({ task, onContinue }) {
    return (
        <Card>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="truncate text-lg font-semibold tracking-tight text-white">{task.title}</div>
                    </div>

                    <GoldBadge className="shrink-0">
                        <span className="text-xs font-semibold text-black">{task.reward}</span>
                        <span className="text-xs font-semibold text-black">Altın</span>
                    </GoldBadge>
                </div>

                {task.description && (
                    <div className="mt-3">
                        <div className="text-sm leading-relaxed text-white/65 line-clamp-2">{task.description}</div>
                    </div>
                )}

                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-white/55">İlerleme</div>
                        <div className="font-semibold text-[#D6FF00]">{task.progress}%</div>
                    </div>
                    <div className="mt-3">
                        <ProgressBar value={task.progress} />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    {(() => {
                        const status = String(task.status ?? '').toLowerCase()
                        if (status === 'completed' || status === 'approved') {
                            return (
                                <div className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-500/20">
                                    Tamamlandı
                                </div>
                            )
                        }
                        if (status === 'canceled' || status === 'cancelled') {
                            return (
                                <div className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 border border-rose-500/20">
                                    İptal Edildi
                                </div>
                            )
                        }
                        return (
                            <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
                                Devam Ediyor
                            </div>
                        )
                    })()}

                    {(() => {
                        const status = String(task.status ?? '').toLowerCase()
                        if (status === 'completed' || status === 'approved') {
                            return (
                                <Button variant="secondary" disabled type="button">
                                    Tamamlandı
                                </Button>
                            )
                        }
                        if (status === 'canceled' || status === 'cancelled') {
                            return (
                                <Button variant="secondary" disabled type="button">
                                    İptal Edildi
                                </Button>
                            )
                        }
                        return (
                            <Button variant="secondary" onClick={onContinue} type="button">
                                Devam Et
                            </Button>
                        )
                    })()}
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
                                <div className="h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-[#D6FF00]/10" />
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
                        <span className="text-xs font-semibold text-black">{task.reward}</span>
                        <span className="text-xs font-semibold text-black">altın</span>
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
        <button type="button" onClick={onOpen} className="w-full text-left">
            <Card>
                <div className="p-4">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/6 aspect-[16/8]">
                        {backgroundImage ? (
                            <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                        ) : (
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
                        )}

                        {item?.logo_url && (
                            <div className="relative z-10 flex items-center justify-center">
                                <img
                                    src={item.logo_url}
                                    alt=""
                                    className="h-14 w-14 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        <div className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-[#D6FF00] backdrop-blur border border-white/10">
                            <MapPin size={16} />
                        </div>

                        <GoldBadge className="absolute bottom-3 right-3 z-10">
                            <span className="text-xs font-semibold text-black">{item?.coin ?? 0}</span>
                            <span className="text-xs font-semibold text-black">altın</span>
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

    const [userMissionsNextPageUrl, setUserMissionsNextPageUrl] = useState(null)
    const [isLoadingMoreUserMissions, setIsLoadingMoreUserMissions] = useState(false)

    const [missionsNextPageUrl, setMissionsNextPageUrl] = useState(null)
    const [isLoadingMoreMissions, setIsLoadingMoreMissions] = useState(false)

    const activeScrollRef = useRef(null)
    const recommendedScrollRef = useRef(null)

    // Initial load
    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                // Gerçek API çağrıları
                const [missionsRes, userMissionsRes, offersRes] = await Promise.all([
                  listMissions(1),
                  listUserMissions(),
                  listOffers()
                ])

                if (cancelled) return

                setMissions(missionsRes.missions ?? [])
                setMissionsNextPageUrl(missionsRes.pagination?.next_page_url ?? null)

                setUserMissions(userMissionsRes.userMissions ?? [])
                setUserMissionsNextPageUrl(userMissionsRes.nextPageUrl ?? null)

                setOffers(offersRes.offers ?? [])
            } catch (err) {
                console.error('Error loading tasks:', err)
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

    // Active tasks mapping - Tüm status'leri göster (filtreleme yok)
    const activeTasks = useMemo(() => {

        // Filtreleme yapmadan tüm user missions'ı al
        const mapped = (userMissions ?? [])
            .map((userMission) => {
                const mission = userMission?.mission

                // Progress hesaplama - status'e göre
                let progress = 50
                const status = String(userMission.status ?? '').toLowerCase()
                if (status === 'processing') progress = 33
                if (status === 'pending') progress = 66
                if (status === 'completed' || status === 'approved') progress = 100
                if (status === 'canceled' || status === 'cancelled') progress = 0

                const task = {
                    id: mission?.id ?? `um-${userMission.id}`,
                    user_mission_id: userMission.id,
                    title: mission?.title ?? 'Görev',
                    description: mission?.description ?? '',
                    reward: mission?.coin ?? 0,
                    progress,
                    status: userMission.status,
                    created_at: mission?.created_at,
                    image_url: mission?.image_url,
                }
                return task
            })
            .filter(Boolean)
        return mapped
    }, [userMissions])

    // Horizontal scroll for active tasks
    useEffect(() => {
        const scrollContainer = activeScrollRef.current
        if (!scrollContainer) return

        async function handleScroll() {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
            const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100

            if (isNearEnd && userMissionsNextPageUrl && !isLoadingMoreUserMissions) {
                setIsLoadingMoreUserMissions(true)
                try {
                    const userMissionsRes = await listUserMissions(userMissionsNextPageUrl)
                    setUserMissions(prev => [...prev, ...(userMissionsRes.userMissions ?? [])])
                    setUserMissionsNextPageUrl(userMissionsRes.nextPageUrl ?? null)
                } catch (error) {
                    console.error('Load more active tasks error:', error)
                } finally {
                    setIsLoadingMoreUserMissions(false)
                }
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [userMissionsNextPageUrl, isLoadingMoreUserMissions])

    // Recommended tasks mapping
    const recommendedTasks = useMemo(() => {
        return (missions ?? []).map((mission) => ({
            id: mission.id,
            title: mission.title,
            description: mission.description,
            reward: mission.coin,
            created_at: mission.created_at,
            image_url: mission.image_url,
        }))
    }, [missions])

    // Horizontal scroll for recommended tasks (same as active tasks)
    useEffect(() => {
        const scrollContainer = recommendedScrollRef.current
        if (!scrollContainer) return

        async function handleScroll() {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
            const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100

            if (isNearEnd && missionsNextPageUrl && !isLoadingMoreMissions) {
                setIsLoadingMoreMissions(true)
                try {
                    const missionsRes = await listMissions(missionsNextPageUrl)
                    setMissions(prev => [...prev, ...(missionsRes.missions ?? [])])
                    setMissionsNextPageUrl(missionsRes.pagination?.next_page_url ?? null)
                } catch (error) {
                    console.error('Load more recommended tasks error:', error)
                } finally {
                    setIsLoadingMoreMissions(false)
                }
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [missionsNextPageUrl, isLoadingMoreMissions])

    return (
        <div className="mx-auto w-full max-w-[1480px] space-y-6 p-4 bg-[#0a0a0a] min-h-screen">
            {/* Devam Edenler */}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-2xl font-semibold tracking-tight text-white">Devam Edenler</div>
                    {!loading && activeTasks.length > 0 && (
                        <div className="text-xs font-semibold text-white/70">{activeTasks.length} görev</div>
                    )}
                </div>

                {loading ? (
                    <Card><div className="p-6 text-center text-sm text-white/55">Yükleniyor...</div></Card>
                ) : activeTasks.length > 0 ? (
                    <div
                        ref={activeScrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {activeTasks.map((task) => (
                            <div key={task.user_mission_id ?? task.id} className="w-[90%] sm:w-[85%] md:w-[calc(33.333%-1rem)] flex-shrink-0">
                                <MiniActiveTaskRow task={task} onContinue={() => navigate(`/gorevler/${task.id}`)} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card><div className="p-6 text-center text-sm text-white/55">Devam eden görev bulunamadı.</div></Card>
                )}
            </section>

            {/* Önerilenler */}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-2xl font-semibold tracking-tight text-white">Önerilenler</div>
                    {!loading && recommendedTasks.length > 0 && (
                        <div className="text-xs font-semibold text-white/70">{recommendedTasks.length} görev</div>
                    )}
                </div>

                {loading ? (
                    <Card><div className="p-6 text-center text-sm text-white/55">Yükleniyor...</div></Card>
                ) : recommendedTasks.length > 0 ? (
                    <div
                        ref={recommendedScrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {recommendedTasks.map((task) => (
                            <div key={task.id} className="w-[90%] sm:w-[85%] md:w-[calc(33.333%-1rem)] flex-shrink-0">
                                <RecommendedTaskCard task={task} onInspect={() => navigate(`/gorevler/${task.id}`)} />
                            </div>
                        ))}
                        {isLoadingMoreMissions && (
                            <div className="w-[90%] sm:w-[85%] md:w-[calc(33.333%-1rem)] flex-shrink-0 flex items-center justify-center">
                                <div className="text-sm text-white/55">Yükleniyor...</div>
                            </div>
                        )}
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

            {/* Ödüller */}
            <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-2xl font-semibold tracking-tight text-white">Ödüller</div>
                    <button type="button" className="text-sm font-semibold text-white/60 hover:text-white/85 transition" onClick={() => navigate('/oduller')}>
                        Tümünü Gör
                    </button>
                </div>

                {loading ? (
                    <Card><div className="p-6 text-center text-sm text-white/55">Yükleniyor...</div></Card>
                ) : offers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {offers.slice(0, 4).map((it) => (
                            <RewardPreviewCard key={it.id} item={it} onOpen={() => navigate(`/oduller/${it.id}`)} />
                        ))}
                    </div>
                ) : (
                    <Card><div className="p-6 text-center text-sm text-white/55">Ödül bulunamadı.</div></Card>
                )}
            </section>
        </div>
    )
}
