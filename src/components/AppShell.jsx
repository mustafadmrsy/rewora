import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

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

  return (
    <div className="min-h-screen">
      <Sidebar gold={5800} />

      <div className="pl-0 lg:pl-[92px]">
        <Header title={title} gold={5800} />

        <main className="mx-auto max-w-[1480px] px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
