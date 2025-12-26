import React, { useEffect, useMemo, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Search, Send, MoreVertical, ArrowLeft } from 'lucide-react'
import Card from '../components/Card'
import { Button } from '../components/ui'
import { getEcho } from '../lib/echo'
import { listConversations, listMessages, sendMessage, resolvePostImageUrl, mapMessage } from '../lib/messagesApi'
import { getUser } from '../lib/authStorage'
import { formatRelativeDate } from '../lib/postsApi'

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
  const [selected, setSelected] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showThread, setShowThread] = useState(false)
  const [page, setPage] = useState(1)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messagesPage, setMessagesPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const scrollPositionRef = useRef({ height: 0, top: 0 })
  const currentUser = getUser()
  const currentUserId = currentUser?.id

  // Load conversations
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await listConversations()
        if (cancelled) return
        setConversations(res.conversations ?? [])
        // Don't auto-select first conversation
      } catch {
        if (cancelled) return
        setConversations([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Load messages for selected conversation - only when conversation is clicked
  useEffect(() => {
    if (!selected) {
      setMessages([])
      setMessagesPage(1)
      setHasMoreMessages(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const res = await listMessages(selected, 1, currentUserId)
        if (cancelled) return
        // API returns newest first, reverse to show oldest first (WhatsApp style)
        // Oldest messages at top, newest at bottom
        const reversed = [...(res.messages ?? [])].reverse()
        setMessages(reversed)
        setMessagesPage(1)
        setHasMoreMessages(res.pagination?.next_page_url ? true : false)
        // Scroll to bottom on initial load to show latest message (WhatsApp style)
        // Use multiple requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const container = messagesContainerRef.current
              if (container) {
                // Force scroll to absolute bottom
                container.scrollTop = container.scrollHeight + 1000
                // Then set to actual bottom
                setTimeout(() => {
                  if (container) {
                    container.scrollTop = container.scrollHeight
                  }
                }, 50)
              }
            }, 150)
          })
        })
      } catch {
        if (cancelled) return
        setMessages([])
        setMessagesPage(1)
        setHasMoreMessages(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [selected, currentUserId])

  // Load more messages when scrolling to top
  const loadMoreMessages = async () => {
    if (!selected || loadingMore || !hasMoreMessages) return

    setLoadingMore(true)
    try {
      const nextPage = messagesPage + 1
      const res = await listMessages(selected, nextPage, currentUserId)
      
      if (res.messages && res.messages.length > 0) {
        // Get current scroll position and measurements before adding messages
        const container = messagesContainerRef.current
        if (!container) return
        
        // Save current scroll state before adding messages
        scrollPositionRef.current = {
          height: container.scrollHeight,
          top: container.scrollTop,
        }
        
        // API returns newest first, reverse and prepend to top (older messages go above)
        // Older messages should be added to top, newest stays at bottom
        // Filter out duplicates by message ID
        const reversed = [...(res.messages ?? [])].reverse()
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = reversed.filter(m => m.id && !existingIds.has(m.id))
          return [...newMessages, ...prev]
        })
        setMessagesPage(nextPage)
        setHasMoreMessages(res.pagination?.next_page_url ? true : false)
        
        // Restore scroll position after DOM updates - keep page stable
        // Use requestAnimationFrame to wait for React render, then restore
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const containerAfter = messagesContainerRef.current
            if (containerAfter && scrollPositionRef.current.height > 0) {
              const newScrollHeight = containerAfter.scrollHeight
              const heightDiff = newScrollHeight - scrollPositionRef.current.height
              // Add the height difference to maintain the same visual position
              // This keeps the user at the same scroll position - page stays stable
              containerAfter.scrollTop = scrollPositionRef.current.top + heightDiff
            }
          })
        })
      } else {
        setHasMoreMessages(false)
      }
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle scroll for pagination
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !selected) return

    function handleScroll() {
      // Load more when scrolled near top (within 300px)
      // User is scrolling, so we just load more without interfering
      if (container.scrollTop < 300 && hasMoreMessages && !loadingMore) {
        loadMoreMessages()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [selected, hasMoreMessages, loadingMore, messagesPage, loadMoreMessages])

  // WebSocket connection for real-time messages
  useEffect(() => {
    const conversationId = selected
    if (!conversationId) return

    let channel = null
    let isSubscribed = false

    try {
      const echo = getEcho()
      const channelName = `private-conversation.${conversationId}`
      
      channel = echo.private(channelName)
      
      // Wait for subscription
      channel.subscribed(() => {
        isSubscribed = true
        console.log('[Echo] Subscribed to', channelName)
      })
      
      // Listen for new messages
      channel.listen('.message.sent', (data) => {
        console.log('[Echo] Message received', data)
        const newMessage = data.message
        if (newMessage) {
          // Map message with current user id to determine from_me
          const mappedMessage = mapMessage(newMessage, currentUserId)
          if (mappedMessage) {
            // New messages go to bottom (newest at bottom, normal chat order)
            // Check for duplicates before adding
            setMessages((prev) => {
              const exists = prev.some(m => m.id === mappedMessage.id)
              if (exists) return prev
              return [...prev, mappedMessage]
            })
          // Update conversation list
          setConversations((prev) => prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                last_message: {
                  id: mappedMessage.id,
                  text: mappedMessage.text,
                  time: mappedMessage.time,
                  from_me: mappedMessage.from_me,
                },
              }
            }
            return conv
          }))
          // Don't scroll - new messages are added to top, user can see them naturally
        }
      }
    })

    } catch (error) {
      console.error('[Echo] Error connecting to channel:', error)
    }

    return () => {
      if (channel) {
        try {
          channel.stopListening('.message.sent')
          const echo = getEcho()
          echo.leave(`private-conversation.${conversationId}`)
        } catch (error) {
          console.error('[Echo] Error leaving channel:', error)
        }
      }
    }
  }, [selected, currentUserId])

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
    const list = conversations
    if (!q) return list
    return list.filter((c) => {
      const name = c.other_user?.name ?? ''
      return name.toLowerCase().includes(q)
    })
  }, [conversations, search])

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

  const selectedChat = conversations.find((c) => c.id === selected) ?? null

  async function handleSendMessage() {
    if (!selected || !messageText.trim() || sending) return

    const text = messageText.trim()
    setMessageText('')
    setSending(true)

    try {
      await sendMessage(selected, text)
      // Message will be added via WebSocket
    } catch (err) {
      setMessageText(text) // Restore text on error
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

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
                    setShowThread(true)
                    // Clear messages first to ensure clean load
                    setMessages([])
                  }}
                  className={`group flex w-full items-center justify-between gap-3 rounded-[14px] border border-white/10 px-3 py-3 text-left transition ${
                    selected === c.id ? 'bg-white/10 border-white/16' : 'bg-white/4 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full border border-white/10 bg-white/10 overflow-hidden shrink-0">
                      {c.other_user?.photo_url ? (
                        <img 
                          src={c.other_user.photo_url} 
                          alt={c.other_user.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{c.other_user?.name ?? 'Kullanıcı'}</div>
                      <div className="truncate text-xs text-white/60">{c.last_message?.text ?? ''}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <div className="text-[11px] text-white/50">{c.last_message?.time ?? ''}</div>
                    {c.unread_count > 0 ? (
                      <div className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--gold)] px-2 text-[10px] font-semibold text-black">
                        {c.unread_count}
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
              {selectedChat ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {isMobile && (
                        <button
                          type="button"
                          onClick={() => setShowThread(false)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
                          aria-label="Geri"
                        >
                          <ArrowLeft size={18} />
                        </button>
                      )}
                      <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10 overflow-hidden shrink-0">
                        {selectedChat.other_user?.photo_url ? (
                          <img 
                            src={selectedChat.other_user.photo_url} 
                            alt={selectedChat.other_user.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {selectedChat.other_user?.name ?? 'Kullanıcı'}
                        </div>
                        <div className="text-xs text-emerald-400">Çevrimiçi</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/70 hover:bg-white/10"
                        aria-label="Daha fazla"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

              <div 
                ref={messagesContainerRef}
                className="flex-1 space-y-3 overflow-y-auto px-4 py-4 rewora-scroll"
              >
                {loading ? (
                  <div className="text-center text-sm text-white/50 py-4">Yükleniyor...</div>
                ) : (
                  <>
                    {loadingMore && (
                      <div className="text-center text-sm text-white/50 py-2">Eski mesajlar yükleniyor...</div>
                    )}
                    {messages.length > 0 ? (
                      <>
                        {messages.map((m, index) => (
                      <div
                        key={m.id ? `msg-${m.id}` : `msg-${index}-${m.text?.substring(0, 10)}`}
                        className={`flex ${m.from_me ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            m.from_me
                              ? 'bg-[color:var(--gold)] text-black rounded-br-sm'
                              : 'bg-white/8 text-white rounded-bl-sm'
                          }`}
                        >
                          <div>{m.text}</div>
                          <div className={`mt-1 text-[11px] ${m.from_me ? 'text-black/60' : 'text-white/60'}`}>
                            {m.time}
                          </div>
                        </div>
                      </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-center text-sm text-white/50 py-4">Henüz mesaj yok.</div>
                    )}
                  </>
                )}
              </div>

                  <div className="border-t border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        disabled={sending}
                        className="h-11 flex-1 rounded-full border border-white/12 bg-white/6 px-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40 disabled:opacity-50"
                        placeholder="Mesaj yaz..."
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={sending || !messageText.trim()}
                        className="h-11 px-4 bg-[color:var(--gold)] text-black hover:bg-[color:var(--gold-2)] disabled:opacity-50"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-4 py-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full border border-white/10 bg-white/6 flex items-center justify-center">
                      <Send size={24} className="text-white/40" />
                    </div>
                    <div className="text-sm font-semibold text-white">Bir konuşma seçin</div>
                    <div className="mt-2 text-xs text-white/50">Mesajlaşmak için sol taraftan bir konuşma seçin</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
