import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserX, X } from 'lucide-react'
import { listBlockedUsers, unblockUser } from '../lib/blocksApi'
import Card from '../components/Card'
import { Button } from '../components/ui'

export default function BlockedUsers() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [unblockingId, setUnblockingId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await listBlockedUsers(1)
        if (cancelled) return
        setBlockedUsers(res.blockedUsers ?? [])
        setNextPageUrl(res.nextPageUrl)
      } catch (error) {
        console.error('Load blocked users error:', error)
        if (cancelled) return
        setBlockedUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Infinite scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    async function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - 200

      if (isNearEnd && nextPageUrl && !isLoadingMore) {
        setIsLoadingMore(true)
        try {
          const res = await listBlockedUsers(nextPageUrl)
          setBlockedUsers(prev => [...prev, ...(res.blockedUsers ?? [])])
          setNextPageUrl(res.nextPageUrl)
        } catch (error) {
          console.error('Load more blocked users error:', error)
        } finally {
          setIsLoadingMore(false)
        }
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [nextPageUrl, isLoadingMore])

  const handleUnblock = async (blockedId) => {
    if (unblockingId) return
    setUnblockingId(blockedId)
    try {
      await unblockUser(blockedId)
      setBlockedUsers(prev => prev.filter(user => user.id !== blockedId))
    } catch (error) {
      console.error('Unblock user error:', error)
      const errorMessage = error.data?.message ?? error.message ?? 'Engelleme kaldırılamadı.'
      alert(errorMessage)
    } finally {
      setUnblockingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[520px] lg:max-w-[920px] space-y-6 p-4">
      <Card>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Engellenen Kullanıcılar</h2>
            <p className="mt-2 text-sm text-white/60">Engellediğiniz kullanıcıları buradan yönetebilirsiniz.</p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-white/55">Yükleniyor...</div>
          ) : blockedUsers.length > 0 ? (
            <div
              ref={scrollRef}
              className="overflow-y-auto rewora-scroll space-y-3"
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/6 p-4"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/profil/${user.id}`)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/8">
                      {user.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/15 to-white/0" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnblock(user.id)}
                    disabled={unblockingId === user.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {unblockingId === user.id ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                        Kaldırılıyor...
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Engeli Kaldır
                      </>
                    )}
                  </button>
                </div>
              ))}
              {isLoadingMore && (
                <div className="py-4 text-center text-sm text-white/55">Daha fazla yükleniyor...</div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/40 mb-4">
                <UserX size={32} />
              </div>
              <div className="text-sm font-semibold text-white/80">Engellenen kullanıcı bulunmuyor</div>
              <div className="mt-2 text-xs text-white/50">Henüz hiçbir kullanıcıyı engellemediniz.</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

