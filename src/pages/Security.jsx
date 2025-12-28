import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../lib/postsApi'
import Card from '../components/Card'
import { Button } from '../components/ui'

export default function Security() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    // Frontend validation
    if (password.length < 8) {
      setErrors({ password: ['Şifre en az 8 karakter olmalıdır'] })
      return
    }

    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: ['Şifreler eşleşmiyor'] })
      return
    }

    setLoading(true)
    try {
      await updatePassword(password, passwordConfirmation)
      setSuccess(true)
      setPassword('')
      setPasswordConfirmation('')
      setTimeout(() => {
        navigate('/profil')
      }, 1500)
    } catch (error) {
      if (error.status === 422) {
        // Laravel validation errors
        const validationErrors = error.data?.errors ?? {}
        setErrors(validationErrors)
      } else {
        const errorMessage = error.data?.message ?? error.message ?? 'Bir hata oluştu. Lütfen tekrar deneyin.'
        setErrors({ general: [errorMessage] })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[520px] lg:max-w-[920px] space-y-6 p-4">
      <Card>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Şifre Değiştir</h2>
            <p className="mt-2 text-sm text-white/60">Hesabınızın güvenliği için güçlü bir şifre kullanın.</p>
          </div>

          {success && (
            <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-4">
              <div className="text-sm font-semibold text-emerald-400">Şifre başarıyla güncellendi!</div>
            </div>
          )}

          {errors.general && errors.general.length > 0 && (
            <div className="rounded-lg bg-rose-500/20 border border-rose-500/30 p-4">
              <div className="text-sm font-semibold text-rose-400">{errors.general[0]}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Yeni Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border bg-white/6 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/10 focus:ring-[#D6FF00]/50'
                }`}
                placeholder="En az 8 karakter"
                disabled={loading}
              />
              {errors.password && errors.password.length > 0 && (
                <div className="mt-2 text-sm text-rose-400">
                  {errors.password.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-white mb-2">
                Şifre Tekrar
              </label>
              <input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className={`w-full rounded-lg border bg-white/6 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 transition ${
                  errors.password_confirmation
                    ? 'border-rose-500/50 focus:ring-rose-500/50'
                    : 'border-white/10 focus:ring-[#D6FF00]/50'
                }`}
                placeholder="Şifrenizi tekrar girin"
                disabled={loading}
              />
              {errors.password_confirmation && errors.password_confirmation.length > 0 && (
                <div className="mt-2 text-sm text-rose-400">
                  {errors.password_confirmation.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || password.length < 8 || password !== passwordConfirmation}
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

