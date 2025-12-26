import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  ListTodo,
  Gift,
  MessageCircle,
  User,
  Bell,
} from 'lucide-react'
import { cn } from './ui'

const nav = [
  { to: '/', label: 'Anasayfa', icon: Home },
  { to: '/gorevler', label: 'Görevler', icon: ListTodo },
  { to: '/oduller', label: 'Ödüller', icon: Gift },
  { to: '/mesajlar', label: 'Mesajlar', icon: MessageCircle },
  { to: '/profil', label: 'Profil', icon: User },
]

export default function Sidebar({ gold = 5800 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const onNotifications = location.pathname === '/bildirimler'

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[92px] border-r border-white/10 bg-black/20 backdrop-blur-xl hidden lg:block">
      <div className="flex h-full flex-col items-center gap-4 px-3 py-5">
        <div className="flex flex-col items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={() => navigate('/profil')}
            className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60"
            style={{ cursor: 'pointer' }}
            aria-label="Profil"
          >
            <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0 scale-110" />
          </button>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2">
          {nav.slice(0, 1).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group relative flex h-12 w-full items-center justify-center rounded-2xl border border-transparent transition',
                    'bg-white/0 hover:bg-white/6',
                    isActive && 'bg-white/8 border-white/10',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={cn(
                        'text-white/70 transition group-hover:text-white',
                        isActive && 'text-[color:var(--gold)] drop-shadow-[0_0_16px_rgba(214,255,0,0.35)]',
                      )}
                    />
                    <span className="sr-only">{item.label}</span>
                    {isActive ? (
                      <span className="absolute -right-[3px] h-7 w-[3px] rounded-full bg-[color:var(--gold)]" />
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}

          <button
            type="button"
            className={cn(
              'group relative flex h-12 w-full items-center justify-center rounded-2xl border border-transparent transition',
              'bg-white/0 hover:bg-white/6',
              onNotifications && 'bg-white/8 border-white/10',
              'cursor-pointer',
            )}
            onClick={() => navigate('/bildirimler')}
            aria-label="Bildirimler"
          >
            <Bell
              size={22}
              className={cn(
                'text-white/70 transition group-hover:text-white group-active:scale-95',
                onNotifications &&
                  'text-[color:var(--gold)] drop-shadow-[0_0_16px_rgba(214,255,0,0.35)]',
              )}
            />
            {onNotifications ? (
              <span className="absolute -right-[3px] h-7 w-[3px] rounded-full bg-[color:var(--gold)]" />
            ) : null}
          </button>

          {nav.slice(1).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group relative flex h-12 w-full items-center justify-center rounded-2xl border border-transparent transition',
                    'bg-white/0 hover:bg-white/6',
                    isActive && 'bg-white/8 border-white/10',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={cn(
                        'text-white/70 transition group-hover:text-white',
                        isActive && 'text-[color:var(--gold)] drop-shadow-[0_0_16px_rgba(214,255,0,0.35)]',
                      )}
                    />
                    <span className="sr-only">{item.label}</span>
                    {isActive ? (
                      <span className="absolute -right-[3px] h-7 w-[3px] rounded-full bg-[color:var(--gold)]" />
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/giris')}
            className="flex h-10 w-[calc(100%+8px)] items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-xs font-semibold text-red-200 transition hover:bg-red-500/15 hover:border-red-500/35 cursor-pointer"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  )
}
