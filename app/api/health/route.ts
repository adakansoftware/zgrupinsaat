import { constants, promises as fs } from 'fs'
import path from 'path'
import { isAdminAuthenticated } from '@/lib/auth'
import { getContentStoreDriver } from '@/lib/content-repository'
import { getDbPool } from '@/lib/db'
import { env } from '@/lib/env'
import { isHealthReady } from '@/lib/health-core'
import { jsonNoStore, withErrorHandling } from '@/lib/http'
import { getRateLimitStoreDriver } from '@/lib/rate-limit-store'

async function checkPathState(targetPath: string) {
  try {
    const stat = await fs.stat(targetPath)
    await fs.access(targetPath, constants.R_OK | constants.W_OK)

    return {
      exists: true,
      writable: true,
      type: stat.isDirectory() ? 'directory' : 'file',
    }
  } catch {
    return {
      exists: false,
      writable: false,
      type: 'missing',
    }
  }
}

async function checkDatabaseState() {
  if (env.CONTENT_STORE !== 'postgres') return false

  try {
    await getDbPool().query('SELECT 1')
    return true
  } catch {
    return false
  }
}

export async function GET() {
  return withErrorHandling(async () => {
    const dataDir = path.join(process.cwd(), 'data')

    const [dataState, databaseReady] = await Promise.all([checkPathState(dataDir), checkDatabaseState()])
    const dataReady = dataState.exists && dataState.writable
    const ready = isHealthReady({ contentStore: env.CONTENT_STORE, dataReady, databaseReady })
    const warnings: string[] = []

    if (env.NODE_ENV === 'production' && env.CONTENT_STORE === 'file') {
      warnings.push('File-based content storage is active; multi-instance and serverless deployments need a shared database or persistent volume.')
    }

    if (env.NODE_ENV === 'production' && env.RATE_LIMIT_STORE === 'memory') {
      warnings.push('Memory rate limiting is active; distributed production deployments need a shared Redis or KV-backed store.')
    }

    return jsonNoStore(
      (await isAdminAuthenticated()) ? {
        status: ready ? 'ok' : 'degraded',
        checkedAt: new Date().toISOString(),
        runtime: {
          nodeEnv: env.NODE_ENV,
          appOriginConfigured: Boolean(env.APP_ORIGIN),
          siteUrlConfigured: Boolean(env.NEXT_PUBLIC_SITE_URL),
        },
        storage: {
          contentStore: env.CONTENT_STORE,
          data: dataState,
          databaseReady,
        },
        rateLimit: {
          store: env.RATE_LIMIT_STORE,
        },
        configuredDrivers: {
          contentStore: getContentStoreDriver(),
          rateLimitStore: getRateLimitStoreDriver(),
        },
        warnings,
      } : {
        status: ready ? 'ok' : 'degraded',
        checkedAt: new Date().toISOString(),
      },
      { status: ready ? 200 : 503 },
    )
  })
}
