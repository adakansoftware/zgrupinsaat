import { promises as fs } from 'fs'
import path from 'path'

type ParseResultSource = 'primary' | 'backup' | 'default'

const writeQueues = new Map<string, Promise<void>>()

export async function ensureParentDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

export async function ensureTextFile(filePath: string, defaultValue: string) {
  await ensureParentDir(filePath)

  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, defaultValue, 'utf8')
  }
}

export async function readJsonFileWithBackup<T>(
  filePath: string,
  schema: { parse: (value: unknown) => T },
  defaultValue: T,
): Promise<{ data: T; source: ParseResultSource }> {
  await ensureTextFile(filePath, JSON.stringify(defaultValue, null, 2))

  const candidates = [
    { path: filePath, source: 'primary' as const },
    { path: `${filePath}.bak`, source: 'backup' as const },
  ]

  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(/* turbopackIgnore: true */ candidate.path, 'utf8')
      return { data: schema.parse(JSON.parse(raw)), source: candidate.source }
    } catch {
      // Try the next candidate.
    }
  }

  return { data: defaultValue, source: 'default' }
}

export async function restorePrimaryJsonFile<T>(filePath: string, value: T) {
  await ensureParentDir(filePath)
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

async function writeJsonFileAtomicUnsafe<T>(filePath: string, value: T) {
  await ensureTextFile(filePath, JSON.stringify(value, null, 2))

  const serialized = JSON.stringify(value, null, 2)
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  const backupPath = `${filePath}.bak`

  try {
    await fs.copyFile(filePath, backupPath)
  } catch {
    // Backup may not exist on the first write.
  }

  try {
    await fs.writeFile(tempPath, serialized, 'utf8')
    await fs.rename(tempPath, filePath)
  } finally {
    try {
      await fs.unlink(tempPath)
    } catch {
      // Temp cleanup is best-effort only.
    }
  }
}

export async function runSerializedFileWrite(filePath: string, writer: () => Promise<void>) {
  const previous = writeQueues.get(filePath) || Promise.resolve()
  const next = previous
    .catch(() => undefined)
    .then(writer)
    .finally(() => {
      if (writeQueues.get(filePath) === next) {
        writeQueues.delete(filePath)
      }
    })

  writeQueues.set(filePath, next)
  return next
}

export async function writeJsonFileAtomic<T>(filePath: string, value: T) {
  await runSerializedFileWrite(filePath, () => writeJsonFileAtomicUnsafe(filePath, value))
}

export async function appendTextFileSerialized(filePath: string, value: string) {
  await runSerializedFileWrite(filePath, async () => {
    await ensureParentDir(filePath)
    await fs.appendFile(filePath, value, 'utf8')
  })
}

export async function updateJsonFileAtomic<T>(
  filePath: string,
  schema: { parse: (value: unknown) => T },
  defaultValue: T,
  updater: (currentValue: T) => Promise<T> | T,
) {
  let result: T

  await runSerializedFileWrite(filePath, async () => {
    const parsed = await readJsonFileWithBackup(filePath, schema, defaultValue)
    result = await updater(parsed.data)
    await writeJsonFileAtomicUnsafe(filePath, result)
  })

  return result!
}
