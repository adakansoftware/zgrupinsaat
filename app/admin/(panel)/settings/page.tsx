import { SettingsForm } from '@/components/admin/SettingsForm'
import { getSiteSettings } from '@/lib/settings-service'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div>
      <div className="mb-6">
        <div className="section-eyebrow mb-4">Kurumsal Ayarlar</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Site Ayarları</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">Marka, iletişim ve ana sayfa metinlerini buradan güncelleyin.</p>
      </div>

      <div className="industrial-border max-w-5xl rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
        <SettingsForm initialValues={settings} />
      </div>
    </div>
  )
}
