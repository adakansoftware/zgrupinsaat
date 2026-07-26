import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
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
  const { readJsonFileWithBackup, updateJsonFileAtomic } = await import('../lib/file-storage.ts')
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
