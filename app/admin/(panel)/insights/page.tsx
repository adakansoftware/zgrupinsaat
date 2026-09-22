import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { AdminIssueResolutionBoard } from '@/components/admin/AdminIssueResolutionBoard'
import { getSyncedAdminIssueStateMap } from '@/lib/admin-issue-tracker'
import { getAdminInsights, getAdminInsightsSummary } from '@/lib/admin-insights'

export default async function AdminInsightsPage() {
  const [insights, summary, issueStateMap] = await Promise.all([
    getAdminInsights(),
    getAdminInsightsSummary(),
    getSyncedAdminIssueStateMap(),
  ])

  const issueItems = insights.map((insight) => {
    const state = issueStateMap[insight.id]
    return {
      ...insight,
      status: state?.status ?? 'open',
      note: state?.note ?? '',
      updatedAt: state?.updatedAt,
    }
  })

  const resolutionSummary = {
    open: issueItems.filter((item) => item.status === 'open').length,
    monitoring: issueItems.filter((item) => item.status === 'monitoring').length,
    resolved: issueItems.filter((item) => item.status === 'resolved').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="section-eyebrow mb-4">Operasyon Uyarıları</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">İçgörüler</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">
          Panel, içerik ve filo verilerinden türetilen risk ve aksiyon noktalarını tek yerde toplayın.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Toplam Uyarı</div>
          <div className="mt-3 text-4xl text-foreground">{summary.total}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Yüksek</div>
          <div className="mt-3 text-4xl text-red-700">{summary.high}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Orta</div>
          <div className="mt-3 text-4xl text-primary">{summary.medium}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Düşük</div>
          <div className="mt-3 text-4xl text-sky-300">{summary.low}</div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Açık Takip</div>
          <div className="mt-3 text-4xl text-red-700">{resolutionSummary.open}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">İzlemede</div>
          <div className="mt-3 text-4xl text-primary">{resolutionSummary.monitoring}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Çözüldü</div>
          <div className="mt-3 text-4xl text-emerald-700">{resolutionSummary.resolved}</div>
        </div>
      </div>

      <AdminIssueResolutionBoard
        title="Aksiyon Listesi"
        description="Riskleri yalnızca görmek değil, çözüm durumu ve kısa operasyon notu ile takip etmek için bu alanı kullanın."
        issues={issueItems}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="text-2xl text-foreground">Neden Önemli?</h2>
          </div>
          <p className="text-sm leading-7 text-foreground/60">
            Bu alan yalnızca ham veriyi listelemek yerine, panelde birikmiş operasyon risklerini görünür kılar.
            Böylece hangi sayfaya önce müdahale etmeniz gerektiği daha net hale gelir.
          </p>
        </div>

        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl text-foreground">İleri Adım</h2>
          </div>
          <p className="text-sm leading-7 text-foreground/60">
            İçgörüler artık çözüm durumu ve takip notuyla saklanır; sonraki aşamada otomatik temizlik aksiyonları da eklenebilir.
          </p>
        </div>
      </div>
    </div>
  )
}
