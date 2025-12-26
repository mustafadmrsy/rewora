import React from 'react'
import { cn } from './ui'

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'group',
        'relative overflow-hidden rounded-[20px] border border-white/10 bg-white/6 shadow-[var(--shadow)]',
        'transition will-change-transform hover:scale-[1.01] hover:border-white/14 hover:bg-white/7',
        'hover:shadow-[0_22px_70px_rgba(0,0,0,0.55)]',
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(214,255,0,0.12),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </div>
  )
}
