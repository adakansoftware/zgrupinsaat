import { listFleetItems } from '@/lib/fleet-service'
import { buildLlmsFull } from '@/lib/llms-content'
import { listPublishedProjects } from '@/lib/project-service'
import { getMetadataBase } from '@/lib/seo'
import { getServiceHref, serviceDetails } from '@/lib/services-data'
import { getSiteSettings } from '@/lib/settings-service'

export async function GET() {
  const [settings, projects, fleet] = await Promise.all([getSiteSettings(), listPublishedProjects(), listFleetItems()])
  const body = buildLlmsFull(
    {
      settings,
      services: serviceDetails.map((service) => ({
        title: service.title,
        path: getServiceHref(service.slug),
        description: service.metaDescription,
        faq: service.faq,
      })),
      projects: projects.map((project) => ({
        title: project.title,
        path: `/projects/${project.slug}`,
        description: project.summary || project.description,
        location: project.location,
      })),
      fleet: fleet.map((item) => ({
        title: item.name,
        path: `/fleet/${item.slug}`,
        description: item.description,
      })),
    },
    getMetadataBase().toString(),
  )

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
