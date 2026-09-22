import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { z } from 'zod'
import { defaultSiteSettings } from '@/lib/file-defaults'
import { readJsonFileWithBackup, restorePrimaryJsonFile, updateJsonFileAtomic, writeJsonFileAtomic } from '@/lib/file-storage'
import { isCleanPublicPathUrl, isPathInside } from '@/lib/path-security'
import { storedMessagesSchema, storedProjectsSchema, storedSettingsSchema } from '@/lib/validation'

export type ProjectMedia = {
  id: string
  title: string
  fileUrl: string
  fileType: string
  resourceType: 'image' | 'video'
  thumbnailUrl?: string
  isCover: boolean
  sortOrder: number
  createdAt: string
}

export type Project = {
  id: string
  title: string
  slug: string
  summary: string
  description: string
  location: string
  category: string
  coverImage: string
  cardImage?: string
  status: 'Taslak' | 'Yayında'
  featured: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  media: ProjectMedia[]
}

export type AdminMessage = {
  id: string
  reference: string
  name: string
  phone: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export type SiteSettings = {
  companyName: string
  companyShortName: string
  contactPhone: string
  contactPhoneSecondary: string
  contactEmail: string
  contactEmailSecondary: string
  address: string
  serviceArea: string
  workingHours: string
  foundedYear: string
  instagramUrl: string
  whatsappUrl: string
  heroTitle: string
  heroDescription: string
  quoteNotice: string
}

const dataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'data')
const publicDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public')
const uploadsDir = path.join(publicDir, 'uploads')
const projectsFile = path.join(dataDir, 'projects.json')
const messagesFile = path.join(dataDir, 'messages.json')
const settingsFile = path.join(dataDir, 'settings.json')

const defaultSettings: SiteSettings = {
  companyName: 'Z GRUP İNŞAAT',
  companyShortName: 'Z GRUP',
  contactPhone: '+90 539 941 65 21',
  contactPhoneSecondary: '',
  contactEmail: 'info@zgrupinsaat.com',
  contactEmailSecondary: 'teklif@zgrupinsaat.com',
  address: 'Adana, Türkiye',
  serviceArea: 'Adana merkezli hafriyat, temel kazısı, dolgu, damperli nakliyat, lowbed ve arazöz hizmetleri',
  workingHours: 'Pazartesi - Cumartesi / 07:00 - 19:00',
  foundedYear: '1999',
  instagramUrl: 'https://www.instagram.com/zgrupinsaat',
  whatsappUrl: 'https://wa.me/905399416521',
  heroTitle: 'Hafriyat, temel kazısı ve nakliyatta, sahada güçlü plan',
  heroDescription: 'Temel kazısı, dolgu, zemin hazırlığı, hafriyat nakliyesi, lowbed ve arazöz ihtiyaçlarında makine, kamyon ve sevkiyat düzenini sahanın gerçek akışına göre kuruyoruz.',
  quoteNotice: 'Konum, metraj, malzeme türü ve çalışma takvimini paylaşın; doğru ekip, doğru araç ve uygulanabilir teklif planını birlikte netleştirelim.',
}

const defaultProjects: Project[] = []

function normalizeMessageReference(id: string) {
  return id.split('-').at(0)?.toUpperCase() || id.slice(0, 8).toUpperCase()
}

function normalizeMessages(messages: z.infer<typeof storedMessagesSchema>): AdminMessage[] {
  return messages.map((message) => ({
    ...message,
    reference: message.reference || normalizeMessageReference(message.id),
  }))
}

export async function readProjects(): Promise<Project[]> {
  const parsed = await readJsonFileWithBackup(projectsFile, storedProjectsSchema, defaultProjects)
  if (parsed.source !== 'primary') {
    await restorePrimaryJsonFile(projectsFile, parsed.data)
  }
  return parsed.data
}

export async function writeProjects(projects: Project[]) {
  await writeJsonFileAtomic(projectsFile, storedProjectsSchema.parse(projects))
}

export async function mutateProjects<T>(updater: (projects: Project[]) => Promise<{ projects: Project[]; result: T }> | { projects: Project[]; result: T }) {
  let result!: T

  await updateJsonFileAtomic(projectsFile, storedProjectsSchema, defaultProjects, async (currentProjects) => {
    const next = await updater(currentProjects)
    result = next.result
    return storedProjectsSchema.parse(next.projects)
  })

  return result
}

export async function getProjectById(id: string) {
  const projects = await readProjects()
  return projects.find((project) => project.id === id) || null
}

export async function getProjectBySlug(slug: string) {
  const projects = await readProjects()
  return projects.find((project) => project.slug === slug) || null
}

