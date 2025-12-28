import React from 'react'
import Card from '../../../components/Card'
import { Button, GoldBadge, Skeleton } from '../../../components/ui'

function ScrollList({ children }) {
  return (
    <div className="mt-4 max-h-[210px] space-y-3 overflow-y-auto pr-1 rewora-scroll">
      {children}
    </div>
  )
}

export default function RightColumn({
  miniRewards,
  loadingRewards,
  onInspectReward,
  onGoRewards,
}) {
  return (
    <div className="hidden space-y-6 lg:col-span-1 lg:sticky lg:block lg:self-start">
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
            {loadingRewards ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-[14px]" />
                ))}
              </div>
            ) : miniRewards.length > 0 ? (
              miniRewards.map((r) => (
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
              ))
            ) : (
              <div className="text-center text-xs text-white/55 py-4">Henüz ödül bulunmuyor.</div>
            )}
          </ScrollList>
        </div>
      </Card>
    </div>
  )
}
