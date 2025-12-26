import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Menu, Search, CircleDollarSign } from 'lucide-react'
import { GoldBadge } from '../components/ui'
import { useNavigate, useParams } from 'react-router-dom'

const ownProfile = {
  id: 'me',
  name: 'Mustafa Demirsoy',
  gold: 0,
  posts: 0,
}

const usersById = {
  me: ownProfile,
  u1: { id: 'u1', name: 'Zeynep', gold: 120, posts: 3 },
  u2: { id: 'u2', name: 'Berk', gold: 40, posts: 1 },
  u3: { id: 'u3', name: 'Merve', gold: 80, posts: 0 },
  u4: { id: 'u4', name: 'Ahmet', gold: 15, posts: 2 },
  u5: { id: 'u5', name: 'Ece', gold: 60, posts: 5 },
}

const initialFollowers = [
  { id: 'u1', name: 'Zeynep', subtitle: 'Aktif' },
  { id: 'u2', name: 'Berk', subtitle: 'Yeni' },
  { id: 'u5', name: 'Ece', subtitle: 'Aktif' },
]

const initialFollowing = [
  { id: 'u3', name: 'Merve', subtitle: 'Arkadaş' },
  { id: 'u4', name: 'Ahmet', subtitle: 'İş' },
]

const postsByUserId = {
  me: [
    { id: 'p1', title: 'Görev tamamlandı', color: 'bg-emerald-400/15' },
    { id: 'p2', title: 'Ödül alındı', color: 'bg-[color:var(--gold)]/15' },
    { id: 'p3', title: 'Yeni hedef', color: 'bg-sky-400/15' },
    { id: 'p4', title: 'Haftalık seri', color: 'bg-purple-400/15' },
    { id: 'p5', title: 'Kısa görev', color: 'bg-rose-400/15' },
    { id: 'p6', title: 'Günlük plan', color: 'bg-white/10' },
  ],
  u1: [
    { id: 'p7', title: 'Koşu', color: 'bg-emerald-400/15' },
    { id: 'p8', title: 'Kafe', color: 'bg-[color:var(--gold)]/15' },
    { id: 'p9', title: 'Notlar', color: 'bg-white/10' },
  ],
  u2: [{ id: 'p10', title: 'Bugün', color: 'bg-sky-400/15' }],
  u3: [],
  u4: [
    { id: 'p11', title: 'Ofis', color: 'bg-white/10' },
    { id: 'p12', title: 'Toplantı', color: 'bg-purple-400/15' },
  ],
  u5: [
    { id: 'p13', title: 'Yeni görev', color: 'bg-rose-400/15' },
    { id: 'p14', title: 'Ödül', color: 'bg-[color:var(--gold)]/15' },
    { id: 'p15', title: 'Liste', color: 'bg-white/10' },
    { id: 'p16', title: 'Plan', color: 'bg-sky-400/15' },
    { id: 'p17', title: 'Seri', color: 'bg-emerald-400/15' },
  ],
}

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isOwn = !id || id === 'me'

  const profile = useMemo(() => {
    if (!id) return ownProfile
    return usersById[id] ?? { id, name: 'Kullanıcı', gold: 0, posts: 0 }
  }, [id])

  const posts = useMemo(() => {
    return postsByUserId[profile.id] ?? []
  }, [profile.id])

  const [followers, setFollowers] = useState(initialFollowers)
  const [following, setFollowing] = useState(initialFollowing)
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const modalPanelRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setModal(null)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const followersCount = isOwn ? followers.length : 0
  const followingCount = isOwn ? following.length : 0

  function openList(kind) {
    if (!isOwn) return
    setModal(kind)
  }

  function onUserClick(userId) {
    setModal(null)
    navigate(`/profil/${userId}`)
  }

  function removeFromFollowers(userId) {
    setFollowers((prev) => prev.filter((u) => u.id !== userId))
  }

  function removeFromFollowing(userId) {
    setFollowing((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <div className="mx-auto w-full max-w-[520px] lg:max-w-[920px]">
      <div className="relative flex items-center justify-center py-2">
        <div className="text-xl font-semibold tracking-tight text-white">Profil</div>
        <button
          type="button"
          className="absolute right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
          aria-label="Menü"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-[92px] w-[92px] rounded-full border-2 border-[color:var(--gold)] bg-white/8" />
          <div className="absolute inset-[10px] rounded-full bg-white/10" />
        </div>

        <div className="flex flex-1 items-center justify-center gap-4">
          <div className="min-w-[64px] text-center">
            <div className="text-lg font-semibold text-white">{posts.length}</div>
            <div className="text-xs text-white/60">Post</div>
          </div>
          <button
            type="button"
            className="min-w-[64px] text-center cursor-pointer"
            onClick={() => openList('followers')}
          >
            <div className="text-lg font-semibold text-white">{followersCount}</div>
            <div className="text-xs text-white/60">Takipçi</div>
          </button>
          <button
            type="button"
            className="min-w-[64px] text-center cursor-pointer"
            onClick={() => openList('following')}
          >
            <div className="text-lg font-semibold text-white">{followingCount}</div>
            <div className="text-xs text-white/60">Takip</div>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold text-white">{profile.name}</div>
        <GoldBadge className="mt-2 w-fit">
          <CircleDollarSign size={16} />
          <span className="text-sm font-semibold">{profile.gold} altın</span>
        </GoldBadge>
      </div>

      {posts.length > 0 ? (
        <div className="mt-7">
          <div className="grid grid-cols-3 gap-[6px]">
            {posts.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`relative aspect-square w-full overflow-hidden rounded-[10px] border border-white/10 ${p.color} hover:border-white/20 cursor-pointer`}
                aria-label={p.title}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(214,255,0,0.10),transparent_55%)]" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-14 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border border-white/10 bg-white/6" />
            <div className="absolute inset-0 grid place-items-center text-white/55">
              <Search size={28} />
            </div>
          </div>
          <div className="mt-4 text-sm text-white/50">Henüz gönderi bulunmamaktadır.</div>
        </div>
      )}

      {modal ? (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          onPointerDown={() => setModal(null)}
          onClick={() => setModal(null)}
        >
          <div
            className="mx-auto flex h-full w-full max-w-[520px] items-center p-3"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={modalPanelRef}
              className="w-full rounded-[22px] border border-white/12 bg-[color:var(--bg-1)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  {modal === 'followers' ? 'Takipçiler' : 'Takip'}
                </div>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="inline-flex h-9 px-3 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 text-xs"
                >
                  Kapat
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto rewora-scroll pr-1">
                {(modal === 'followers' ? followers : following).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-white/6 px-3 py-3"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                      onClick={() => onUserClick(u.id)}
                    >
                      <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{u.name}</div>
                        <div className="truncate text-xs text-white/55">{u.subtitle}</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/6 px-3 text-xs font-semibold text-white/85 hover:bg-white/10 cursor-pointer"
                      onClick={() => {
                        if (modal === 'followers') removeFromFollowers(u.id)
                        else removeFromFollowing(u.id)
                      }}
                    >
                      {modal === 'followers' ? 'Çıkar' : 'Takibi bırak'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-[color:var(--bg-1)]"
          onPointerDown={() => setMenuOpen(false)}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="mx-auto h-full w-full max-w-[520px] lg:max-w-[920px]"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center px-4 py-3">
              <button
                type="button"
                className="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 hover:bg-white/10 cursor-pointer"
                aria-label="Geri"
                onClick={() => setMenuOpen(false)}
              >
                <ArrowLeft size={18} />
              </button>
              <div className="text-lg font-semibold text-white">Menü</div>
            </div>

            <div className="px-4 pb-6 pt-6 lg:pt-2">
              <div className="space-y-3">
                {isOwn ? (
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  >
                    <div className="text-sm font-semibold text-white">Profili Düzenle</div>
                    <ChevronRight size={18} className="text-white/60" />
                  </button>
                ) : null}

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/oduller')
                  }}
                >
                  <div className="text-sm font-semibold text-white">Ödül Geçmişim</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/gorevler')
                  }}
                >
                  <div className="text-sm font-semibold text-white">Görev Geçmişim</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Güvenlik</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Engellenen Kullanıcılar</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <div className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4">
                  <div className="text-sm font-semibold text-white">Bildirimler</div>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled((v) => !v)}
                    className={`relative h-7 w-12 rounded-full border border-white/10 transition cursor-pointer ${
                      notificationsEnabled ? 'bg-emerald-500/90' : 'bg-white/12'
                    }`}
                    aria-label="Bildirimleri aç/kapat"
                  >
                    <span
                      className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition ${
                        notificationsEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Gizlilik Politikası</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Kullanıcı Sözleşmesi</div>
                  <ChevronRight size={18} className="text-white/60" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Hesabımı Sil</div>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-[16px] border border-white/10 bg-white/6 px-4 py-4 text-left hover:bg-white/8 cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white">Çıkış yap</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