export async function readMessages(): Promise<AdminMessage[]> {
  const parsed = await readJsonFileWithBackup(messagesFile, storedMessagesSchema, [])
  const normalized = normalizeMessages(parsed.data)
  if (parsed.source !== 'primary' || JSON.stringify(parsed.data) !== JSON.stringify(normalized)) {
    await restorePrimaryJsonFile(messagesFile, normalized)
  }
  return normalized
}

export async function writeMessages(messages: AdminMessage[]) {
  await writeJsonFileAtomic(messagesFile, storedMessagesSchema.parse(messages))
}

export async function mutateMessages<T>(updater: (messages: AdminMessage[]) => Promise<{ messages: AdminMessage[]; result: T }> | { messages: AdminMessage[]; result: T }) {
  let result!: T

  await updateJsonFileAtomic(messagesFile, storedMessagesSchema, [], async (currentMessages) => {
    const normalized = normalizeMessages(currentMessages)
    const next = await updater(normalized)
    result = next.result
    return storedMessagesSchema.parse(next.messages)
  })

  return result
}

export async function readSettings(): Promise<SiteSettings> {
  const parsed = await readJsonFileWithBackup(settingsFile, storedSettingsSchema, defaultSettings)
  const normalized = { ...defaultSettings, ...parsed.data }
  if (parsed.source !== 'primary' || JSON.stringify(parsed.data) !== JSON.stringify(normalized)) {
    await restorePrimaryJsonFile(settingsFile, normalized)
  }
  return normalized
}

export async function writeSettings(settings: SiteSettings) {
  await writeJsonFileAtomic(settingsFile, storedSettingsSchema.parse(settings))
}

export async function mutateSettings<T>(updater: (settings: SiteSettings) => Promise<{ settings: SiteSettings; result: T }> | { settings: SiteSettings; result: T }) {
  let result!: T

  await updateJsonFileAtomic(settingsFile, storedSettingsSchema, defaultSettings, async (currentSettings) => {
    const normalized = { ...defaultSettings, ...currentSettings }
    const next = await updater(normalized)
    result = next.result
    return storedSettingsSchema.parse(next.settings)
  })

  return result
}

export function makeId() {
  return crypto.randomUUID()
}

export function isManagedUploadUrl(fileUrl: string) {
  return isCleanPublicPathUrl(fileUrl, 'uploads')
}

export function isPublicAssetUrl(fileUrl: string) {
  if (isManagedUploadUrl(fileUrl)) return true
  return isCleanPublicPathUrl(fileUrl, 'images')
}

export function resolvePublicAssetPath(fileUrl: string) {
  if (!isPublicAssetUrl(fileUrl)) return null

  const relative = fileUrl.replace(/^\/+/, '')
  const resolved = path.resolve(publicDir, relative)
  if (!isPathInside(publicDir, resolved)) return null
  return resolved
}

export async function assertPublicAssetExists(fileUrl: string) {
  const filePath = resolvePublicAssetPath(fileUrl)
  if (!filePath) return false

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export function resolveManagedUploadPath(fileUrl: string) {
  if (!isManagedUploadUrl(fileUrl)) return null

  const relative = fileUrl.replace(/^\/+/, '')
  const resolved = path.resolve(publicDir, relative)
  if (!isPathInside(uploadsDir, resolved)) return null
  return resolved
}

export async function assertManagedUploadExists(fileUrl: string) {
  return assertPublicAssetExists(fileUrl)
}

export function collectManagedUploadUrls(projects: Project[]) {
  const references = new Set<string>()

  for (const project of projects) {
    if (isManagedUploadUrl(project.coverImage)) {
      references.add(project.coverImage)
    }

    for (const media of project.media) {
      if (isManagedUploadUrl(media.fileUrl)) {
        references.add(media.fileUrl)
      }

      if (media.thumbnailUrl && isManagedUploadUrl(media.thumbnailUrl)) {
        references.add(media.thumbnailUrl)
      }
    }
  }

  return references
}

export async function safeDeleteManagedUpload(fileUrl: string) {
  const filePath = resolveManagedUploadPath(fileUrl)
  if (!filePath) return

  try {
    await fs.unlink(filePath)
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code !== 'ENOENT') {
      throw error
    }
  }
}

export async function safeDeleteManagedUploadIfOrphan(fileUrl: string, projects: Project[]) {
  if (!isManagedUploadUrl(fileUrl)) return

  const references = collectManagedUploadUrls(projects)
  if (references.has(fileUrl)) return

  await safeDeleteManagedUpload(fileUrl)
}
