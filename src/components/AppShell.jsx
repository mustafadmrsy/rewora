import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Gift, Home, ListTodo, MessageCircle, User } from 'lucide-react'
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
  
  // Hide header on messages and profile pages
  const hideHeader = location.pathname === '/mesajlar' || location.pathname === '/profil' || location.pathname.startsWith('/profil/')

  return (
    <div className="min-h-screen">
      <Sidebar gold={5800} />

      <div className="pl-0 lg:pl-[92px]">
        {!hideHeader && <Header title={title} gold={5800} />}

        <main className="mx-auto max-w-[1480px] px-4 sm:px-6 py-6 pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-6 w-full overflow-x-hidden">
          <div className="w-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-[1480px] items-center justify-around px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))]">
          {[
            { to: '/', icon: Home, label: 'Anasayfa' },
            { to: '/gorevler', icon: ListTodo, label: 'Görevler' },
            { to: '/oduller', icon: Gift, label: 'Ödüller' },
            { to: '/mesajlar', icon: MessageCircle, label: 'Mesajlar' },
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
    </div>
  )
}
