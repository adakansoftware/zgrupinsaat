type LlmsSettings = {
  companyName: string
  heroDescription: string
  serviceArea: string
  contactPhone: string
  contactEmail: string
  whatsappUrl: string
}

type LlmsPage = {
  title: string
  path: string
  description: string
}

type LlmsService = LlmsPage & {
  faq: Array<{ question: string; answer: string }>
}

function link(baseUrl: string, page: LlmsPage) {
  return `- [${page.title}](${new URL(page.path, baseUrl).toString()}): ${page.description}`
}

export function buildLlmsIndex(settings: LlmsSettings, pages: LlmsPage[], baseUrl: string) {
  return [
    `# ${settings.companyName}`,
    '',
    `> ${settings.heroDescription}`,
    '',
    `Hizmet bölgesi: ${settings.serviceArea}`,
    `Telefon: ${settings.contactPhone}`,
    `E-posta: ${settings.contactEmail}`,
    `WhatsApp: ${settings.whatsappUrl}`,
    '',
    '## Önemli Sayfalar',
    '',
    ...pages.map((page) => link(baseUrl, page)),
    '',
  ].join('\n')
}

export function buildLlmsFull(
  input: {
    settings: LlmsSettings
    services: LlmsService[]
    projects: Array<LlmsPage & { location: string }>
    fleet: LlmsPage[]
  },
  baseUrl: string,
) {
  const faqs = input.services.flatMap((service) => service.faq)

  return [
    buildLlmsIndex(input.settings, input.services, baseUrl).trimEnd(),
    '',
    '## Hizmetler',
    '',
    ...input.services.map((service) => link(baseUrl, service)),
    '',
    '## Projeler',
    '',
    ...input.projects.map((project) => `${link(baseUrl, project)}${project.location ? ` Konum: ${project.location}.` : ''}`),
    '',
    '## Filo',
    '',
    ...input.fleet.map((item) => link(baseUrl, item)),
    '',
    '## Gerçek SSS',
    '',
    ...faqs.flatMap((faq) => [`### ${faq.question}`, '', faq.answer, '']),
  ].join('\n')
}
