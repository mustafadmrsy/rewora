import React from 'react'
import Card from '../../../components/Card'
import { Button, GoldBadge } from '../../../components/ui'

function ScrollList({ children }) {
  return (
    <div className="mt-4 max-h-[210px] space-y-3 overflow-y-auto pr-1 rewora-scroll">
      {children}
    </div>
  )
}

export default function RightColumn({
  miniRewards,
  activeTasks,
  onInspectReward,
  onGoRewards,
  onContinueTask,
}) {
  return (
    <div className="hidden space-y-6 lg:col-span-1 lg:sticky lg:top-24 lg:block lg:self-start">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">Mini Ödüller</div>
              <div className="mt-2 text-sm text-white/55">En yakın ödülleri hızlıca incele.</div>
            </div>
            <Button variant="secondary" size="sm" type="button" onClick={onGoRewards}>
              Tümü
            </Button>
          </div>

          <ScrollList>
            {miniRewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 bg-white/4 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                  <div className="mt-1 text-xs text-white/55">Yakınındaki partner ödül</div>
                </div>

                <GoldBadge className="px-2 py-1">
                  <span className="text-xs font-semibold">{r.price}</span>
                  <span className="text-xs font-semibold">altın</span>
                </GoldBadge>

                <Button
                  className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-400"
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => onInspectReward(r)}
                >
                  İncele
                </Button>
              </div>
            ))}
          </ScrollList>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">Devam Eden Görevler</div>
              <div className="mt-2 text-sm text-white/55">Takipte olduğun görevler.</div>
            </div>
            <Button variant="secondary" size="sm" type="button" onClick={onContinueTask}>
              Git
            </Button>
          </div>

          <ScrollList>
            {activeTasks.map((t, i) => (
              <div
                key={`${t.title}-${i}`}
                className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/4 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                  <div className="text-xs text-white/55">İlerleme: {t.progress}%</div>
                </div>
                <GoldBadge className="px-2 py-1">
                  <span className="text-xs font-semibold">{t.reward}</span>
                  <span className="text-xs font-semibold">altın</span>
                </GoldBadge>
              </div>
            ))}
          </ScrollList>
        </div>
      </Card>
    </div>
  )
}
