import type { MetadataRoute } from 'next'
import { getFleetHref, listFleetItems } from '@/lib/fleet-service'
import { listPublishedProjects } from '@/lib/project-service'
import { getMetadataBase } from '@/lib/seo'
import { getServiceHref, serviceDetails } from '@/lib/services-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadataBase = getMetadataBase()
  const [projects, fleetItems] = await Promise.all([listPublishedProjects(), listFleetItems()])
  const now = new Date()

  const staticRoutes = ['/', '/about', '/services', '/projects', '/fleet', '/contact', '/kvkk-aydinlatma-metni', '/llms.txt', '/llms-full.txt']
  const serviceRoutes = serviceDetails.map((service) => getServiceHref(service.slug))

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route, metadataBase).toString(),
      lastModified: now,
      changeFrequency: (route === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '/' ? 1 : route === '/contact' ? 0.8 : route === '/kvkk-aydinlatma-metni' ? 0.5 : 0.7,
    })),
    ...serviceRoutes.map((route) => ({
      url: new URL(route, metadataBase).toString(),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.72,
    })),
    ...projects.map((project) => ({
      url: new URL(`/projects/${project.slug}`, metadataBase).toString(),
      lastModified: new Date(project.updatedAt || project.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    ...fleetItems.map((item) => ({
      url: new URL(getFleetHref(item.slug), metadataBase).toString(),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.68,
    })),
  ]
}
