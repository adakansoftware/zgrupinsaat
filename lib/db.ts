import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { resolveDatabaseConnection } from '@/lib/database-connection-core'
import { env } from '@/lib/env'

declare global {
  var __zgrupPgPool: Pool | undefined
}

function getHyperdriveConnectionString() {
  try {
    return getCloudflareContext().env.HYPERDRIVE?.connectionString
  } catch {
    return undefined
  }
}

function createPool(hyperdriveConnectionString?: string) {
  if (env.CONTENT_STORE !== 'postgres') {
    throw new Error('PostgreSQL havuzu yalnızca CONTENT_STORE=postgres iken oluşturulabilir.')
  }

  const connection = resolveDatabaseConnection({
    databaseUrl: env.DATABASE_URL ?? '',
    hyperdriveConnectionString,
  })

  return new Pool({
    ...connection,
    max: 4,
    ssl: hyperdriveConnectionString
      ? undefined
      : env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : undefined,
  })
}

export function getDbPool() {
  const hyperdriveConnectionString = getHyperdriveConnectionString()

  if (hyperdriveConnectionString) {
    return createPool(hyperdriveConnectionString)
  }

  if (!globalThis.__zgrupPgPool) {
    globalThis.__zgrupPgPool = createPool()
  }

  return globalThis.__zgrupPgPool
}

export async function withDbClient<T>(run: (client: PoolClient) => Promise<T>) {
  const client = await getDbPool().connect()

  try {
    return await run(client)
  } finally {
    client.release()
  }
}

export async function withDbTransaction<T>(run: (client: PoolClient) => Promise<T>) {
  return withDbClient(async (client) => {
    await client.query('BEGIN')

    try {
      const result = await run(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  })
}

export async function runQuery<T extends QueryResultRow>(sql: string, values?: unknown[]) {
  return getDbPool().query<T>(sql, values)
}
