import React, { useState } from 'react'
import { Apple, Chrome, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-[color:var(--bg-1)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-5 py-10">
        <div className="text-center">
          <div className="text-3xl font-semibold tracking-tight text-white">Rewora</div>
          <div className="mt-2 text-sm text-white/55">Hesabına giriş yap</div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <Chrome size={18} />
            Google ile devam et
          </button>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <Apple size={18} />
            Apple ile devam et
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-xs text-white/50">veya</div>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                className="h-12 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                placeholder="E-posta"
                inputMode="email"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                className="h-12 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-12 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                placeholder="Şifre"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 hover:bg-white/10"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="inline-flex items-center gap-2 text-xs text-white/60">
                <input type="checkbox" className="h-4 w-4 accent-[color:var(--gold)]" />
                Beni hatırla
              </label>
              <button type="button" className="text-xs font-semibold text-white/75 hover:text-white">
                Şifremi unuttum
              </button>
            </div>

            <Button className="h-12 w-full text-sm">Giriş yap</Button>
          </div>

          <div className="pt-2 text-center text-sm text-white/55">
            Hesabın yok mu?{' '}
            <Link to="/kayit" className="font-semibold text-white hover:underline">
              Kayıt ol
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          Giriş yaparak kullanıcı sözleşmesini kabul etmiş olursun.
        </div>
      </div>
    </div>
  )
}
