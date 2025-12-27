import React, { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {Home, Award, Send, User, CheckCircle, Users} from 'lucide-react'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from './ui'

const titleByPath = {
  '/': 'Rewora',
  '/gorevler': 'Görevler',
  '/oduller': 'Ödüller',
  '/mesajlar': 'Mesajlar',
  '/profil': 'Profil',
}

export default function AppShell() {
  const location = useLocation()
  const title = titleByPath[location.pathname] ?? 'Rewora'

  // Hide header only on post detail pages
  const hideHeader = location.pathname.startsWith('/post/')

  // Global toast for rate limiting
  const [rateLimitToast, setRateLimitToast] = useState(null)
  const rateLimitToastTimer = useRef(null)

  useEffect(() => {
    function handleRateLimit(event) {
      setRateLimitToast({ message: event.detail.message })
      if (rateLimitToastTimer.current) clearTimeout(rateLimitToastTimer.current)
      rateLimitToastTimer.current = setTimeout(() => setRateLimitToast(null), 3000)
    }

    window.addEventListener('apiRateLimit', handleRateLimit)
    return () => {
      window.removeEventListener('apiRateLimit', handleRateLimit)
      if (rateLimitToastTimer.current) clearTimeout(rateLimitToastTimer.current)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar gold={5800} />

      <div className="pl-0 lg:pl-[92px]">
        {!hideHeader && <Header title={title} gold={5800} />}

        <main className="mx-auto max-w-[1480px] px-4 sm:px-6 pb-6 pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-6 w-full overflow-x-hidden">
          <div className="w-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1480px] items-center justify-around px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
          {[
            { to: '/', icon: Home, label: 'Anasayfa' },
            { to: '/oduller', icon: Award, label: 'Ödüller' },
            { to: '/gorevler', icon: Users, label: 'Görevler' },
            { to: '/mesajlar', icon: Send, label: 'Mesajlar' },
            { to: '/profil', icon: User, label: 'Profil' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-white/60 transition',
                    isActive
                      ? 'bg-white/8 text-[color:var(--gold)] shadow-[0_0_0_4px_rgba(214,255,0,0.10)]'
                      : 'hover:bg-white/6 hover:text-white/85',
                  )
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Global rate limit toast */}
      {rateLimitToast ? (
        <div className="fixed left-1/2 top-6 z-[100] w-[92%] max-w-[460px] -translate-x-1/2 rounded-[20px] border border-orange-500/30 bg-black/90 px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-orange-400">
              <CheckCircle size={22} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-orange-400">Yavaş Ol!</div>
              <div className="text-sm leading-relaxed text-white/85">{rateLimitToast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => setRateLimitToast(null)}
              className="ml-auto text-white/60 transition hover:text-white"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
