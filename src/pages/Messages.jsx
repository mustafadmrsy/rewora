import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Send, MoreVertical } from 'lucide-react'
import Card from '../components/Card'
import { Button } from '../components/ui'
import { getEcho } from '../lib/echo'

const chats = [
  {
    id: 1,
    name: 'Zeynep',
    last: 'Yeni paylaşımını beğendim!',
    time: '2 dk önce',
    unread: 2,
  },
  {
    id: 2,
    name: 'Berk',
    last: 'Görev ekranına bakıyorum.',
    time: '15 dk önce',
    unread: 0,
  },
  {
    id: 3,
    name: 'Rewora Destek',
    last: 'Ödül talebin alındı.',
    time: '1s',
    unread: 1,
  },
  {
    id: 4,
    name: 'Merve',
    last: 'Sinemaya gidiyoruz, gelmek ister misin?',
    time: 'Dün',
    unread: 0,
  },
  {
    id: 5,
    name: 'Ahmet',
    last: 'Ödül detayına bakınca haber ver.',
    time: '2 gün',
    unread: 0,
  },
  {
    id: 6,
    name: 'Ece',
    last: 'Bugün kısa bir görev var mı?',
    time: '2 gün',
    unread: 3,
  },
  {
    id: 7,
    name: 'Deniz',
    last: 'İstersen birlikte planlayalım.',
    time: '3 gün',
    unread: 0,
  },
  {
    id: 8,
    name: 'Can',
    last: 'Görev önerin çok iyiydi.',
    time: '4 gün',
    unread: 0,
  },
  {
    id: 9,
    name: 'Elif',
    last: 'Akşama konuşuruz 👋',
    time: '1 hf',
    unread: 1,
  },
  {
    id: 10,
    name: 'Kaan',
    last: 'Yeni ödüller gelmiş, baktın mı?',
    time: '1 hf',
    unread: 0,
  },
  {
    id: 11,
    name: 'Seda',
    last: 'Ben de o görevi seçtim.',
    time: '2 hf',
    unread: 0,
  },
  {
    id: 12,
    name: 'Mert',
    last: 'İstersen birlikte gidelim.',
    time: '2 hf',
    unread: 0,
  },
  {
    id: 13,
    name: 'Ayşe',
    last: 'Tamamdır, teşekkürler!',
    time: '3 hf',
    unread: 0,
  },
  {
    id: 14,
    name: 'Emir',
    last: 'Bunu hızlıca hallederiz.',
    time: '1 ay',
    unread: 0,
  },
  {
    id: 15,
    name: 'Selin',
    last: 'Yarın uygun musun?',
    time: '1 ay',
    unread: 2,
  },
]

const messagesMock = [
  { id: 1, from: 'other', text: 'Selam! Görevi tamamladın mı?', time: '10:24' },
  { id: 2, from: 'me', text: 'Evet, şimdi onaya gönderdim.', time: '10:25' },
  { id: 3, from: 'other', text: 'Süper, ödül güncellenince haber veririm.', time: '10:26' },
]

export default function Messages() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [showThread, setShowThread] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const conversationId = selected
    if (!conversationId) return

    const echo = getEcho()
    const channelName = `conversation.${conversationId}`

    const channel = echo.private(channelName)
    const stop = channel.listenToAll((eventName, eventData) => {
      console.log('[Echo]', channelName, eventName, eventData)
    })

    return () => {
      if (typeof stop === 'function') stop()
      echo.leave(channelName)
    }
  }, [selected])

  useEffect(() => {
    function sync() {
      setIsMobile(window.innerWidth < 1024)
    }
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])
  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => c.name.toLowerCase().includes(q))
  }, [search])

  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filteredChats.length / pageSize))
  const safePage = Math.min(page, pageCount)

  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [page, safePage])

  const pagedChats = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredChats.slice(start, start + pageSize)
  }, [filteredChats, pageSize, safePage])

  const selectedChat = chats.find((c) => c.id === selected) ?? chats[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-white">Mesajlar</div>
          <div className="text-sm text-white/55">Arkadaşların ve destek ile mesajlaş.</div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'lg:grid-cols-3'}`}>
        {/* Sohbet listesi */}
        {!isMobile || !showThread ? (
        <Card className={`${isMobile ? '' : 'lg:col-span-1'}`}>
          <div className="p-3 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-white/12 bg-white/6 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                placeholder="Ara"
              />
            </div>

            <div className="space-y-2 min-h-[48vh] max-h-[56vh] overflow-y-auto rewora-scroll pr-1">
              {pagedChats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelected(c.id)
                    if (isMobile) setShowThread(true)
                  }}
                  className={`group flex w-full items-center justify-between gap-3 rounded-[14px] border border-white/10 px-3 py-3 text-left transition ${
                    selected === c.id ? 'bg-white/10 border-white/16' : 'bg-white/4 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full border border-white/10 bg-white/10" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{c.name}</div>
                      <div className="truncate text-xs text-white/60">{c.last}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[11px] text-white/50">{c.time}</div>
                    {c.unread > 0 ? (
                      <div className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--gold)] px-2 text-[10px] font-semibold text-black">
                        {c.unread}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Önceki sayfa"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-xs text-white/55">
                {safePage} / {pageCount}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Sonraki sayfa"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Card>
        ) : null}

        {/* Sohbet penceresi */}
        {(!isMobile || showThread) && (
          <Card className={`${isMobile ? '' : 'lg:col-span-2'} h-[70vh]`}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedChat?.name ?? 'Seçili sohbet'}
                    </div>
                    <div className="text-xs text-emerald-400">Çevrimiçi</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isMobile ? (
                    <button
                      type="button"
                      className="inline-flex h-9 px-3 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 text-xs"
                      onClick={() => setShowThread(false)}
                    >
                      ← Listeye dön
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 hover:bg-white/10"
                    aria-label="Daha fazla"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 rewora-scroll">
                {messagesMock.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        m.from === 'me'
                          ? 'bg-[color:var(--gold)] text-black rounded-br-sm'
                          : 'bg-white/8 text-white rounded-bl-sm'
                      }`}
                    >
                      <div>{m.text}</div>
                      <div className="mt-1 text-[11px] text-white/60">{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    className="h-11 flex-1 rounded-full border border-white/12 bg-white/6 px-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                    placeholder="Mesaj yaz..."
                  />
                  <Button className="h-11 px-4 bg-[color:var(--gold)] text-black hover:bg-[color:var(--gold-2)]">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
