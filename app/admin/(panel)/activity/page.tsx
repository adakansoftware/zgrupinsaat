import { AdminActivityFeed } from '@/components/admin/AdminActivityFeed'
import { getAuditSummary, listAuditEntries } from '@/lib/audit-service'

export default async function AdminActivityPage() {
  const [entries, summary] = await Promise.all([listAuditEntries(120), getAuditSummary()])

  return (
    <div className="space-y-6">
      <div>
        <div className="section-eyebrow mb-4">Denetim Akışı</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Panel Aktivitesi</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">
          Giriş denemeleri, içerik güncellemeleri ve yönetim işlemlerinin son kayıtlarını arama ve durum filtresiyle izleyin.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Toplam Kayıt</div>
          <div className="mt-3 text-4xl text-foreground">{summary.total}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Başarılı</div>
          <div className="mt-3 text-4xl text-emerald-700">{summary.success}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Başarısız</div>
          <div className="mt-3 text-4xl text-primary">{summary.failure}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Reddedilen</div>
          <div className="mt-3 text-4xl text-red-700">{summary.rejected}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">İşlem Türü</div>
          <div className="mt-3 text-4xl text-foreground">{summary.uniqueActions}</div>
        </div>
      </div>

      <AdminActivityFeed entries={entries} latestAt={summary.latestAt} />
    </div>
  )
}
