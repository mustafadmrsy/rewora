import React, { useEffect, useRef, useState } from 'react'
import { MapPin, CheckCircle, QrCode, Copy, ChevronDown, ChevronUp, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Card from '../components/Card'
import { Button, Chip, GoldBadge } from '../components/ui'
import { listOffers, listUserOffers } from '../lib/rewardsApi'
import { listUserMissions } from '../lib/missionsApi'

function RewardHistoryCard({ userOffer }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showProductsDialog, setShowProductsDialog] = useState(false)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  const offer = userOffer?.offer ?? userOffer
  const code = userOffer?.code ?? ''
  const isUsed = userOffer?.used === true || userOffer?.used === 1
  const company = offer?.company
  const companySlug = company?.slug ?? ''
  const qrUrl = !isUsed && companySlug ? `https://qr.rewora.com.tr/${companySlug}` : null
  const qrCategories = offer?.qrCategories ?? offer?.qr_categories ?? []
  const products = userOffer?.products ?? null
  const discount = offer?.rate ?? offer?.discount ?? 0

  const handleCopyCode = async (e) => {
    e.stopPropagation()
    if (code) {
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleQrClick = (e) => {
    e.stopPropagation()
    if (qrUrl) {
      setShowQrDialog(true)
    }
  }

  const backgroundImage = offer?.company_image_url ?? offer?.image_url
  const logoUrl = offer?.logo_url

  return (
    <Card className="overflow-hidden">
      <div className="relative flex items-center justify-center overflow-hidden border-b border-white/10 bg-white/6 aspect-[16/9]">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
        )}

        {logoUrl && (
          <div className="relative z-10 flex items-center justify-center">
            <img
              src={logoUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm shadow-lg"
              loading="lazy"
            />
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-10">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            isUsed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/10 text-white border border-white/20'
          }`}>
            {isUsed ? 'Kupon kullanıldı' : 'Kullanılabilir'}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {code && (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-black/40 px-3 py-2 font-mono text-sm font-semibold text-white backdrop-blur-sm">
              {code}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95"
              aria-label="Kopyala"
            >
              {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
            </button>
            {isUsed ? (
              <button
                type="button"
                onClick={() => setShowProductsDialog(true)}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-[color:var(--gold)]/10 text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/20 active:scale-95"
                aria-label="Kullanılan Ürünleri Görüntüle"
              >
                <Eye size={24} />
              </button>
            ) : companySlug ? (
              <button
                type="button"
                onClick={handleQrClick}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/6 text-[color:var(--gold)] transition hover:bg-white/10 active:scale-95"
                aria-label="QR Menüyü Aç"
              >
                <QrCode size={24} />
              </button>
            ) : null}
          </div>
        )}

        {discount > 0 && (
          <div className="text-sm font-semibold text-white">
            %{discount} indirim!
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-white">{offer?.title ?? ''}</div>
            <div className="mt-1 text-sm text-white/55">{offer?.vendor ?? company?.name ?? ''}</div>
          </div>
        </div>

        {qrCategories.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <span>Menü ({qrCategories.length} kategori)</span>
              {showMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showMenu && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-white/6 p-3">
                {qrCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="text-xs font-semibold text-white/80">{category.name ?? ''}</div>
                    {category.products && Array.isArray(category.products) && category.products.length > 0 && (
                      <div className="space-y-1.5 pl-2">
                        {category.products.map((product) => (
                          <div key={product.id} className="flex items-start justify-between gap-2 text-xs">
                            <div className="flex-1 min-w-0">
                              <div className="text-white/90 font-medium">{product.name ?? ''}</div>
                              {product.description && (
                                <div className="mt-0.5 text-white/55 text-[11px] line-clamp-2">{product.description}</div>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              {product.old_price && (
                                <div className="text-white/40 line-through text-[11px]">{product.old_price}₺</div>
                              )}
                              <div className="font-semibold text-white">{product.price ?? 0}₺</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showQrDialog && qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowQrDialog(false)}>
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="text-lg font-semibold text-white">QR Menü</div>
              <button
                type="button"
                onClick={() => setShowQrDialog(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-6">
              <div className="rounded-xl bg-white p-4">
                <QRCodeSVG
                  value={qrUrl}
                  size={240}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowProductsDialog(false)}>
          <div className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="text-lg font-semibold text-white">Kullanılan Ürünler</div>
              <button
                type="button"
                onClick={() => setShowProductsDialog(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-6 rewora-scroll">
              {products && Array.isArray(products) && products.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {products.map((product, index) => {
                      const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price ?? 0)
                      const quantity = product.quantity ?? 1

                      return (
                        <div key={product.id ?? index} className="rounded-lg border border-white/10 bg-white/6 p-3">
                          <div className="flex items-start gap-3">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name ?? ''}
                                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                loading="lazy"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white">
                                {quantity > 1 ? `${product.name ?? ''} x${quantity}` : product.name ?? ''}
                              </div>
                              <div className="mt-2 text-sm font-semibold text-white/90">{price.toFixed(2)}₺</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {(() => {
                    const totalPrice = products.reduce((sum, product) => {
                      const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price ?? 0)
                      const quantity = product.quantity ?? 1
                      return sum + (price * quantity)
                    }, 0)
                    const discountedPrice = discount > 0 && discount <= 100 ? totalPrice * (1 - discount / 100) : null

                    return (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-base font-semibold text-white">Toplam</div>
                          <div className="text-base font-semibold text-white/60">{totalPrice.toFixed(2)}₺</div>
                        </div>
                        {discountedPrice && (
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-base font-semibold text-white">İndirimli</div>
                            <div className="text-base font-semibold text-[color:var(--gold)]">{discountedPrice.toFixed(2)}₺</div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/40">
                    <Eye size={32} />
                  </div>
                  <div className="text-sm text-white/55">Ürün bilgisi bulunmamaktadır</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function RewardCard({ item, type = 'offer' }) {
  const navigate = useNavigate()

  const isMission = type === 'mission'
  const mission = isMission ? item?.mission : null
  const displayItem = isMission ? mission : item

  if (!displayItem) return null

  const handleLocationClick = (e) => {
    e.stopPropagation()
    if (isMission) return

    const company = item?.company
    if (company?.latitude && company?.longitude) {
      const mapsUrl = `https://www.google.com/maps?q=${company.latitude},${company.longitude}`
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    } else if (company?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const statusText = isMission && item?.status === 'completed'
    ? 'Tamamlandı'
    : isMission && item?.status === 'approved'
      ? 'Onaylandı'
      : ''

  const backgroundImage = isMission
    ? displayItem?.image_url
    : item?.company_image_url ?? item?.image_url

  const logoUrl = isMission ? null : item?.logo_url

  const price = isMission ? displayItem?.coin ?? 0 : item?.price ?? 0

  const handleClick = () => {
    if (isMission) {
      navigate(`/gorevler/${displayItem?.id}`)
    } else {
      navigate(`/oduller/${item.id}`)
    }
  }

  return (
    <Card>
      <div className="p-5">
        <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/6 aspect-[16/8]">
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-white/10 via-white/0 to-white/10" />
          )}

          {logoUrl && (
            <div className="relative z-10 flex items-center justify-center">
              <img
                src={logoUrl}
                alt=""
                className="h-16 w-16 rounded-full object-cover border-2 border-white/20 bg-white/10 backdrop-blur-sm"
                loading="lazy"
              />
            </div>
          )}

          {!isMission && (
            <button
              onClick={handleLocationClick}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-[color:var(--gold)] backdrop-blur border border-white/10 hover:bg-black/60 transition"
              type="button"
              aria-label="Konumu göster"
            >
              <MapPin size={18} />
            </button>
          )}

          <GoldBadge className="absolute bottom-3 right-3 z-10">
            <span className="text-xs font-semibold">{price}</span>
            <span className="text-xs font-semibold">altın</span>
          </GoldBadge>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">{displayItem?.title ?? ''}</div>
            {isMission ? (
              <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
                {statusText && (
                  <>
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span>{statusText}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-1 text-sm text-white/55">{item?.vendor ?? ''}</div>
            )}
          </div>
          {!isMission && (
            <div className="shrink-0 rounded-full bg-white/8 px-3 py-1 text-sm text-white/80">
              %{item?.discount ?? 0} indirim!
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-white text-black font-bold border border-white/20 hover:bg-white/90 shadow-none"
            variant="primary"
            onClick={handleClick}
            type="button"
          >
            {isMission ? 'Detayları Gör' : 'İncele'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function Rewards() {
  const [tab, setTab] = useState('oduller')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [user, setUser] = useState(null)

  // Offers pagination state
  const [offersNextPageUrl, setOffersNextPageUrl] = useState(null)
  const [isLoadingMoreOffers, setIsLoadingMoreOffers] = useState(false)

  // History pagination state
  const [historyNextPageUrl, setHistoryNextPageUrl] = useState(null)
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false)

  const offersScrollRef = useRef(null)
  const historyScrollRef = useRef(null)

  // Initial load
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [offersRes, userOffersRes] = await Promise.all([
          listOffers(),
          listUserOffers()
        ])
        if (cancelled) return

        setItems(offersRes.offers ?? [])
        setOffersNextPageUrl(offersRes.nextPageUrl)

        setHistory(userOffersRes.userOffers ?? [])
        setHistoryNextPageUrl(userOffersRes.nextPageUrl)

        setUser(userOffersRes.user ?? offersRes.user ?? null)
      } catch (error) {
        console.error('Load error:', error)
        if (cancelled) return
        setItems([])
        setHistory([])
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Infinite scroll for offers
  useEffect(() => {
    const scrollContainer = offersScrollRef.current
    if (!scrollContainer) return

    async function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - 200

      if (isNearEnd && offersNextPageUrl && !isLoadingMoreOffers) {
        setIsLoadingMoreOffers(true)
        try {
          const offersRes = await listOffers(offersNextPageUrl)
          setItems(prev => [...prev, ...(offersRes.offers ?? [])])
          setOffersNextPageUrl(offersRes.nextPageUrl)
        } catch (error) {
          console.error('Load more offers error:', error)
        } finally {
          setIsLoadingMoreOffers(false)
        }
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [offersNextPageUrl, isLoadingMoreOffers])

  // Infinite scroll for history
  useEffect(() => {
    const scrollContainer = historyScrollRef.current
    if (!scrollContainer) return

    async function handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearEnd = scrollTop + clientHeight >= scrollHeight - 200

      if (isNearEnd && historyNextPageUrl && !isLoadingMoreHistory) {
        setIsLoadingMoreHistory(true)
        try {
          const userOffersRes = await listUserOffers(historyNextPageUrl)
          setHistory(prev => [...prev, ...(userOffersRes.userOffers ?? [])])
          setHistoryNextPageUrl(userOffersRes.nextPageUrl)
        } catch (error) {
          console.error('Load more history error:', error)
        } finally {
          setIsLoadingMoreHistory(false)
        }
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [historyNextPageUrl, isLoadingMoreHistory])

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6 mt-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-white">
            Ödüller
          </div>
          <div className="mt-1 text-sm text-white/55">
            Coinlerini partner ödüllerde kullan.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Chip active={tab === 'oduller'} onClick={() => setTab('oduller')}>
          Ödüller
        </Chip>
        <Chip active={tab === 'gecmis'} onClick={() => setTab('gecmis')}>
          Ödül Geçmişim
        </Chip>
      </div>

      {tab === 'gecmis' ? (
        <div className="space-y-4">
          {loading ? (
            <Card>
              <div className="p-6 text-sm text-white/55">Yükleniyor...</div>
            </Card>
          ) : history.length > 0 ? (
            <div
              ref={historyScrollRef}
              className="overflow-y-auto rewora-scroll"
              style={{ maxHeight: 'calc(100vh - 250px)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
                {history.map((uo) => (
                  <RewardHistoryCard key={uo.id} userOffer={uo} />
                ))}
              </div>
              {isLoadingMoreHistory && (
                <div className="flex justify-center py-6">
                  <div className="text-sm text-white/55">Daha fazla yükleniyor...</div>
                </div>
              )}
              {!historyNextPageUrl && history.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="text-xs text-white/40">Tüm ödüller gösterildi</div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <div className="p-6 text-sm text-white/55">Henüz ödül geçmişiniz bulunmuyor.</div>
            </Card>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <Card>
              <div className="p-6 text-sm text-white/55">Yükleniyor...</div>
            </Card>
          ) : items.length > 0 ? (
            <div
              ref={offersScrollRef}
              className="overflow-y-auto rewora-scroll"
              style={{ maxHeight: 'calc(100vh - 250px)' }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                {items.map((it) => (
                  <RewardCard key={it.id} item={it} />
                ))}
              </div>
              {isLoadingMoreOffers && (
                <div className="flex justify-center py-6">
                  <div className="text-sm text-white/55">Daha fazla yükleniyor...</div>
                </div>
              )}
              {!offersNextPageUrl && items.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="text-xs text-white/40">Tüm ödüller gösterildi</div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <div className="p-6 text-sm text-white/55">Ödül bulunamadı.</div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
