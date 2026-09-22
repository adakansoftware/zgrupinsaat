import type { Metadata } from 'next'
import { CTASection } from '@/components/cta-section'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { Navbar } from '@/components/navbar'
import { ProjectsSection } from '@/components/projects-section'
import { ServicesSection } from '@/components/services-section'
import { StatsSection } from '@/components/stats-section'
import { WhyUsSection } from '@/components/why-us-section'
import { listPublishedProjects } from '@/lib/project-service'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: {
    absolute: 'Z GRUP İNŞAAT | Hafriyat, Temel Kazısı ve İş Makinesi Hizmetleri',
  },
  description: 'Z GRUP İNŞAAT; hafriyat, temel kazısı, dolgu, damperli nakliyat, lowbed taşımacılık, arazöz, beko loder, ekskavatör ve iş makinesi hizmetleri sunar.',
  alternates: {
    canonical: getCanonicalUrl('/'),
  },
  ...buildShareMetadata({
    title: 'Z GRUP İNŞAAT | Hafriyat, Temel Kazısı ve İş Makinesi Hizmetleri',
    description: 'Z GRUP İNŞAAT; hafriyat, temel kazısı, dolgu, damperli nakliyat, lowbed taşımacılık, arazöz, beko loder, ekskavatör ve iş makinesi hizmetleri sunar.',
    pathname: '/',
  }),
}

export default async function Home() {
  const [settings, projects] = await Promise.all([getSiteSettings(), listPublishedProjects()])

  return (
    <main className="min-h-screen">
      <Navbar settings={settings} />
      <Hero settings={settings} />
      <StatsSection />
      <ServicesSection />
      <ProjectsSection projects={projects} />
      <WhyUsSection />
      <CTASection settings={settings} />
      <FloatingWhatsApp settings={settings} />
      <Footer settings={settings} />
    </main>
  )
}
