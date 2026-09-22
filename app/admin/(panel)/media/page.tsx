import { AdminMediaLibrary } from '@/components/admin/AdminMediaLibrary'
import { listAdminMediaEntries } from '@/lib/admin-media'

export default async function AdminMediaPage() {
  const entries = await listAdminMediaEntries()
  const imageCount = entries.filter((entry) => entry.media.resourceType === 'image').length
  const videoCount = entries.filter((entry) => entry.media.resourceType === 'video').length
  const brokenCount = entries.filter((entry) => entry.broken).length

  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow mb-4">Medya Yönetimi</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Medya Merkezi</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">
          Tüm proje görsellerini ve video linklerini tek yerden filtreleyin, kırık kayıtları görün ve ilgili projeye hızla geçin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Toplam Medya</div>
          <div className="mt-3 text-4xl font-black text-foreground">{entries.length}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Görsel</div>
          <div className="mt-3 text-4xl font-black text-foreground">{imageCount}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Video</div>
          <div className="mt-3 text-4xl font-black text-foreground">{videoCount}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Kırık</div>
          <div className="mt-3 text-4xl font-black text-foreground">{brokenCount}</div>
        </div>
      </div>

      <AdminMediaLibrary entries={entries} />
    </div>
  )
}
