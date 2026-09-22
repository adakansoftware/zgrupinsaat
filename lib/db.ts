import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { env } from '@/lib/env'

declare global {
  var __zgrupPgPool: Pool | undefined
}

function createPool() {
  if (env.CONTENT_STORE !== 'postgres') {
    throw new Error('PostgreSQL havuzu yalnızca CONTENT_STORE=postgres iken oluşturulabilir.')
  }

  return new Pool({
    connectionString: env.DATABASE_URL,
    max: 4,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  })
}

export function getDbPool() {
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
