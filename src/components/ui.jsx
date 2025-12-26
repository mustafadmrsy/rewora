import React from 'react'

export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer'

  const variants = {
    primary:
      'bg-[color:var(--gold)] text-black hover:bg-[color:var(--gold-2)] hover:shadow-[0_0_0_4px_rgba(214,255,0,0.12)]',
    secondary:
      'bg-white/10 text-white hover:bg-white/14 border border-white/10',
    ghost: 'bg-transparent text-white/80 hover:bg-white/8',
  }

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconButton({ className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Chip({ active = false, className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center rounded-full border px-4 text-sm transition active:scale-[0.98]',
        active
          ? 'border-white/20 bg-white text-black'
          : 'border-white/14 bg-white/0 text-white/78 hover:bg-white/6',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ProgressBar({ value = 0, className }) {
  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-white/10',
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[color:var(--gold)] shadow-[0_0_20px_rgba(214,255,0,0.30)] transition-[width] duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function GoldBadge({ children, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-3 py-1 text-sm font-semibold text-black shadow-[0_0_0_4px_rgba(214,255,0,0.12)] transition hover:shadow-[0_0_0_6px_rgba(214,255,0,0.16)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[20px] bg-white/6 shadow-[var(--shadow)]',
        className,
      )}
    />
  )
}
