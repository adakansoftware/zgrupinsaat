import path from 'path'
import { z } from 'zod'
import { readJsonFileWithBackup, restorePrimaryJsonFile, runSerializedFileWrite, writeJsonFileAtomic } from '@/lib/file-storage'
import { getAdminIssueCatalog } from '@/lib/admin-issue-catalog'
import { shouldPersistOperationalState } from '@/lib/build-phase-core'
import {
  adminIssueUpdateSchema,
  adminIssueStatusSchema,
  storedAdminIssueHistorySchema,
  storedAdminIssueStatesSchema,
} from '@/lib/validation'

export type AdminIssueStatus = z.infer<typeof adminIssueStatusSchema>
export type AdminIssueState = {
  id: string
  status: AdminIssueStatus
  note: string
  updatedAt: string
  firstSeenAt: string
  lastSeenAt: string
  lastStatusChangeAt: string
  resolvedAt?: string
  timesUpdated: number
  reopenCount: number
}

export type AdminIssueHistoryEntry = {
  issueId: string
  at: string
  fromStatus?: AdminIssueStatus
  toStatus: AdminIssueStatus
  note: string
  source: 'manual' | 'sync'
}

const issueStatusFile = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'admin-issue-status.json')
const issueHistoryFile = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', 'admin-issue-history.json')
const issueTrackerLockFile = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data', '.admin-issue-tracker.lock')
const defaultIssueStates: AdminIssueState[] = []
const defaultIssueHistory: AdminIssueHistoryEntry[] = []

export async function listAdminIssueStates() {
  const parsed = await readJsonFileWithBackup(issueStatusFile, storedAdminIssueStatesSchema, defaultIssueStates)

  if (parsed.source === 'backup') {
    await restorePrimaryJsonFile(issueStatusFile, parsed.data)
  }

  return parsed.data
}

export async function listAdminIssueHistory(limit?: number) {
  const parsed = await readJsonFileWithBackup(issueHistoryFile, storedAdminIssueHistorySchema, defaultIssueHistory)

  if (parsed.source === 'backup') {
    await restorePrimaryJsonFile(issueHistoryFile, parsed.data)
  }

  return typeof limit === 'number' ? parsed.data.slice(-limit) : parsed.data
}

export async function getAdminIssueStateMap() {
  const items = await listAdminIssueStates()
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, AdminIssueState>
}

async function appendAdminIssueHistory(entry: AdminIssueHistoryEntry) {
  const items = await listAdminIssueHistory()
  const nextItems = [...items, entry].slice(-500)
  await writeJsonFileAtomic(issueHistoryFile, storedAdminIssueHistorySchema.parse(nextItems))
}

async function readIssueStatesUnsafe() {
  const parsed = await readJsonFileWithBackup(issueStatusFile, storedAdminIssueStatesSchema, defaultIssueStates)

  if (parsed.source === 'backup') {
    await restorePrimaryJsonFile(issueStatusFile, parsed.data)
  }

  return parsed.data
}

async function readIssueHistoryUnsafe() {
  const parsed = await readJsonFileWithBackup(issueHistoryFile, storedAdminIssueHistorySchema, defaultIssueHistory)

  if (parsed.source === 'backup') {
    await restorePrimaryJsonFile(issueHistoryFile, parsed.data)
  }

  return parsed.data
}

async function runIssueTrackerMutation<T>(mutator: (input: {
  states: AdminIssueState[]
  history: AdminIssueHistoryEntry[]
}) => Promise<{
  states?: AdminIssueState[]
  history?: AdminIssueHistoryEntry[]
  result: T
}> | {
  states?: AdminIssueState[]
  history?: AdminIssueHistoryEntry[]
  result: T
}) {
  let result!: T

  await runSerializedFileWrite(issueTrackerLockFile, async () => {
    const [states, history] = await Promise.all([readIssueStatesUnsafe(), readIssueHistoryUnsafe()])
    const next = await mutator({ states, history })

    if (next.states) {
      await writeJsonFileAtomic(issueStatusFile, storedAdminIssueStatesSchema.parse(next.states))
    }

    if (next.history) {
      await writeJsonFileAtomic(issueHistoryFile, storedAdminIssueHistorySchema.parse(next.history))
    }

    result = next.result
  })

  return result
}

function buildNewIssueState(id: string, at: string): AdminIssueState {
  return {
    id,
    status: 'open',
    note: '',
    updatedAt: at,
    firstSeenAt: at,
    lastSeenAt: at,
    lastStatusChangeAt: at,
    resolvedAt: undefined,
    timesUpdated: 0,
    reopenCount: 0,
  }
}

export async function syncAdminIssueTracker() {
  const catalog = await getAdminIssueCatalog()

  if (!shouldPersistOperationalState(process.env.NEXT_PHASE)) {
    return readIssueStatesUnsafe()
  }

  return runIssueTrackerMutation(({ states, history }) => {
    const now = new Date().toISOString()
    const byId = new Map(states.map((item) => [item.id, item]))
    const nextHistory = [...history]
    let changed = false

    for (const issue of catalog) {
      const current = byId.get(issue.id)
      if (!current) {
        byId.set(issue.id, buildNewIssueState(issue.id, now))
        nextHistory.push({
          issueId: issue.id,
          at: now,
          toStatus: 'open',
          note: '',
          source: 'sync',
        })
        changed = true
        continue
      }

      if (current.lastSeenAt !== now) {
        byId.set(issue.id, { ...current, lastSeenAt: now })
        changed = true
      }
    }

    const nextStates = [...byId.values()]
    return {
      states: changed ? nextStates : undefined,
      history: changed ? nextHistory.slice(-500) : undefined,
      result: nextStates,
    }
  })
}

export async function getSyncedAdminIssueStateMap() {
  const items = await syncAdminIssueTracker()
  return Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, AdminIssueState>
}

export async function updateAdminIssueState(id: string, input: unknown) {
  const payload = adminIssueUpdateSchema.parse(input)
  const catalog = await getAdminIssueCatalog()

  return runIssueTrackerMutation(({ states, history }) => {
    const now = new Date().toISOString()
    const byId = new Map(states.map((item) => [item.id, item]))

    for (const issue of catalog) {
      const current = byId.get(issue.id)
      if (!current) {
        byId.set(issue.id, buildNewIssueState(issue.id, now))
      } else if (current.lastSeenAt !== now) {
        byId.set(issue.id, { ...current, lastSeenAt: now })
      }
    }

    const current = byId.get(id) ?? buildNewIssueState(id, now)
    const statusChanged = current.status !== payload.status
    const noteChanged = current.note !== payload.note
    const resolvedAt =
      payload.status === 'resolved'
        ? now
        : current.status === 'resolved'
          ? undefined
          : current.resolvedAt

    const nextItem: AdminIssueState = {
      ...current,
      status: payload.status,
      note: payload.note,
      updatedAt: now,
      lastSeenAt: now,
      lastStatusChangeAt: statusChanged ? now : current.lastStatusChangeAt,
      resolvedAt,
      timesUpdated: current.timesUpdated + 1,
      reopenCount: current.status === 'resolved' && payload.status !== 'resolved' ? current.reopenCount + 1 : current.reopenCount,
    }

    byId.set(id, nextItem)
    const nextHistory =
      statusChanged || noteChanged
        ? [
            ...history,
            {
              issueId: id,
              at: now,
              fromStatus: current.status,
              toStatus: payload.status,
              note: payload.note,
              source: 'manual' as const,
            },
          ].slice(-500)
        : history

    return {
      states: [...byId.values()],
      history: nextHistory,
      result: nextItem,
    }
  })
}
