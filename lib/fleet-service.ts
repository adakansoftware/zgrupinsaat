import path from 'path'
import bundledFleetContent from '@/data/fleet.json'
import {
  readJsonFileWithBackup,
  restorePrimaryJsonFile,
  shouldRestorePrimaryJsonSource,
  writeJsonFileAtomic,
} from '@/lib/file-storage'
import { fleetContentSchema } from '@/lib/validation'

export type FleetContent = Awaited<ReturnType<typeof getFleetContent>>
export type FleetItem = FleetContent['items'][number]
export type FleetModel = FleetItem['models'][number]
export type FleetStat = FleetContent['stats'][number]

const fleetFile = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'fleet.json')
const defaultFleetContent = fleetContentSchema.parse(bundledFleetContent)

function assertUniqueSlugs(items: FleetItem[]) {
  const seen = new Set<string>()

  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`Duplicate fleet slug detected: ${item.slug}`)
    }

    seen.add(item.slug)
  }
}

function assertNonEmptyModels(items: FleetItem[]) {
  for (const item of items) {
    if (item.models.length === 0) {
      throw new Error(`Fleet item must include at least one model: ${item.slug}`)
    }
  }
}

function assertModelCounts(items: FleetItem[]) {
  for (const item of items) {
    if (item.models.length !== item.modelCount) {
      throw new Error(`Fleet item model count mismatch: ${item.slug}`)
    }

    const uniqueNames = new Set(item.models.map((model) => model.name.toLocaleLowerCase('tr-TR')))
    if (uniqueNames.size !== item.models.length) {
      throw new Error(`Fleet item has duplicate model cards: ${item.slug}`)
    }
  }
}

export async function getFleetContent() {
  const parsed = await readJsonFileWithBackup(fleetFile, fleetContentSchema, defaultFleetContent)
  const content = parsed.data

  assertUniqueSlugs(content.items)
  assertNonEmptyModels(content.items)
  assertModelCounts(content.items)

  if (shouldRestorePrimaryJsonSource(parsed.source)) {
    await restorePrimaryJsonFile(fleetFile, content)
  }

  return content
}

export async function updateFleetContent(input: unknown) {
  const content = fleetContentSchema.parse(input)

  assertUniqueSlugs(content.items)
  assertNonEmptyModels(content.items)
  assertModelCounts(content.items)

  await writeJsonFileAtomic(fleetFile, content)
  return content
}

export async function listFleetItems() {
  const content = await getFleetContent()
  return content.items
}

export async function listFleetStats() {
  const content = await getFleetContent()
  return content.stats
}

export function getFleetHref(slug: string) {
  return `/fleet/${slug}`
}

export async function findFleetBySlug(slug: string) {
  const items = await listFleetItems()
  return items.find((item) => item.slug === slug) || null
}
