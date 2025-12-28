import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Search, Send, MoreVertical, ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui'
import { listConversations, listMessages, sendMessage, mapMessage } from '../lib/messagesApi'
import { getUser } from '../lib/authStorage'
import { connectToConversation, disconnect } from '../lib/echoService'

export default function Messages() {
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [selected, setSelected] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [showThread, setShowThread] = useState(false)
    const [conversationsPage, setConversationsPage] = useState(1)
    const [hasMoreConversations, setHasMoreConversations] = useState(true)
    const [loadingMoreConversations, setLoadingMoreConversations] = useState(false)
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [sending, setSending] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messagesPage, setMessagesPage] = useState(1)
    const [hasMoreMessages, setHasMoreMessages] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState(new Set())
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const conversationsContainerRef = useRef(null)
    const scrollPositionRef = useRef({ height: 0, top: 0 })
    const currentUser = getUser()
    const currentUserId = currentUser?.id

    /* ================= CONVERSATIONS ================= */

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                const res = await listConversations(1)
                if (cancelled) return
                setConversations(res.conversations ?? [])
                setConversationsPage(1)
                setHasMoreConversations(!!res.pagination?.next_page_url)
            } catch {
                if (!cancelled) setConversations([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => (cancelled = true)
    }, [])

    const loadMoreConversations = useCallback(async () => {
        if (loadingMoreConversations || !hasMoreConversations) return

        setLoadingMoreConversations(true)
        try {
            const nextPage = conversationsPage + 1
            const res = await listConversations(nextPage)

            if (res.conversations?.length) {
                setConversations(prev => {
                    const ids = new Set(prev.map(c => c.id))
                    return [...prev, ...res.conversations.filter(c => !ids.has(c.id))]
                })
                setConversationsPage(nextPage)
                setHasMoreConversations(!!res.pagination?.next_page_url)
            } else {
                setHasMoreConversations(false)
            }
        } finally {
            setLoadingMoreConversations(false)
        }
    }, [conversationsPage, loadingMoreConversations, hasMoreConversations])

    useEffect(() => {
        const el = conversationsContainerRef.current
        if (!el) return

        const onScroll = () => {
            if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
                loadMoreConversations()
            }
        }

        el.addEventListener('scroll', onScroll)
        return () => el.removeEventListener('scroll', onScroll)
    }, [loadMoreConversations])

    /* ================= MESSAGES ================= */

    useEffect(() => {
        if (!selected) {
            setMessages([])
            setLoading(false)
            return
        }

        let cancelled = false

        async function load() {
            setLoading(true)
            try {
                const res = await listMessages(selected, 1, currentUserId)
                if (cancelled) return

                const reversed = [...(res.messages ?? [])].reverse()
                setMessages(reversed)
                setMessagesPage(1)
                setHasMoreMessages(!!res.pagination?.next_page_url)

                // Scroll to bottom after messages load
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const el = messagesContainerRef.current
                        if (el) {
                            el.scrollTop = el.scrollHeight
                        }
                    })
                })
            } catch {
                if (!cancelled) setMessages([])
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => (cancelled = true)
    }, [selected, currentUserId])

    /* ================= RAW WS ================= */

    useEffect(() => {
        if (!selected || !currentUserId) return

        console.log('[Messages] WS connect:', selected)
        setOnlineUsers(new Set())

        connectToConversation(selected)

        const handler = (e) => {
            const { event, data } = e.detail

            if (event === 'pusher_internal:subscription_succeeded') {
                const users = new Set()
                Object.values(data?.presence?.hash || {}).forEach(u => {
                    const id = Number(u.id || u.user_info?.id)
                    if (id && id !== currentUserId) users.add(id)
                })
                setOnlineUsers(users)
            }

            if (event === 'pusher_internal:member_added') {
                const id = Number(data.user_id)
                if (id) setOnlineUsers(p => new Set([...p, id]))
            }

            if (event === 'pusher_internal:member_removed') {
                const id = Number(data.user_id)
                setOnlineUsers(p => {
                    const s = new Set(p)
                    s.delete(id)
                    return s
                })
            }

            if (event === 'message.sent') {
                const msg = mapMessage(data, currentUserId)
                if (!msg) return

                setMessages(p => {
                    if (p.some(m => m.id === msg.id)) return p
                    const updated = [...p, msg]
                    // Scroll to bottom when new message arrives
                    requestAnimationFrame(() => {
                        const el = messagesContainerRef.current
                        if (el) {
                            el.scrollTop = el.scrollHeight
                        }
                    })
                    return updated
                })
            }
        }

        window.addEventListener('ws-event', handler)

        return () => {
            window.removeEventListener('ws-event', handler)
            disconnect()
        }
    }, [selected, currentUserId])

    /* ================= UI ================= */

    useEffect(() => {
        const sync = () => setIsMobile(window.innerWidth < 1024)
        sync()
        window.addEventListener('resize', sync)
        return () => window.removeEventListener('resize', sync)
    }, [])

    // Notify Header component about thread state for mobile title display
    useEffect(() => {
        const event = new CustomEvent('messagesThreadState', {
            detail: { showThread: showThread && selected !== null }
        })
        window.dispatchEvent(event)

        return () => {
            const cleanupEvent = new CustomEvent('messagesThreadState', {
                detail: { showThread: false }
            })
            window.dispatchEvent(cleanupEvent)
        }
    }, [showThread, selected])

    const filteredChats = useMemo(() => {
        const q = search.toLowerCase()
        return q
            ? conversations.filter(c => c.other_user?.name?.toLowerCase().includes(q))
            : conversations
    }, [conversations, search])

    const selectedChat = useMemo(() => {
        return conversations.find(c => c.id === selected) ?? null
    }, [conversations, selected])

    async function handleSendMessage() {
        if (!messageText.trim() || sending) return
        const text = messageText.trim()
        setMessageText('')
        setSending(true)
        try {
            await sendMessage(selected, text)
            // Scroll to bottom after sending
            requestAnimationFrame(() => {
                const el = messagesContainerRef.current
                if (el) {
                    el.scrollTop = el.scrollHeight
                }
            })
        } catch (error) {
            setMessageText(text) // Restore text on error
            console.error('Error sending message:', error)
        } finally {
            setSending(false)
        }
    }

    /* ================= JSX (DEĞİŞMEDİ) ================= */

    return (
        <div className="mx-auto w-full max-w-[1480px] space-y-6">
            <div className={`grid grid-cols-1 gap-4 ${isMobile ? '' : 'lg:grid-cols-3'}`}>
                {/* Conversation list */}
                {!isMobile || !showThread ? (
                    <div className={`${isMobile ? '' : 'lg:col-span-1'} border-r border-white/10`}>
                        <div className="px-4 pt-4 pb-3 space-y-3">
                            {/* Search box */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 w-full rounded-full border border-white/12 bg-white/6 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40"
                                        placeholder="Kullanıcı adı ara..."
                                        autoFocus={showSearch}
                                    />
                                </div>
                            </div>
                            <div
                                ref={conversationsContainerRef}
                                className="space-y-0 min-h-[48vh] max-h-[56vh] overflow-y-auto rewora-scroll"
                            >
                                {loading && filteredChats.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-sm text-white/50">Yükleniyor...</div>
                                    </div>
                                ) : filteredChats.length === 0 ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <div className="text-sm text-white/50 mb-1">Konuşma bulunamadı</div>
                                            <div className="text-xs text-white/40">Henüz mesajlaşma yok</div>
                                        </div>
                                    </div>
                                ) : (
                                    filteredChats.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setSelected(c.id)
                                                setShowThread(true)
                                                setMessages([])
                                            }}
                                            className={`group flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition ${selected === c.id ? 'bg-white/8' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="relative h-11 w-11 rounded-full border border-white/10 bg-white/10 overflow-hidden shrink-0">
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
                                                    {/* Online indicator */}
                                                    {c.other_user?.id && onlineUsers.has(c.other_user.id) && (
                                                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0f0f0f]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <div className="truncate text-sm font-semibold text-white">
                                                            {c.other_user?.name ?? 'Kullanıcı'}
                                                        </div>
                                                        <div className="text-[11px] text-white/40 shrink-0">{c.last_message?.time ?? ''}</div>
                                                    </div>
                                                    <div className="truncate text-xs text-white/50">{c.last_message?.text ?? 'Mesaj yok'}</div>
                                                </div>
                                            </div>
                                            {c.unread_count > 0 && (
                                                <div className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[color:var(--gold)] px-2 text-[10px] font-semibold text-black shrink-0">
                                                    {c.unread_count > 99 ? '99+' : c.unread_count}
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                                {loadingMoreConversations && (
                                    <div className="text-center text-xs text-white/50 py-3">Yükleniyor...</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Chat window */}
                {(!isMobile || showThread) && (
                    <div className={`${isMobile ? '' : 'lg:col-span-2'} h-[70vh]`}>
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
                                                    <ChevronLeft size={18} />
                                                </button>
                                            )}
                                            <div className="relative h-10 w-10 rounded-full border border-white/10 bg-white/10 overflow-hidden shrink-0">
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
                                                {/* Online indicator */}
                                                {selectedChat.other_user?.id && onlineUsers.has(selectedChat.other_user.id) && (
                                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0f0f0f]" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    {selectedChat.other_user?.name ?? 'Kullanıcı'}
                                                </div>
                                                {selectedChat.other_user?.id && onlineUsers.has(selectedChat.other_user.id) ? (
                                                    <div className="text-xs text-emerald-400">Çevrimiçi</div>
                                                ) : (
                                                    <div className="text-xs text-white/50">Çevrimdışı</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        ref={messagesContainerRef}
                                        className="flex-1 overflow-y-auto px-4 py-4 rewora-scroll"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <div className="text-sm text-white/50">Mesajlar yükleniyor...</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {loadingMore && (
                                                    <div className="text-center text-xs text-white/40 py-2">Eski mesajlar yükleniyor...</div>
                                                )}
                                                {messages.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {messages.map((m, index) => (
                                                            <div
                                                                key={m.id ? `msg-${m.id}` : `msg-${index}-${m.text?.substring(0, 10)}`}
                                                                className={`flex ${m.from_me ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                <div
                                                                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${m.from_me
                                                                            ? 'bg-[color:var(--gold)] text-black rounded-br-sm'
                                                                            : 'bg-white/8 text-white rounded-bl-sm'
                                                                        }`}
                                                                >
                                                                    <div className="whitespace-pre-wrap">{m.text}</div>
                                                                    <div className={`mt-1.5 text-[10px] flex items-center justify-end gap-1 ${m.from_me ? 'text-black/50' : 'text-white/40'}`}>
                                                                        <span>{m.time}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div ref={messagesEndRef} />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="text-center">
                                                            <div className="text-sm text-white/50 mb-1">Henüz mesaj yok</div>
                                                            <div className="text-xs text-white/40">İlk mesajınızı gönderin</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="border-t border-white/10 px-4 py-3 bg-[color:var(--bg-1)]">
                                        <div className="flex items-end gap-2">
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
                                                className="h-11 flex-1 rounded-full border border-white/12 bg-white/6 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[color:var(--gold)]/40 disabled:opacity-50"
                                                placeholder="Mesaj yaz..."
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={sending || !messageText.trim()}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gold)] text-black hover:bg-[color:var(--gold-2)] disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                                                aria-label="Gönder"
                                            >
                                                <Send size={18} />
                                            </button>
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
                    </div>
                )}
            </div>
        </div>
    )
}
