import type { Metadata } from 'next'
import { CTASection } from '@/components/cta-section'
import { FleetSection } from '@/components/fleet-section'
import { PageHero } from '@/components/page-hero'
import { SiteFrame } from '@/components/site-frame'
import { WhyUsSection } from '@/components/why-us-section'
import { getFleetContent } from '@/lib/fleet-service'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: {
    absolute: 'İş Makinesi ve Araç Filosu | Z GRUP İNŞAAT',
  },
  description: 'Z GRUP İNŞAAT’ın ekskavatör, beko loder, silindir, damperli kamyon, lowbed ve arazöz gibi iş makinesi ve araç filosunu inceleyin.',
  alternates: {
    canonical: getCanonicalUrl('/fleet'),
  },
  ...buildShareMetadata({
    title: 'İş Makinesi ve Araç Filosu | Z GRUP İNŞAAT',
    description: 'Z GRUP İNŞAAT’ın ekskavatör, beko loder, silindir, damperli kamyon, lowbed ve arazöz gibi iş makinesi ve araç filosunu inceleyin.',
    pathname: '/fleet',
  }),
}

export default async function FleetPage() {
  const [settings, fleetContent] = await Promise.all([getSiteSettings(), getFleetContent()])

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title="Saha ihtiyacına göre kurulan makine ve araç gücü"
        description="Ekskavatör, beko loder, silindir, damperli kamyon, lowbed ve arazöz / su tankeri desteğiyle kazı, yükleme, taşıma ve saha düzenleme işlerini tek operasyon planında ele alıyoruz."
        image="/images/dump-truck.jpg"
        primaryCta={{ href: '/services', label: 'Hizmet Kapsamını Görün' }}
      />
      <FleetSection items={fleetContent.items} stats={fleetContent.stats} />
      <WhyUsSection />
      <CTASection settings={settings} />
    </SiteFrame>
  )
}
