import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, IconButton } from '../components/ui'
import { listMissions, listUserMissions, submitMissionPost } from '../lib/missionsApi'

export default function TaskComplete() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [params] = useSearchParams()
  const userMissionId = params.get('um')

  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mission, setMission] = useState(null)
  const [file, setFile] = useState(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [m, um] = await Promise.all([listMissions(), listUserMissions()])
        if (cancelled) return

        const found = (m.missions ?? []).find((x) => String(x.id) === String(id)) ?? null
        setMission(found)

        if (!userMissionId) {
          const related = (um.userMissions ?? []).find(
            (x) => String(x.mission_id) === String(id) && String(x.status) === 'pending',
          )
          if (related?.id) {
            navigate(`/gorevler/${id}/tamamla?um=${related.id}`, { replace: true })
          }
        }
      } catch {
        if (cancelled) return
        setMission(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id, userMissionId])

  async function onSubmit() {
    if (submitting) return
    setError('')

    const umId = Number(userMissionId)
    if (!umId) {
      setError('Görev kaydı bulunamadı. Lütfen görevi önce başlatın.')
      return
    }
    if (!file) {
      setError('Lütfen bir fotoğraf yükleyin.')
      return
    }

    try {
      setSubmitting(true)
      const res = await submitMissionPost({ userMissionId: umId, content, file })
      const postId = res?.data?.post?.id ?? res?.data?.post_id ?? null
      navigate(postId ? `/post/${postId}` : '/', { replace: true })
    } catch (err) {
      const msg = err?.data?.message
      setError(typeof msg === 'string' && msg.length ? msg : 'Paylaşım gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[920px] space-y-6 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <IconButton onClick={() => navigate(-1)} type="button" aria-label="Geri">
          <ArrowLeft size={18} />
        </IconButton>
        <div className="flex-1 text-center text-lg font-semibold tracking-tight text-white">Tamamla</div>
        <GoldBadge className="px-3 py-1.5">
          <span className="text-xs font-semibold">{mission?.coin ?? 0}</span>
          <span className="text-xs font-semibold">altın</span>
        </GoldBadge>
      </div>

      <Card className="w-full">
        <div className="p-4 sm:p-6 space-y-5">
          <button
            type="button"
            className="aspect-[4/3] w-full rounded-[18px] bg-black/30 border border-white/10 flex items-center justify-center text-white/50 min-h-[240px] overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || submitting}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sm font-medium">
                <Camera size={28} />
                <div>Fotoğraf / dosya yükle</div>
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              setFile(f)
            }}
          />

          <div>
            <div className="text-sm text-white/70 mb-2">Açıklama yaz...</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] w-full rounded-[16px] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
              placeholder="Görevi nasıl tamamladığını anlat"
            />
          </div>

          {error ? <div className="text-sm font-semibold text-rose-300">{error}</div> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)} type="button" className="h-12 text-sm">
              Vazgeç
            </Button>
            <Button type="button" onClick={onSubmit} className="h-12 text-sm" disabled={loading || submitting}>
              {submitting ? 'Paylaşılıyor...' : 'Paylaş'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
