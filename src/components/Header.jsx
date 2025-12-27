import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Search, Home, ListTodo, Gift, MessageCircle, User, ChevronLeft, LucideCheckCircle2, CheckCheck } from 'lucide-react'
import { Chip, GoldBadge, IconButton } from './ui'
import { clearSession, getUser } from '../lib/authStorage'
import { resetEcho } from '../lib/echo'

const chips = [
  { label: '#tümü' },
  { label: '#eğlence' },
  { label: '#sağlık' },
  { label: '#alışveriş' },
  { label: '#finans' },
]

export default function Header({ title = 'Rewora' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const activeCat = params.get('cat') ?? '#tümü'
  const qParam = params.get('q') ?? ''

  const [openNotif, setOpenNotif] = useState(false)
  const notifRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [search, setSearch] = useState(qParam)
  const onHome = location.pathname === '/'
  const onTasks = location.pathname === '/gorevler'
  const onRewards = location.pathname === '/oduller'
  const onNotifications = location.pathname === '/bildirimler'
  
  // Get coin and user info from session
  const currentUser = getUser()
  const gold = currentUser?.coin ?? 0
  const fullName = currentUser ? `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim() : ''

  useEffect(() => {
    setSearch(qParam)
  }, [qParam, location.pathname])

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

  

  const mobileNav = [
    { to: '/', label: 'Anasayfa', icon: Home },
    { to: '/gorevler', label: 'Görevler', icon: ListTodo },
    { to: '/oduller', label: 'Ödüller', icon: Gift },
    { to: '/mesajlar', label: 'Mesajlar', icon: MessageCircle },
    { to: '/profil', label: 'Profil', icon: User },
  ]

  function goHomeWithParams(next) {
    const nextParams = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => {
      if (!v) nextParams.delete(k)
      else nextParams.set(k, String(v))
    })
    navigate({ pathname: '/', search: nextParams.toString() ? `?${nextParams.toString()}` : '' })
  }

  function onChipClick(label) {
    goHomeWithParams({ cat: label === '#tümü' ? '' : label })
  }

  function onSearchSubmit() {
    const trimmed = search.trim()
    goHomeWithParams({ q: trimmed })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {onHome ? (
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-left cursor-pointer"
                aria-label="Rewora"
              >
                <img
                  src="/logo/rewora_logo.png"
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
                className="inline-flex items-center justify-center text-[color:var(--gold)] transition hover:text-[color:var(--gold)]/80 cursor-pointer z-10"
                aria-label="Geri"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 text-center absolute left-0 right-0 pointer-events-none">
                <div className="text-lg font-semibold leading-none tracking-tight text-white">
                  Bildirimler
                </div>
              </div>
            </div>
          ) : (onTasks || onRewards) && fullName ? (
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-none tracking-tight text-white">
                {fullName}
              </div>
            </div>
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
                    active={activeCat === c.label}
                    onClick={() => onChipClick(c.label)}
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
              className="inline-flex items-center justify-center text-[color:var(--gold)] transition hover:text-[color:var(--gold)]/80 cursor-pointer w-6"
            >
              <CheckCheck size={20} />
            </button>
          </div>
        ) : (
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
              <button
                type="button"
                aria-label="Bildirimler"
                onClick={() => navigate('/bildirimler')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60 cursor-pointer"
              >
                <Bell size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {onHome ? (
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
                active={activeCat === c.label}
                className="shrink-0"
                onClick={() => onChipClick(c.label)}
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
