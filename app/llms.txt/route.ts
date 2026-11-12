import { listFleetItems } from '@/lib/fleet-service'
import { buildLlmsIndex } from '@/lib/llms-content'
import { listPublishedProjects } from '@/lib/project-service'
import { getMetadataBase } from '@/lib/seo'
import { getServiceHref, serviceDetails } from '@/lib/services-data'
import { getSiteSettings } from '@/lib/settings-service'

export async function GET() {
  const [settings, projects, fleet] = await Promise.all([getSiteSettings(), listPublishedProjects(), listFleetItems()])
  const pages = [
    { title: 'Ana Sayfa', path: '/', description: settings.heroDescription },
    { title: 'Hakkımızda', path: '/about', description: settings.serviceArea },
    { title: 'Hizmetler', path: '/services', description: 'Hafriyat, kazı, dolgu, nakliyat ve iş makinesi hizmetleri.' },
    ...serviceDetails.map((service) => ({ title: service.title, path: getServiceHref(service.slug), description: service.metaDescription })),
    ...projects.map((project) => ({ title: project.title, path: `/projects/${project.slug}`, description: project.summary || project.description })),
    ...fleet.map((item) => ({ title: item.name, path: `/fleet/${item.slug}`, description: item.description })),
    { title: 'İletişim', path: '/contact', description: 'Keşif ve teklif iletişim bilgileri.' },
  ]

  return new Response(buildLlmsIndex(settings, pages, getMetadataBase().toString()), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
