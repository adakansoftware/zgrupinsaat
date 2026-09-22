import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CTASection } from '@/components/cta-section'
import { PageHero } from '@/components/page-hero'
import { SiteFrame } from '@/components/site-frame'
import { findFleetBySlug, getFleetHref, listFleetItems } from '@/lib/fleet-service'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

type FleetDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const items = await listFleetItems()
  return items.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: FleetDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await findFleetBySlug(slug)

  if (!item) {
    return {}
  }

  return {
    title: {
      absolute: `${item.name} | Z GRUP İNŞAAT`,
    },
    description: item.description,
    alternates: {
      canonical: getCanonicalUrl(getFleetHref(item.slug)),
    },
    ...buildShareMetadata({
      title: `${item.name} | Z GRUP İNŞAAT`,
      description: item.description,
      pathname: getFleetHref(item.slug),
    }),
  }
}

export default async function FleetDetailPage({ params }: FleetDetailPageProps) {
  const { slug } = await params
  const [item, settings] = await Promise.all([findFleetBySlug(slug), getSiteSettings()])

  if (!item) {
    notFound()
  }

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title={item.name}
        description={item.description}
        image={item.image}
        primaryCta={{ href: '/contact', label: 'Teklif ve Keşif Talebi Oluşturun' }}
      />

      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-card p-8 lg:p-10">
              <div className="section-eyebrow mb-4">Filo Detayı</div>
              <h2 className="text-3xl font-black text-foreground sm:text-4xl">{item.detailTitle}</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">{item.detailDescription}</p>
            </div>

            <div className="glass-card p-8">
              <div className="section-eyebrow mb-4">Öne Çıkanlar</div>
              <div className="grid gap-3">
                {item.specs.map((spec) => (
                  <div key={spec} className="rounded-2xl border border-border/50 bg-card/60 px-4 py-4 text-sm font-medium text-foreground">
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <div className="section-eyebrow mb-3">Alt Kategoriler</div>
              <h3 className="text-2xl font-black text-foreground sm:text-3xl">Model ve kullanım kartları</h3>
            </div>

            <Link href="/fleet" className="text-sm font-bold text-primary transition-opacity hover:opacity-80">
              Filoya Geri Dön
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {item.models.map((model) => (
              <article key={model.name} className="overflow-hidden border border-border/40 bg-card">
                <div className="relative h-56">
                  <Image src={model.image ?? item.image} alt={`${model.name} - ${item.name}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute top-4 left-4 bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{model.quantity}</div>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-black text-foreground">{model.name}</h4>
                    <span className="bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{model.role}</span>
                  </div>
                  <p className="leading-7 text-muted-foreground">{model.details}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection settings={settings} />
    </SiteFrame>
  )
}
