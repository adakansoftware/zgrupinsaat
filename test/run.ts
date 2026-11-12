import assert from 'node:assert/strict'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

async function run() {
  process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'super-secure-password'
  process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '12345678901234567890123456789012'
  process.env.APP_ORIGIN = process.env.APP_ORIGIN || 'https://example.com'
  process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  const { normalizeAdminNextTarget } = await import('../lib/admin-redirect.ts')
  const { getAdminCookieName } = await import('../lib/auth-shared.ts')
  const { readJsonFileWithBackup, shouldRestorePrimaryJsonSource, updateJsonFileAtomic } = await import('../lib/file-storage.ts')
  const { getComparableOrigin, resolveAllowedOrigin } = await import('../lib/origin.ts')
  const { hashPasswordWithScrypt, isValidPasswordHashFormat, verifyPasswordAgainstHash } = await import('../lib/password-hash.ts')
  const { createSignedAdminSessionToken, isValidSignedAdminSessionToken } = await import('../lib/session-token-core.ts')
  const { createSlug, ensureUniqueSlug } = await import('../lib/slug.ts')
  const {
    isAllowedRequestContentType,
    isRequestBodyWithinLimit,
    isTrustedOriginRequest,
  } = await import('../lib/request-guards-core.ts')
  const { getClientIp } = await import('../lib/client-ip.ts')
  const { anonymizeAuditIp } = await import('../lib/audit-core.ts')
  const { serializeJsonForScript } = await import('../lib/json-script-core.ts')
  const { readRequestTextWithinLimit } = await import('../lib/request-body-core.ts')
  const { isValidUuidRouteParam } = await import('../lib/route-params-core.ts')
  const { isCleanPublicPathUrl, isPathInside } = await import('../lib/path-security.ts')
  const { shouldPersistOperationalState } = await import('../lib/build-phase-core.ts')
  const { isHealthReady } = await import('../lib/health-core.ts')
  const { resolveDatabaseConnection } = await import('../lib/database-connection-core.ts')
  assert.equal(shouldPersistOperationalState('phase-production-build'), false)
  assert.equal(shouldPersistOperationalState(undefined), true)
  assert.equal(isHealthReady({ contentStore: 'file', dataReady: true, databaseReady: false }), true)
  assert.equal(isHealthReady({ contentStore: 'file', dataReady: false, databaseReady: true }), false)
  assert.equal(isHealthReady({ contentStore: 'postgres', dataReady: false, databaseReady: true }), true)
  assert.equal(isHealthReady({ contentStore: 'postgres', dataReady: true, databaseReady: false }), false)
  assert.equal(shouldRestorePrimaryJsonSource('backup'), true)
  assert.equal(shouldRestorePrimaryJsonSource('default'), false)
  assert.deepEqual(
    resolveDatabaseConnection({
      databaseUrl: 'postgres://direct.example/db',
      hyperdriveConnectionString: 'postgres://hyperdrive.local/db',
    }),
    { connectionString: 'postgres://hyperdrive.local/db', maxUses: 1 },
  )
  assert.deepEqual(
    resolveDatabaseConnection({ databaseUrl: 'postgres://direct.example/db' }),
    { connectionString: 'postgres://direct.example/db' },
  )
  const {
    PUBLIC_PHONE_DISPLAY,
    PUBLIC_PHONE_TEL,
    PUBLIC_WHATSAPP_URL,
    withPublicContactDetails,
  } = await import('../lib/contact-details.ts')

  assert.equal(PUBLIC_PHONE_DISPLAY, '+90 532 449 94 55')
  assert.equal(PUBLIC_PHONE_TEL, 'tel:+905324499455')
  assert.equal(PUBLIC_WHATSAPP_URL, 'https://wa.me/905324499455')
  assert.deepEqual(
    withPublicContactDetails({
      contactPhone: '+90 539 941 65 21',
      contactPhoneSecondary: '+90 532 555 55 55',
      whatsappUrl: 'https://wa.me/905399416521',
    }),
    {
      contactPhone: PUBLIC_PHONE_DISPLAY,
      contactPhoneSecondary: '',
      whatsappUrl: PUBLIC_WHATSAPP_URL,
    },
  )

  const publicContactSources = await Promise.all(
    [
      'components/navbar.tsx',
      'components/hero.tsx',
      'components/cta-section.tsx',
      'components/footer.tsx',
      'components/contact-section.tsx',
      'components/floating-whatsapp.tsx',
    ].map((file) => readFile(path.join(process.cwd(), file), 'utf8')),
  )
  const publicContactSource = publicContactSources.join('\n')
  assert.doesNotMatch(publicContactSource, /contactPhoneSecondary/)
  assert.doesNotMatch(publicContactSource, /539\s*941|905399416521|532\s*555/)
  assert.match(publicContactSource, /whitespace-nowrap/)

  const {
    buildBreadcrumbJsonLd,
    buildFaqJsonLd,
    buildFleetJsonLd,
    buildProjectJsonLd,
    buildServiceJsonLd,
  } = await import('../lib/seo-schema-core.ts')
  const { buildLlmsFull, buildLlmsIndex } = await import('../lib/llms-content.ts')

  const schemaSettings = {
    companyName: 'Z GRUP İNŞAAT',
    companyShortName: 'Z GRUP',
    contactPhone: PUBLIC_PHONE_DISPLAY,
    contactPhoneSecondary: '',
    contactEmail: 'info@zgrupinsaat.com',
    contactEmailSecondary: '',
    address: 'Adana, Türkiye',
    serviceArea: 'Adana merkezli hafriyat hizmetleri',
    workingHours: 'Pazartesi - Cumartesi / 07:00 - 19:00',
    foundedYear: '1999',
    instagramUrl: 'https://www.instagram.com/zgrupinsaat',
    whatsappUrl: PUBLIC_WHATSAPP_URL,
    heroTitle: 'Hafriyat ve nakliyat',
    heroDescription: 'Saha hizmetleri',
    quoteNotice: 'Teklif için iletişime geçin.',
  }
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Hizmetler', path: '/services' },
  ], 'https://example.com')
  assert.equal(breadcrumb['@type'], 'BreadcrumbList')
  assert.equal(breadcrumb.itemListElement[1].item, 'https://example.com/services')

  const faqItems = [{ question: 'Hangi bilgi gerekir?', answer: 'Konum ve yaklaşık metraj gerekir.' }]
  const faq = buildFaqJsonLd(faqItems)
  assert.equal(faq['@type'], 'FAQPage')
  assert.equal(faq.mainEntity[0].name, faqItems[0].question)
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, faqItems[0].answer)

  const serviceSchema = buildServiceJsonLd(
    { title: 'Temel Kazısı', description: 'Temel kazısı hizmeti', path: '/services/temel-kazisi', image: '/images/excavator.jpg' },
    schemaSettings,
    'https://example.com',
  )
  assert.equal(serviceSchema['@type'], 'Service')
  assert.equal(serviceSchema.provider['@id'], 'https://example.com/#organization')

  const projectSchema = buildProjectJsonLd(
    {
      title: 'Örnek Saha Çalışması',
      slug: 'ornek-saha-calismasi',
      summary: 'Mevcut proje özeti',
      description: 'Mevcut proje açıklaması',
      location: 'Adana',
      category: 'Hafriyat',
      coverImage: '/images/project-1.jpg',
      tags: ['Hafriyat'],
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    schemaSettings,
    'https://example.com',
  )
  assert.equal(projectSchema['@type'], 'Project')
  assert.equal(projectSchema.name, 'Örnek Saha Çalışması')
  assert.equal(projectSchema.location.name, 'Adana')

  const fleetSchema = buildFleetJsonLd(
    {
      name: 'Ekskavatör',
      slug: 'ekskavator',
      description: 'Mevcut filo açıklaması',
      image: '/images/excavator.jpg',
      models: [{ name: 'Model A' }],
    },
    schemaSettings,
    'https://example.com',
  )
  assert.equal(fleetSchema['@type'], 'Product')
  assert.equal(fleetSchema.brand.name, 'Z GRUP İNŞAAT')
  assert.equal('offers' in fleetSchema, false)
  assert.equal('aggregateRating' in fleetSchema, false)

  const robotsSource = await readFile(path.join(process.cwd(), 'app/robots.ts'), 'utf8')
  assert.match(robotsSource, /OAI-SearchBot/)
  assert.match(robotsSource, /OAI-AdsBot/)

  const llmsIndex = buildLlmsIndex(schemaSettings, [{ title: 'Temel Kazısı', path: '/services/temel-kazisi', description: 'Kazı hizmeti' }], 'https://example.com')
  assert.match(llmsIndex, /# Z GRUP İNŞAAT/)
  assert.match(llmsIndex, /https:\/\/example\.com\/services\/temel-kazisi/)
  const llmsFull = buildLlmsFull({
    settings: schemaSettings,
    services: [{ title: 'Temel Kazısı', path: '/services/temel-kazisi', description: 'Kazı hizmeti', faq: faqItems }],
    projects: [{ title: 'Örnek Saha Çalışması', path: '/projects/ornek-saha-calismasi', description: 'Proje özeti', location: 'Adana' }],
    fleet: [{ title: 'Ekskavatör', path: '/fleet/ekskavator', description: 'Filo özeti' }],
  }, 'https://example.com')
  assert.match(llmsFull, /## Gerçek SSS/)
  assert.match(llmsFull, /Örnek Saha Çalışması/)
  assert.doesNotMatch(llmsFull, /rating|yorum|koordinat/i)

  const nextConfig = await import('../next.config.mjs')
  const configuredHeaders = await nextConfig.default.headers()
  const globalSecurityHeaders = configuredHeaders.find((entry) => entry.source === '/:path*')?.headers || []
  const adminSecurityHeaders = configuredHeaders.find((entry) => entry.source === '/admin/:path*')?.headers || []
  const apiSecurityHeaders = configuredHeaders.find((entry) => entry.source === '/api/:path*')?.headers || []
  const csp = globalSecurityHeaders.find((entry) => entry.key === 'Content-Security-Policy')?.value || ''

  assert.match(csp, /script-src-attr 'none'/)
  assert.equal(globalSecurityHeaders.find((entry) => entry.key === 'X-Permitted-Cross-Domain-Policies')?.value, 'none')
  assert.equal(globalSecurityHeaders.find((entry) => entry.key === 'X-Download-Options')?.value, 'noopen')
  assert.equal(adminSecurityHeaders.find((entry) => entry.key === 'Cache-Control')?.value, 'private, no-store, max-age=0')
  assert.equal(adminSecurityHeaders.find((entry) => entry.key === 'X-Robots-Tag')?.value, 'noindex, nofollow, noarchive')
  assert.equal(apiSecurityHeaders.find((entry) => entry.key === 'Cache-Control')?.value, 'no-store, max-age=0')

  assert.equal(createSlug('Demo Metro Projesi'), 'demo-metro-projesi')
  assert.equal(createSlug('  test   proje ###  '), 'test-proje')

  const projects = [
    { id: '1', slug: 'demo-proje' },
    { id: '2', slug: 'demo-proje-2' },
  ]

  assert.equal(ensureUniqueSlug('demo proje', projects), 'demo-proje-3')
  assert.equal(ensureUniqueSlug('demo proje', projects, '1'), 'demo-proje')

  assert.equal(normalizeAdminNextTarget('/admin'), '/admin')
  assert.equal(normalizeAdminNextTarget('/admin/projects/new'), '/admin/projects/new')
  assert.equal(normalizeAdminNextTarget('https://evil.example.com/admin'), '/admin')
  assert.equal(normalizeAdminNextTarget('/contact'), '/admin')
  assert.equal(normalizeAdminNextTarget('/admin/projects/../../settings'), '/admin')
  assert.equal(normalizeAdminNextTarget('//evil.example.com/admin'), '/admin')
  assert.equal(normalizeAdminNextTarget('/admin/%2f%2fevil.example.com'), '/admin')
  assert.equal(normalizeAdminNextTarget('/admin\r\nLocation: https://evil.example.com'), '/admin')
  assert.equal(getAdminCookieName('production'), '__Host-admin_session')
  assert.equal(getAdminCookieName('development'), 'admin_session')
  assert.equal(isValidSignedAdminSessionToken(undefined, process.env.ADMIN_SESSION_SECRET), false)
  assert.equal(isValidSignedAdminSessionToken('invalid.token.extra', process.env.ADMIN_SESSION_SECRET), false)
  assert.equal(isValidSignedAdminSessionToken('eyJmb28iOiJiYXIifQ.invalid', process.env.ADMIN_SESSION_SECRET), false)
  assert.equal(isValidSignedAdminSessionToken('a'.repeat(513), process.env.ADMIN_SESSION_SECRET), false)
  assert.equal(isValidSignedAdminSessionToken(`${'a'.repeat(385)}.${'b'.repeat(43)}`, process.env.ADMIN_SESSION_SECRET), false)
  assert.equal(isValidSignedAdminSessionToken(createSignedAdminSessionToken(process.env.ADMIN_SESSION_SECRET, 60), process.env.ADMIN_SESSION_SECRET), true)
  assert.throws(() => createSignedAdminSessionToken(process.env.ADMIN_SESSION_SECRET, 0), RangeError)
  assert.throws(() => createSignedAdminSessionToken(process.env.ADMIN_SESSION_SECRET, 24 * 60 * 60 + 1), RangeError)

  const hashedPassword = hashPasswordWithScrypt('super-secure-password', Buffer.alloc(16, 7))
  assert.equal(isValidPasswordHashFormat(hashedPassword), true)
  assert.equal(verifyPasswordAgainstHash('super-secure-password', hashedPassword), true)
  assert.equal(verifyPasswordAgainstHash('wrong-password', hashedPassword), false)

  assert.equal(getComparableOrigin('https://example.com/path?q=1'), 'https://example.com')
  assert.equal(getComparableOrigin('not-a-url'), null)
  assert.equal(
    resolveAllowedOrigin({
      appOrigin: 'https://example.com/app',
      publicSiteUrl: undefined,
      nodeEnv: 'production',
      hostHeader: 'evil.example.com',
    }),
    'https://example.com',
  )
  assert.equal(
    resolveAllowedOrigin({
      appOrigin: undefined,
      publicSiteUrl: undefined,
      nodeEnv: 'production',
      hostHeader: 'preview.evil.example.com',
    }),
    null,
  )
  assert.equal(
    resolveAllowedOrigin({
      appOrigin: undefined,
      publicSiteUrl: undefined,
      nodeEnv: 'development',
      hostHeader: 'localhost:3000',
    }),
    'http://localhost:3000',
  )

  assert.equal(isCleanPublicPathUrl('/uploads/photo.jpg', 'uploads'), true)
  assert.equal(isCleanPublicPathUrl('/uploads/../images/logo.png', 'uploads'), false)
  assert.equal(isCleanPublicPathUrl('/uploads\\photo.jpg', 'uploads'), false)
  assert.equal(isCleanPublicPathUrl('/uploads/%2e%2e/images/logo.png', 'uploads'), false)
  assert.equal(isCleanPublicPathUrl('/images/%2e%2e/uploads/photo.jpg', 'images'), false)
  assert.equal(isCleanPublicPathUrl(`/images/${'a'.repeat(501)}`, 'images'), false)
  assert.equal(isCleanPublicPathUrl('/images/hero-main.jpg', 'images'), true)
  assert.equal(isCleanPublicPathUrl('/images/../uploads/photo.jpg', 'images'), false)
  assert.equal(isPathInside(path.join('public', 'uploads'), path.join('public', 'uploads', 'photo.jpg')), true)
  assert.equal(isPathInside(path.join('public', 'uploads'), path.join('public', 'uploads2', 'photo.jpg')), false)

  assert.equal(
    isAllowedRequestContentType(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }),
      ['application/json'],
    ),
    true,
  )
  assert.equal(
    isAllowedRequestContentType(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'text/plain; application/json' },
      }),
      ['application/json'],
    ),
    false,
  )
  assert.equal(
    isAllowedRequestContentType(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
      }),
      ['application/json'],
    ),
    false,
  )

  assert.equal(
    isRequestBodyWithinLimit(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-length': '128' },
      }),
      256,
    ),
    true,
  )
  assert.equal(
    isRequestBodyWithinLimit(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-length': '1024' },
      }),
      256,
    ),
    false,
  )

  assert.equal(
    getClientIp(
      new Request('https://example.com/api/contact', {
        headers: {
          'x-vercel-forwarded-for': '203.0.113.24',
          'x-forwarded-for': '198.51.100.12',
        },
      }),
    ),
    '203.0.113.24',
  )
  assert.equal(
    getClientIp(
      new Request('https://example.com/api/contact', {
        headers: { 'x-forwarded-for': '198.51.100.12, 10.0.0.1' },
      }),
    ),
    '198.51.100.12',
  )
  assert.equal(getClientIp(new Request('https://example.com/api/contact')), 'unknown')
  assert.equal(anonymizeAuditIp('203.0.113.24', process.env.ADMIN_SESSION_SECRET).length, 20)
  assert.notEqual(anonymizeAuditIp('203.0.113.24', process.env.ADMIN_SESSION_SECRET), '203.0.113.24')
  assert.equal(anonymizeAuditIp('unknown', process.env.ADMIN_SESSION_SECRET), undefined)
  assert.equal(isValidUuidRouteParam('550e8400-e29b-41d4-a716-446655440000'), true)
  assert.equal(isValidUuidRouteParam('../settings'), false)
  assert.equal(isValidUuidRouteParam('x'.repeat(65)), false)
  const escapedJsonLd = serializeJsonForScript({ label: '</script><script>alert(1)</script>' })
  assert.ok(!escapedJsonLd.includes('</script>'))
  assert.ok(escapedJsonLd.includes('\\u003c/script\\u003e'))
  const chunkedBody = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"name":"'))
      controller.enqueue(new TextEncoder().encode('example"}'))
      controller.close()
    },
  })
  const chunkedRequest = new Request('https://example.com/api/contact', {
    method: 'POST',
    body: chunkedBody,
    duplex: 'half',
  })
  assert.equal(await readRequestTextWithinLimit(chunkedRequest, 64), '{"name":"example"}')

  const oversizedRequest = new Request('https://example.com/api/contact', {
    method: 'POST',
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('x'.repeat(65)))
        controller.close()
      },
    }),
    duplex: 'half',
  })
  await assert.rejects(() => readRequestTextWithinLimit(oversizedRequest, 64), RangeError)
  assert.equal(
    isRequestBodyWithinLimit(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-length': '-1' },
      }),
      256,
    ),
    false,
  )
  assert.equal(
    isRequestBodyWithinLimit(
      new Request('https://example.com/api/messages', {
        method: 'POST',
        headers: { 'content-length': 'not-a-number' },
      }),
      256,
    ),
    false,
  )

  assert.equal(
    isTrustedOriginRequest(
      new Request('https://example.com/api/projects', {
        method: 'POST',
        headers: {
          origin: 'https://example.com',
          referer: 'https://example.com/admin/projects',
        },
      }),
      'https://example.com',
    ),
    true,
  )
  assert.equal(
    isTrustedOriginRequest(
      new Request('https://example.com/api/projects', {
        method: 'POST',
        headers: {
          origin: 'https://evil.example.com',
          referer: 'https://evil.example.com/form',
        },
      }),
      'https://example.com',
    ),
    false,
  )
  assert.equal(
    isTrustedOriginRequest(
      new Request('https://example.com/api/projects', {
        method: 'POST',
        headers: {
          origin: 'https://example.com',
          'sec-fetch-site': 'cross-site',
        },
      }),
      'https://example.com',
    ),
    false,
  )
  assert.equal(
    isTrustedOriginRequest(
      new Request('https://example.com/api/projects', {
        method: 'POST',
        headers: {
          origin: 'https://example.com',
        },
      }),
      null,
    ),
    false,
  )

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'sali-storage-test-'))
  const missingFile = path.join(tempDir, 'missing.json')
  const missing = await readJsonFileWithBackup(
    missingFile,
    { parse: (value: unknown) => value as string[] },
    [],
  )
  assert.deepEqual(missing, { data: [], source: 'default' })
  await assert.rejects(access(missingFile))

  const primaryFile = path.join(tempDir, 'projects.json')
  const backupFile = `${primaryFile}.bak`

  await writeFile(primaryFile, '{"invalid"', 'utf8')
  await writeFile(backupFile, JSON.stringify([{ id: 'backup-project' }], null, 2), 'utf8')

  const parsed = await readJsonFileWithBackup(
    primaryFile,
    {
      parse(value: unknown) {
        assert.ok(Array.isArray(value))
        return value as Array<{ id: string }>
      },
    },
    [],
  )

  assert.equal(parsed.source, 'backup')
  assert.equal(parsed.data[0]?.id, 'backup-project')

  const queueFile = path.join(tempDir, 'messages.json')
  const arraySchema = {
    parse(value: unknown) {
      assert.ok(Array.isArray(value))
      return value as string[]
    },
  }

  await Promise.all([
    updateJsonFileAtomic(queueFile, arraySchema, [], async (current) => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      return [...current, 'first']
    }),
    updateJsonFileAtomic(queueFile, arraySchema, [], async (current) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      return [...current, 'second']
    }),
  ])

  const queued = await readJsonFileWithBackup(queueFile, arraySchema, [])
  assert.deepEqual(queued.data.sort(), ['first', 'second'])

  await rm(tempDir, { recursive: true, force: true })
  process.stdout.write('Lightweight verification passed.\n')
}

run()
