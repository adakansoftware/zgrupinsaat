import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CTASection } from '@/components/cta-section'
import { PageHero } from '@/components/page-hero'
import { SiteFrame } from '@/components/site-frame'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { findServiceBySlug, getServiceHref, serviceDetails } from '@/lib/services-data'
import { getSiteSettings } from '@/lib/settings-service'

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return serviceDetails.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const service = findServiceBySlug(slug)

  if (!service) {
    return {}
  }

  return {
    title: {
      absolute: `${service.title} | Z GRUP İNŞAAT`,
    },
    description: service.metaDescription,
    alternates: {
      canonical: getCanonicalUrl(getServiceHref(service.slug)),
    },
    ...buildShareMetadata({
      title: `${service.title} | Z GRUP İNŞAAT`,
      description: service.metaDescription,
      pathname: getServiceHref(service.slug),
    }),
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params
  const service = findServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const settings = await getSiteSettings()

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title={service.title}
        description={service.description}
        image={service.image}
        primaryCta={{ href: '/contact', label: 'Teklif ve Keşif Talebi Oluşturun' }}
      />

      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Operasyon başlığı', value: `${service.highlights.length}+` },
              { label: 'Kullanım senaryosu', value: `${service.useCases.length}+` },
              { label: 'İşleyiş adımı', value: `${service.process.length}+` },
            ].map((item) => (
              <div key={item.label} className="border border-border/40 bg-card/70 p-6">
                <div className="text-3xl font-black text-primary">{item.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="glass-card p-8 lg:p-10">
                <div className="section-eyebrow mb-4">Hizmet Detayı</div>
                <h2 className="text-3xl font-black text-foreground sm:text-4xl">{service.title}</h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">{service.description}</p>
                <p className="mt-6 text-base leading-8 text-muted-foreground">{service.scope}</p>
                <p className="mt-6 text-base leading-8 text-muted-foreground">
                  Sahadaki erişim koşulları, günlük iş programı, makine-kamyon dengesi ve teslim temposu birlikte değerlendirilerek
                  uygulamaya uygun çalışma planı oluşturulur.
                </p>
              </div>

              <div className="glass-card p-8 lg:p-10">
                <div className="section-eyebrow mb-4">Bu Hizmet Nerelerde Tercih Edilir?</div>
                <div className="grid gap-4 md:grid-cols-3">
                  {service.useCases.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/50 bg-card/60 p-5">
                      <div className="text-sm font-semibold leading-6 text-foreground">{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 lg:p-10">
                <div className="section-eyebrow mb-4">İşleyiş Adımları</div>
                <div className="grid gap-4">
                  {service.process.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-2xl border border-border/50 bg-card/60 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 lg:p-10">
                <div className="section-eyebrow mb-4">Operasyon Çerçevesi</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {service.planningPoints.map((point) => (
                    <div key={point} className="rounded-2xl border border-border/50 bg-card/60 p-5">
                      <div className="text-sm leading-7 font-medium text-foreground">{point}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 lg:p-10">
                <div className="section-eyebrow mb-4">Bu Hizmette Neyi Netleştiriyoruz?</div>
                <div className="grid gap-4">
                  {service.deliverables.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/50 bg-card/60 px-5 py-4 text-sm leading-7 text-muted-foreground">
                      <span className="font-semibold text-foreground">• </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-8">
                <div className="section-eyebrow mb-4">Operasyon Başlıkları</div>
                <div className="grid gap-3">
                  {service.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-border/50 bg-card/60 px-4 py-4 text-sm font-medium text-foreground">
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8">
                <div className="section-eyebrow mb-4">İşleyiş</div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Lokasyon, metraj, malzeme türü ve çalışma takvimi paylaşıldıktan sonra doğru ekipman, sevkiyat düzeni ve günlük saha
                  akışı netleştirilir.
                </p>
              </div>

              <div className="glass-card p-8">
                <div className="section-eyebrow mb-4">Neden Bu Yaklaşım?</div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Plansız başlayan hafriyat ve nakliyat işleri çoğu zaman kamyon beklemesi, eksik ekipman yönlendirmesi veya sahada tekrar
                  eden işlere neden olur. Daha kapsamlı planlama yaklaşımımız, işin başında doğru kurguyu oluşturarak uygulama sırasında
                  daha kontrollü ilerleme sağlar.
                </p>
              </div>

              <div className="glass-card p-8">
                <div className="section-eyebrow mb-4">Teklifi Hızlandıran Bilgiler</div>
                <div className="space-y-3">
                  {[
                    'İşin yapılacağı konum veya saha bilgisi',
                    'Yaklaşık metraj, derinlik veya taşınacak hacim',
                    'Malzeme tipi ve sahadan çıkış ihtiyacı',
                    'Başlangıç tarihi ve günlük çalışma hedefi',
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-border/50 bg-card/60 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-card p-8 lg:p-10">
              <div className="section-eyebrow mb-4">Saha Yaklaşımımız</div>
              <h3 className="text-2xl font-black text-foreground">İşi yalnızca başlatmaya değil, düzenli ilerletmeye odaklanıyoruz</h3>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                Birçok hafriyat ve nakliyat işinde sorun, işin zorluğundan çok planın yetersiz kurulmasından doğar. Bu nedenle ekipmanı
                sahaya göndermeden önce erişim, yükleme, sevkiyat ve günlük çalışma ritmini birlikte ele alıyoruz.
              </p>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                Böylece iş başladıktan sonra ortaya çıkan karışıklıklar azalır; saha ekibi, makine ve kamyon akışı daha öngörülebilir hale gelir.
                Özellikle teslim tarihi baskısı olan şantiyelerde bu yaklaşım günlük üretimi doğrudan destekler.
              </p>
            </div>

            <div className="glass-card p-8 lg:p-10">
              <div className="section-eyebrow mb-4">Sık Sorulan Sorular</div>
              <Accordion type="single" collapsible className="w-full">
                {service.faq.map((item, index) => (
                  <AccordionItem key={item.question} value={`item-${index}`} className="border-border/40">
                    <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <CTASection settings={settings} />
    </SiteFrame>
  )
}
