import type { Metadata } from 'next'
import { SiteFrame } from '@/components/site-frame'
import { getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'İletişim ve teklif formları kapsamında işlenen kişisel verilere ilişkin aydınlatma metni.',
  alternates: {
    canonical: getCanonicalUrl('/kvkk-aydinlatma-metni'),
  },
  openGraph: {
    url: getCanonicalUrl('/kvkk-aydinlatma-metni'),
  },
}

export default async function KvkkPage() {
  const settings = await getSiteSettings()

  return (
    <SiteFrame settings={settings}>
      <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="relative z-10 mx-auto max-w-[1000px] px-6 lg:px-8">
          <div className="glass-card p-8 md:p-10 lg:p-12">
            <div className="section-eyebrow mb-4">KVKK</div>
            <h1 className="font-display text-4xl text-foreground md:text-5xl">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
            <div className="mt-8 space-y-8 text-sm leading-8 text-foreground/72 md:text-base">
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla{' '}
                <span className="font-semibold text-foreground">{settings.companyName || 'Z GRUP İNŞAAT'}</span> tarafından işlenebilecektir.
              </p>

              <div>
                <h2 className="text-lg font-semibold text-foreground">İşlenen veriler</h2>
                <p className="mt-2">Ad-soyad, telefon, e-posta, firma adı, mesaj/talep içeriği ve işlem güvenliği verileri.</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">İşleme amaçları</h2>
                <p className="mt-2">
                  İletişim taleplerinin alınması ve cevaplanması, teklif/hizmet taleplerinin değerlendirilmesi, müşteri ilişkileri süreçlerinin
                  yürütülmesi, bilgi güvenliği süreçlerinin yürütülmesi, hukuki yükümlülüklerin yerine getirilmesi ve olası uyuşmazlıklarda ispat
                  süreçlerinin yürütülmesi.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Toplama yöntemi ve hukuki sebep</h2>
                <p className="mt-2">
                  Veriler; internet sitesi formları ve elektronik iletişim kanalları üzerinden elektronik ortamda toplanır. KVKK m.5 kapsamında
                  sözleşmenin kurulması/ifası, hukuki yükümlülüklerin yerine getirilmesi, bir hakkın tesisi/kullanılması/korunması ve veri
                  sorumlusunun meşru menfaati hukuki sebeplerine dayanılarak işlenebilir.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Aktarım</h2>
                <p className="mt-2">
                  Kişisel veriler, mevzuata uygun olarak yetkili kamu kurum ve kuruluşlarına, hukuken yetkili mercilere, teknik hizmet alınan
                  tedarikçilere ve iş süreçleri kapsamında hizmet alınan iş ortaklarına aktarılabilir.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Saklama</h2>
                <p className="mt-2">
                  Kişisel veriler, işleme amacının gerektirdiği süre ve ilgili mevzuattaki saklama süreleri boyunca muhafaza edilir; sonrasında
                  silinir, yok edilir veya anonim hale getirilir.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Haklar</h2>
                <p className="mt-2">
                  İlgili kişi, KVKK m.11 kapsamındaki haklarını kullanabilir; verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme,
                  düzeltme, silme/yok etme, aktarılan üçüncü kişileri öğrenme, otomatik analiz sonucuna itiraz etme ve zararın giderilmesini talep
                  etme haklarına sahiptir.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground">Başvuru</h2>
                <p className="mt-2">
                  Başvurular{' '}
                  <a href={`mailto:${settings.contactEmail}`} className="text-foreground underline decoration-foreground/25 underline-offset-4 transition hover:decoration-foreground">
                    {settings.contactEmail}
                  </a>{' '}
                  ve/veya <span className="font-medium text-foreground">{settings.address}</span> üzerinden yapılabilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
