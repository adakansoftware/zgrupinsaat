import { getSettingsRepository } from '@/lib/content-repository'
import { withPublicContactDetails } from '@/lib/contact-details'
import type { SiteSettings } from '@/lib/store'

export async function getSiteSettings() {
  return withPublicContactDetails(await getSettingsRepository().get())
}

export async function updateSiteSettings(input: SiteSettings) {
  const repository = getSettingsRepository()
  return repository.mutate((current) => {
    const nextSettings = withPublicContactDetails({ ...current, ...input })
    return {
      settings: nextSettings,
      result: nextSettings,
    }
  })
}
