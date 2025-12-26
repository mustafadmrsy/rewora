import React from 'react'
import { ArrowLeft, Camera } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import { Button, GoldBadge, IconButton } from '../components/ui'
import { tasks } from '../data/tasks'

export default function TaskComplete() {
  const navigate = useNavigate()
  const { id } = useParams()
  const task = tasks.find((t) => String(t.id) === String(id)) ?? null

  return (
    <div className="mx-auto max-w-[920px] space-y-6 px-3 sm:px-0">
      <div className="flex items-center gap-3">
        <IconButton onClick={() => navigate(-1)} type="button" aria-label="Geri">
          <ArrowLeft size={18} />
        </IconButton>
        <div className="flex-1 text-center text-lg font-semibold tracking-tight text-white">Tamamla</div>
        <GoldBadge className="px-3 py-1.5">
          <span className="text-xs font-semibold">{task?.reward ?? 0}</span>
          <span className="text-xs font-semibold">altın</span>
        </GoldBadge>
      </div>

      <Card className="w-full">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="aspect-[4/3] w-full rounded-[18px] bg-black/30 border border-white/10 flex items-center justify-center text-white/50 min-h-[240px]">
            <div className="flex flex-col items-center gap-2 text-sm font-medium">
              <Camera size={28} />
              <div>Fotoğraf / dosya yükle</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-white/70 mb-2">Açıklama yaz...</div>
            <textarea
              className="min-h-[140px] w-full rounded-[16px] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
              placeholder="Görevi nasıl tamamladığını anlat"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)} type="button" className="h-12 text-sm">
              Vazgeç
            </Button>
            <Button type="button" onClick={() => navigate(-1)} className="h-12 text-sm">
              Paylaş
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
