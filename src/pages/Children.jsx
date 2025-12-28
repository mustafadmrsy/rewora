import React from 'react'
import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Children() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-1)]">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/8">
            <Shield className="h-8 w-8 text-[color:var(--gold)]" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Çocuk Güvenliği Standartları Politikası</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70">
            Rewora olarak, uygulamamızın yalnızca 18 yaş ve üzeri yetişkinler tarafından kullanılabilmesi için
            en yüksek güvenlik ve doğrulama standartlarını uyguluyoruz.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 rounded-3xl border border-white/12 bg-white/6 p-6 sm:p-8">
          {/* Genel Bilgiler */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">Uygulama Bilgileri</h2>
            <div className="space-y-2 text-sm text-white/80">
              <p><strong className="text-white">Uygulama Adı:</strong> Rewora</p>
              <p><strong className="text-white">Geliştirici:</strong> Rewora</p>
              <p><strong className="text-white">İletişim:</strong> info@rewora.com.tr</p>
              <p><strong className="text-white">Son Güncellenme:</strong> 27 Kasım 2025</p>
            </div>
          </section>

          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">1. Yaş Sınırlaması ve Kapsam</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Rewora yalnızca 18 yaş ve üzeri yetişkin kullanıcılar için tasarlanmış bir platformdur.
              Uygulamamız, içerik ve işlevsel özellikleri itibariyle çocukların kullanımına uygun değildir.
              18 yaş altı bireylerin uygulamayı kullanması kesinlikle yasaktır.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">2. Yaş Doğrulama Mekanizmaları</h3>
            <p className="text-sm leading-relaxed text-white/80">
              18 yaş altı kullanıcıların platforma girişini engellemek için birden fazla güvenlik mekanizması uygulanmaktadır:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li><strong className="text-white">Kayıt sırasında doğum tarihi doğrulaması</strong> yapılır.</li>
              <li>Kullanıcılar, kayıt ve giriş sırasında <strong className="text-white">18 yaşından büyük olduklarını beyan eder</strong>.</li>
              <li>Google Play Store'da uygulama <strong className="text-white">18+ yaş kısıtlaması</strong> ile yayınlanmıştır.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">3. Reşit Olmayan Kullanıcıların Tespiti ve Engellenmesi</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Rewora, yaş uygunluğu olmayan kullanıcıların tespiti için bir dizi koruma önlemi uygular:
            </p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Kullanıcı davranışları analiz edilerek şüpheli hesaplar tespit edilir.</li>
              <li>Topluluk üyeleri şüpheli kullanıcıları raporlayabilir.</li>
              <li>18 yaş altı olduğu doğrulanan hesaplar <strong className="text-white">derhal ve kalıcı olarak silinir</strong>.</li>
              <li>Gerek görülen durumlarda kimlik doğrulaması talep edilebilir.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">4. Veri Toplama ve Gizlilik</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Rewora yalnızca yetişkin kullanıcı verilerini işler. 18 yaş altına ait herhangi bir veri bilerek toplanmaz.
              Yanlışlıkla toplanan çocuk verileri derhal silinir.
            </p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li><strong className="text-white">Toplanan Veriler:</strong> e-posta, doğum tarihi, kullanıcı adı, profil bilgileri, uygulama içi etkinlik.</li>
              <li><strong className="text-white">Veri Güvenliği:</strong> Endüstri standartlarında şifreleme ve güvenlik protokolleri kullanılır.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">5. İçerik Standartları</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Platformdaki tüm içerikler yetişkinlere yöneliktir ve topluluk kurallarına sıkı şekilde uyulur.
            </p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>18 yaş altına uygun olmayan içeriklerin erişimi tamamen engellenmiştir.</li>
              <li>Topluluk kurallarını ihlal eden içerikler kaldırılır.</li>
              <li>Şiddet, nefret söylemi veya istismar barındıran içerikler yasaktır.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">6. Ebeveyn ve Veli Bildirimi</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Bir ebeveyn çocuğunun Rewora kullandığını fark ederse bizimle iletişime geçmelidir:
            </p>
            <p className="text-sm text-white/80"><strong className="text-white">E-posta:</strong> info@rewora.com.tr</p>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>Hesap anında askıya alınır.</li>
              <li>18 yaş altı doğrulanırsa hesap ve tüm veriler kalıcı olarak silinir.</li>
              <li>İşlem tamamlandığında veli bilgilendirilir.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">7. Üçüncü Taraf Hizmetleri ve Bağlantılar</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Rewora, üçüncü taraf entegrasyonlar içerebilir. Bu hizmetlerin kendi gizlilik ve yaş politikaları vardır.
              Rewora, entegrasyonların 18+ uygunluğuna dikkat eder ancak üçüncü taraf içeriklerinden sorumlu değildir.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">8. Yasal Uyumluluk</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li><strong className="text-white">COPPA:</strong> Uygulama 18+ olduğundan kapsam dışıdır.</li>
              <li><strong className="text-white">GDPR:</strong> AB kullanıcıları için veri koruma uyumludur.</li>
              <li><strong className="text-white">KVKK:</strong> Türkiye veri güvenliği standartlarına tam uyum sağlanmaktadır.</li>
              <li><strong className="text-white">Google Play Politikaları:</strong> Zorunlu yaş derecelendirme & içerik kurallarına uyumludur.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">9. Politika İhlalleri ve Yaptırımlar</h3>
            <ul className="ml-6 list-disc space-y-2 text-sm text-white/80">
              <li>18 yaş altı kullanıcıların hesapları derhal silinir.</li>
              <li>Cihaz ve IP engellemesi uygulanabilir.</li>
              <li>Yanlış yaş beyanı yapan kullanıcılar kalıcı olarak men edilebilir.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">10. Şikayet ve Bildirim Süreci</h3>
            <p className="text-sm text-white/80"><strong className="text-white">E-posta:</strong> info@rewora.com.tr</p>
            <p className="text-sm text-white/80"><strong className="text-white">Konu Başlığı:</strong> "Çocuk Güvenliği Bildirimi"</p>
            <p className="text-sm leading-relaxed text-white/80">
              Bildirimler 48 saat içinde değerlendirilir ve en geç 7 iş günü içinde aksiyon alınır.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">11. Sorumluluk Reddi</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Kullanıcıların yaş beyanlarının doğruluğundan kendileri sorumludur.
              Rewora, yaş doğrulama için tüm teknik ve idari güvenlik önlemlerini almaktadır.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">12. Politika Güncellemeleri</h3>
            <p className="text-sm leading-relaxed text-white/80">
              Politika düzenli olarak güncellenebilir ve önemli değişiklikler kullanıcılara uygulama içi bildirim ile duyurulur.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white">13. İletişim Bilgileri</h3>
            <div className="space-y-2 text-sm text-white/80">
              <p><strong className="text-white">Geliştirici:</strong> Rewora</p>
              <p><strong className="text-white">E-posta:</strong> info@rewora.com.tr</p>
              <p><strong className="text-white">Yanıt Süresi:</strong> 24–48 saat</p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-white/50">Son Revizyon Tarihi: 27 Kasım 2025 Perşembe</p>
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

