import React from 'react'
import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-1)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/8">
            <Shield className="h-8 w-8 text-[color:var(--gold)]" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Gizlilik Politikası</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            Rewora, kullanıcılarının kişisel verilerinin gizliliğini ve güvenliğini korumayı taahhüt eder.
            Bu politika, verilerin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 rounded-3xl border border-white/12 bg-white/6 p-6 sm:p-8">
          {/* Genel Bilgiler */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">Uygulama Bilgileri</h2>
            <div className="space-y-2 text-sm text-white/80">
              <p><strong className="text-white">Uygulama Adı:</strong> Rewora</p>
              <p><strong className="text-white">İletişim:</strong> info@rewora.com.tr</p>
              <p><strong className="text-white">Yürürlük Tarihi:</strong> Eylül 2025</p>
            </div>
          </section>

          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">1. Kapsam ve Tanımlar</h3>
            <p className="text-sm leading-relaxed text-white/80">
              İşbu Gizlilik Politikası, REWORA markası tarafından yönetilen Rewora
              Uygulaması kapsamında toplanan kişisel verilerin işlenmesine ilişkindir.
            </p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li><strong className="text-white">Kişisel Veri:</strong> Ad, soyad, e-posta, telefon, IP adresi, cihaz bilgileri.</li>
              <li><strong className="text-white">Anonim Veri:</strong> Kimliği belirlenemeyecek hale getirilmiş veriler.</li>
              <li><strong className="text-white">Hizmet:</strong> Uygulama üzerinden sunulan tüm özellikler.</li>
              <li><strong className="text-white">Üye İş Yeri:</strong> Kullanıcılara ödül ve indirim sunan işletmeler.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">2. Toplanan Veriler ve Toplanma Yöntemleri</h3>
            
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-white">2.1 Kullanıcı Tarafından Sağlanan Veriler</h4>
              <ul className="ml-6 list-disc space-y-1 text-sm text-white/80">
                <li>Hesap bilgileri (ad, soyad, e-posta, telefon, doğum tarihi, profil fotoğrafı)</li>
                <li>Ödül ve indirim kullanımı geçmişi</li>
                <li>Müşteri destek talepleri</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-semibold text-white">2.2 Otomatik Olarak Toplanan Veriler</h4>
              <ul className="ml-6 list-disc space-y-1 text-sm text-white/80">
                <li>Cihaz ve tarayıcı bilgileri</li>
                <li>Konum verileri (kullanıcı izni dahilinde)</li>
                <li>Kullanım ve oturum verileri</li>
                <li>IP adresi ve log kayıtları</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-semibold text-white">2.3 Üçüncü Taraflardan Elde Edilen Veriler</h4>
              <p className="text-sm leading-relaxed text-white/80">
                Ödeme, doğrulama ve teknik hizmet sağlayıcılar aracılığıyla sınırlı ek bilgiler elde edilebilir.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">3. Kişisel Verilerin İşlenme Amaçları</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Hesap oluşturma ve uygulama erişimi sağlamak</li>
              <li>Ödül ve indirim süreçlerini yürütmek</li>
              <li>Kullanıcı destek taleplerini yanıtlamak</li>
              <li>Uygulama deneyimini kişiselleştirmek</li>
              <li>Dolandırıcılık ve kötüye kullanımı önlemek</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">4. Kişisel Verilerin Paylaşılması</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li><strong className="text-white">Üye İş Yerleri:</strong> Ödül ve indirimlerin kullanılabilmesi için</li>
              <li><strong className="text-white">Hizmet Sağlayıcılar:</strong> Teknik ve operasyonel hizmetler</li>
              <li><strong className="text-white">Kamu Kurumları:</strong> Yasal zorunluluklar kapsamında</li>
              <li><strong className="text-white">İş Ortakları:</strong> Kampanya ve promosyon süreçleri için</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">5. Çerezler ve Takip Teknolojileri</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Kullanıcı tercihlerini hatırlamak</li>
              <li>Performans ve analiz sağlamak</li>
              <li>Kişiselleştirilmiş içerik sunmak</li>
              <li>Pazarlama ve reklam analizi yapmak</li>
            </ul>
            <p className="text-sm leading-relaxed text-white/80">
              Kullanıcılar, cihaz ayarları üzerinden çerezleri devre dışı bırakabilir.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">6. Veri Güvenliği</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Şifreleme ve güvenlik protokolleri</li>
              <li>Erişim kontrol sistemleri</li>
              <li>Yetkisiz veri paylaşımının önlenmesi</li>
            </ul>
            <p className="text-sm leading-relaxed text-white/80">
              İnternet üzerinden yapılan veri iletiminin tamamen güvenli olduğu garanti edilemez.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">7. Kullanıcı Hakları</h3>
            <p className="text-sm leading-relaxed text-white/80">KVKK'nın 11. maddesi uyarınca kullanıcılar:</p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Verilerinin işlenip işlenmediğini öğrenebilir</li>
              <li>Verilere erişim ve düzeltme talep edebilir</li>
              <li>Silme ve yok etme talebinde bulunabilir</li>
              <li>Hukuka aykırı işleme halinde tazminat isteyebilir</li>
            </ul>
            <p className="text-sm text-white/80"><strong className="text-white">İletişim:</strong> one@rewora.com.tr</p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">8. Politika Değişiklikleri</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Gizlilik Politikası güncellenebilir. Güncellemeler uygulama içinde yayınlandığı tarihte yürürlüğe girer.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/50">Son Revizyon Tarihi: Eylül 2025</p>
            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

