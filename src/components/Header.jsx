import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Search, Home, ListTodo, Gift, MessageCircle, User } from 'lucide-react'
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
  const [openProfileMenu, setOpenProfileMenu] = useState(false)
  
  // Get coin from user session
  const currentUser = getUser()
  const gold = currentUser?.coin ?? 0

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

  useEffect(() => {
    function onProfileDocClick(e) {
      if (!openProfileMenu) return
      if (profileMenuRef.current && profileMenuRef.current.contains(e.target)) return
      setOpenProfileMenu(false)
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpenProfileMenu(false)
    }
    document.addEventListener('mousedown', onProfileDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onProfileDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [openProfileMenu])

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

            {onHome ? (
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
            ) : null}
          </div>
        </div>

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
          <button
            className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/8"
            onClick={() => setOpenProfileMenu((v) => !v)}
            type="button"
            aria-label="Profil"
            style={{ cursor: 'pointer' }}
          >
            <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0 scale-110" />
          </button>
        </div>
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
      {openProfileMenu ? (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpenProfileMenu(false)}>
          <div
            ref={profileMenuRef}
            className="absolute right-3 top-16 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black/90 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur animate-[fadeIn_150ms_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/4">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-white/12 bg-white/10" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Profil</div>
                <div className="text-[11px] text-white/55">Hızlı gezinme</div>
              </div>
            </div>
            <div className="py-2">
              <button
                type="button"
                onClick={() => {
                  setOpenProfileMenu(false)
                  clearSession()
                  resetEcho()
                  navigate('/giris')
                }}
                className="w-full px-4 py-3 text-left text-sm transition flex items-center gap-3 text-red-200 hover:bg-red-500/10"
              >
                <span className="font-semibold">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
