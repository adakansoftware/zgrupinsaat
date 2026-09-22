import type { Metadata } from 'next'
import { CTASection } from '@/components/cta-section'
import { MediaSection } from '@/components/media-section'
import { PageHero } from '@/components/page-hero'
import { ProjectsSection } from '@/components/projects-section'
import { SiteFrame } from '@/components/site-frame'
import { listPublishedProjects } from '@/lib/project-service'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: {
    absolute: 'Projelerimiz | Z GRUP İNŞAAT',
  },
  description: 'Z GRUP İNŞAAT’ın tamamlanan hafriyat, temel kazısı, dolgu, nakliyat ve saha hazırlığı çalışmalarını inceleyin.',
  alternates: {
    canonical: getCanonicalUrl('/projects'),
  },
  ...buildShareMetadata({
    title: 'Projelerimiz | Z GRUP İNŞAAT',
    description: 'Z GRUP İNŞAAT’ın tamamlanan hafriyat, temel kazısı, dolgu, nakliyat ve saha hazırlığı çalışmalarını inceleyin.',
    pathname: '/projects',
  }),
}

export default async function ProjectsPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), listPublishedProjects()])

  return (
    <SiteFrame settings={settings}>
      <PageHero
        title="Sahada planlanan hafriyat ve nakliyat işleri"
        description="Temel kazısı, hafriyat nakliyesi, dolgu, damperli sevkiyat ve zemin hazırlığı işlerinde kapsamın sahaya, takvime ve ekipman ihtiyacına göre nasıl yönetildiğini inceleyin."
        image="/images/project-1.jpg"
        primaryCta={{ href: '/contact', label: 'Benzer Bir İş İçin Görüşelim' }}
      />
      <ProjectsSection projects={projects} />
      <MediaSection />
      <CTASection settings={settings} />
    </SiteFrame>
  )
}
