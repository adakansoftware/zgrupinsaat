type SchemaSettings = {
  companyName: string
  companyShortName: string
  contactPhone: string
  contactEmail: string
  address: string
  serviceArea: string
  instagramUrl: string
  whatsappUrl: string
}

function absoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString()
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(baseUrl, item.path),
    })),
  }
}

export function buildFaqJsonLd(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildServiceJsonLd(
  service: { title: string; description: string; path: string; image?: string },
  settings: SchemaSettings,
  baseUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': absoluteUrl(baseUrl, `${service.path}#service`),
    name: service.title,
    description: service.description,
    serviceType: service.title,
    url: absoluteUrl(baseUrl, service.path),
    image: service.image ? absoluteUrl(baseUrl, service.image) : undefined,
    areaServed: settings.serviceArea,
    provider: {
      '@id': absoluteUrl(baseUrl, '/#organization'),
      '@type': 'Organization',
      name: settings.companyName,
    },
  }
}

export function buildProjectJsonLd(
  project: {
    title: string
    slug: string
    summary: string
    description: string
    location: string
    category: string
    coverImage: string
    tags: string[]
    updatedAt: string
  },
  settings: SchemaSettings,
  baseUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Project',
    '@id': absoluteUrl(baseUrl, `/projects/${project.slug}#project`),
    name: project.title,
    description: project.summary || project.description,
    url: absoluteUrl(baseUrl, `/projects/${project.slug}`),
    image: project.coverImage ? absoluteUrl(baseUrl, project.coverImage) : undefined,
    dateModified: project.updatedAt,
    keywords: [project.category, ...project.tags].filter(Boolean),
    location: project.location
      ? {
          '@type': 'Place',
          name: project.location,
        }
      : undefined,
    provider: {
      '@id': absoluteUrl(baseUrl, '/#organization'),
      '@type': 'Organization',
      name: settings.companyName,
    },
  }
}

export function buildFleetJsonLd(
  item: {
    name: string
    slug: string
    description: string
    image: string
    models: Array<{ name: string }>
  },
  settings: SchemaSettings,
  baseUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': absoluteUrl(baseUrl, `/fleet/${item.slug}#fleet-item`),
    name: item.name,
    description: item.description,
    url: absoluteUrl(baseUrl, `/fleet/${item.slug}`),
    image: absoluteUrl(baseUrl, item.image),
    category: 'İş makinesi ve nakliye filosu',
    brand: {
      '@type': 'Brand',
      name: settings.companyName,
    },
    model: item.models.map((model) => model.name).join(', '),
  }
}
