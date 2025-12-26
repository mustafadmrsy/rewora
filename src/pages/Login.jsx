import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { api } from '../lib/apiClient'
import { getOrCreateDeviceToken, setSession } from '../lib/authStorage'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (loading) return
    setError('')

    try {
      setLoading(true)
      const deviceToken = getOrCreateDeviceToken()

      const res = await api.post('/auth/login', {
        email,
        password,
        token: deviceToken,
        type: 'android',
      })

      const accessToken = res?.data?.access_token
      const tokenType = res?.data?.token_type
      const user = res?.data?.user

      if (!accessToken) {
        setError('Giriş başarısız. Lütfen tekrar deneyin.')
        return
      }

      setSession({ accessToken, tokenType, user })
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err?.data?.message
      setError(typeof msg === 'string' && msg.length ? msg : 'Giriş başarısız. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-1)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-5 py-10">
        <div className="text-center">
          <button
            type="button"
            className="mx-auto flex items-center gap-2 text-left cursor-pointer"
            aria-label="Rewora"
            onClick={() => navigate('/')}
          >
            <img alt="Rewora" className="h-8 w-8 shrink-0" src="/logo/rewora_logo.png" />
            <span className="text-lg font-semibold leading-none tracking-tight text-white">ewora</span>
          </button>
          <div className="mt-2 text-sm text-white/55">Hesabına giriş yap</div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.1 1.53 7.5 2.81l5.5-5.5C33.74 3.86 29.33 1.5 24 1.5 14.62 1.5 6.59 6.88 2.7 14.7l6.74 5.23C11.2 13.42 17.1 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.57-.14-2.66-.43-3.8H24v7.2h12.74c-.26 2.02-1.67 5.06-4.81 7.1l7.38 5.73C43.81 36.07 46.5 30.65 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M9.44 28.93A14.6 14.6 0 0 1 8.66 24c0-1.71.3-3.36.78-4.93L2.7 13.84A23.96 23.96 0 0 0 0 24c0 3.87.93 7.53 2.7 10.16l6.74-5.23z"
              />
              <path
                fill="#34A853"
                d="M24 46.5c5.33 0 9.81-1.76 13.08-4.77l-7.38-5.73c-1.97 1.37-4.6 2.34-5.7 2.34-6.9 0-12.8-3.92-14.56-9.43L2.7 34.16C6.59 41.98 14.62 46.5 24 46.5z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Google ile devam et
          </button>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M16.365 1.43c0 1.14-.41 2.21-1.23 3.2-.99 1.19-2.31 1.88-3.65 1.77-.17-1.19.42-2.4 1.17-3.26.86-.99 2.35-1.72 3.71-1.71z"
              />
              <path
                fill="currentColor"
                d="M20.64 17.11c-.53 1.23-.78 1.78-1.46 2.87-.95 1.5-2.29 3.37-3.95 3.39-1.47.02-1.85-.96-3.85-.95-2 0-2.42.97-3.89.97-1.66-.02-2.93-1.7-3.88-3.2-2.66-4.19-2.94-9.11-1.3-11.64 1.16-1.79 3-2.84 4.73-2.84 1.76 0 2.87.97 4.32.97 1.41 0 2.27-.97 4.31-.97 1.54 0 3.17.84 4.33 2.3-3.78 2.07-3.17 7.48.64 9.1z"
              />
            </svg>
            Apple ile devam et
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-xs text-white/50">veya</div>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                className="h-12 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                placeholder="E-posta"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                className="h-12 w-full rounded-full border border-white/12 bg-white/6 pl-11 pr-12 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                placeholder="Şifre"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {error ? <div className="px-1 text-xs font-semibold text-rose-300">{error}</div> : null}

            <Button className="h-12 w-full text-sm" disabled={loading} type="submit">
              {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
            </Button>
          </form>

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
