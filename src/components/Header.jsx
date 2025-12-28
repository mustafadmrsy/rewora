import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Search, Home, ListTodo, Gift, Send, User, ChevronLeft, CheckCheck, Menu, X } from 'lucide-react'
import { Chip, GoldBadge } from './ui'
import { clearSession, getUser } from '../lib/authStorage'
import { resetEcho } from '../lib/echoService'

export default function Header({ title = 'Rewora' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const activeCat = params.get('cat') ?? ''
  const qParam = params.get('q') ?? ''

  const [openNotif, setOpenNotif] = useState(false)
  const notifRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [search, setSearch] = useState(qParam)
  const [categories, setCategories] = useState([])
  const [messagesThreadOpen, setMessagesThreadOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profileFullName, setProfileFullName] = useState(null)
  const onHome = location.pathname === '/'
  const onTasks = location.pathname === '/gorevler'
  const onTaskDetail = location.pathname.startsWith('/gorevler/') && location.pathname !== '/gorevler'
  const onRewards = location.pathname === '/oduller'
  const onRewardDetail = location.pathname.startsWith('/oduller/')
  const onMessages = location.pathname === '/mesajlar'
  const onProfile = location.pathname === '/profil' || location.pathname.startsWith('/profil/')
  const onSecurity = location.pathname === '/guvenlik'
  const onBlockedUsers = location.pathname === '/engellenen-kullanicilar'
  const onNotifications = location.pathname === '/bildirimler'

  // Get coin and user info from session
  const currentUser = getUser()
  const gold = currentUser?.coin ?? 0
  const fullName = currentUser ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() : ''

  // Check if viewing own profile
  const profilePathMatch = location.pathname.match(/^\/profil\/(.+)$/)
  const profileId = profilePathMatch ? profilePathMatch[1] : null
  const isOwnProfile = onProfile && (!profileId || profileId === 'me' || String(profileId) === String(currentUser?.id))

  useEffect(() => {
    setSearch(qParam)
  }, [qParam, location.pathname])

  // Listen for categories from Home page
  useEffect(() => {
    function handleCategoriesLoaded(event) {
      setCategories(event.detail.categories ?? [])
    }

    window.addEventListener('categoriesLoaded', handleCategoriesLoaded)
    return () => {
      window.removeEventListener('categoriesLoaded', handleCategoriesLoaded)
    }
  }, [])

  // Listen for Messages thread state
  useEffect(() => {
    function handleMessagesThreadState(event) {
      setMessagesThreadOpen(event.detail?.showThread ?? false)
    }

    window.addEventListener('messagesThreadState', handleMessagesThreadState)
    return () => {
      window.removeEventListener('messagesThreadState', handleMessagesThreadState)
    }
  }, [])

  // Listen for profile loaded from Profile page
  useEffect(() => {
    function handleProfileLoaded(event) {
      const { fullName, isOwn } = event.detail ?? {}
      if (!isOwn) {
        setProfileFullName(fullName ?? null)
      } else {
        setProfileFullName(null)
      }
    }

    window.addEventListener('profileLoaded', handleProfileLoaded)
    return () => {
      window.removeEventListener('profileLoaded', handleProfileLoaded)
    }
  }, [])

  // Clear profile name when leaving profile page
  useEffect(() => {
    if (!onProfile) {
      setProfileFullName(null)
    }
  }, [onProfile])

  // Detect mobile screen size
  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 1024)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    function onDocClick(e) {
      if (!openNotif) return
      if (!notifRef.current) return
      if (notifRef.current.contains(e.target)) return
      setOpenNotif(false)
    }

    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [openNotif])


  function goHomeWithParams(next) {
    const nextParams = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => {
      if (!v) nextParams.delete(k)
      else nextParams.set(k, String(v))
    })
    navigate({ pathname: '/', search: nextParams.toString() ? `?${nextParams.toString()}` : '' })
  }

  function onChipClick(category) {
    goHomeWithParams({ cat: category.slug === '' ? '' : category.slug })
  }

  // Build chips array: "Tümü" + categories from API
  const chips = useMemo(() => {
    const allChip = { label: '#tümü', slug: '', title: 'Tümü' }
    const categoryChips = (categories ?? []).map((cat) => ({
      label: `#${cat.title}`,
      slug: cat.slug ?? '',
      title: cat.title ?? '',
    }))
    return [allChip, ...categoryChips]
  }, [categories])

  function onSearchSubmit() {
    const trimmed = search.trim()
    goHomeWithParams({ q: trimmed })
  }

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {onProfile && !isOwnProfile ? (
            // Başka kullanıcının profili - geri butonu göster
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Geri"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1" />
            </>
          ) : onHome ? (
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-left cursor-pointer"
                aria-label="Rewora"
              >
                <img
                  src="/rewora_logo.png"
                  alt="Rewora"
                  className="h-8 w-8 shrink-0"
                />
                <span className="text-lg font-semibold leading-none tracking-tight text-white">
                  ewora
                </span>
              </button>
            </div>
          ) : onNotifications ? (
            <div className="flex min-w-0 flex-1 items-center relative">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--gold)] transition hover:text-[color:var(--gold)]/80 cursor-pointer z-10"
                aria-label="Geri"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 text-center absolute left-0 right-0 pointer-events-none">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Bildirimler
                </div>
              </div>
            </div>
          ) : onSecurity ? (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Geri"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Güvenlik
                </div>
              </div>
              <div className="flex-1" />
            </>
          ) : onBlockedUsers ? (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Geri"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Engellenen Kullanıcılar
                </div>
              </div>
              <div className="flex-1" />
            </>
          ) : onRewardDetail || onTaskDetail ? (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Geri"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1" />
            </>
          ) : (onTasks || onRewards) && fullName ? (
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-none tracking-tight text-white">
                {fullName}
              </div>
            </div>
          ) : onMessages ? (
            // Mesajlar sayfası - ortada göster
            <>
              <div className="w-10" /> {/* Spacer for alignment */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Mesajlar
                </div>
              </div>
              <div className="w-10" /> {/* Spacer for alignment */}
            </>
          ) : onProfile && !isOwnProfile && profileFullName ? (
            // Başka kullanıcının profili - Görevler/Ödüller sayfalarındaki gibi göster
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold leading-none tracking-tight text-white">
                {profileFullName}
              </div>
            </div>
          ) : onProfile && isOwnProfile ? (
            // Kendi profilimiz - ortada "Profil" yazısı
            <>
              <div className="w-10" /> {/* Spacer for alignment */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Profil
                </div>
              </div>
              <div className="w-10" /> {/* Spacer for alignment */}
            </>
          ) : null}

          {onHome ? (
            <div className="hidden flex-1 items-center gap-2 lg:flex">
              <div className="relative w-full max-w-[520px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                />
                <input
                  placeholder="Arama"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSearchSubmit()
                  }}
                  className="h-11 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--gold)]/40"
                />
              </div>

              <div className="hidden items-center gap-2 xl:flex">
                {chips.map((c) => (
                  <Chip
                    key={c.label}
                    active={activeCat === c.slug}
                    onClick={() => onChipClick(c)}
                    type="button"
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {onNotifications ? (
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Tümünü okundu yap"
              onClick={async () => {
                // This will be handled by Notifications page
                const event = new CustomEvent('markAllRead')
                window.dispatchEvent(event)
              }}
              className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--gold)] transition hover:text-[color:var(--gold)]/80 cursor-pointer"
            >
              <CheckCheck size={18} />
            </button>
          </div>
        ) : (
          <>
          {!(onMessages || onProfile || onSecurity || onBlockedUsers) && (
            <>
              <div className="hidden items-center gap-3 lg:flex">
                <GoldBadge className="justify-center">
                  <span className="text-xs font-semibold">{gold}</span>
                  <span className="text-xs font-semibold">altın</span>
                </GoldBadge>
              </div>

              <div className="flex items-center gap-3 lg:hidden">
                <GoldBadge className="justify-center">
                  <span className="text-xs font-semibold">{gold}</span>
                  <span className="text-xs font-semibold">altın</span>
                </GoldBadge>
                  {onHome && (
                    <button
                      type="button"
                      aria-label="Bildirimler"
                      onClick={() => navigate('/bildirimler')}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60 cursor-pointer"
                    >
                      <Bell size={18} />
                    </button>
                  )}
                </div>
              </>
            )}
            {onProfile && isOwnProfile && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Menü"
                  onClick={() => {
                    const event = new CustomEvent('profileMenuOpen')
                    window.dispatchEvent(event)
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center text-white/80 transition hover:text-white"
                >
                  <Menu size={18} />
                </button>
              </div>
            )}
            {/* Mesajlar sayfası kendi header'ını kullanıyor, burada arama butonu gösterme */}
          </>
        )}
      </div>

        {onHome && !onMessages ? (
          <div className="mx-auto max-w-[1480px] px-6 pb-4 lg:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
              />
              <input
                placeholder="Arama"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchSubmit()
                }}
                className="h-11 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--gold)]/40"
              />
            </div>
            <div className="rewora-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {chips.map((c) => (
                <Chip
                  key={c.label}
                  active={activeCat === c.slug}
                  className="shrink-0"
                  onClick={() => onChipClick(c)}
                  type="button"
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

    </header>
  )
}
