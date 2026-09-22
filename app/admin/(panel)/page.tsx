import Link from 'next/link'
import { ArrowRight, FolderKanban, ImageIcon, Mail, Star, Truck } from 'lucide-react'
import { getSiteAssetHealth } from '@/lib/asset-health'
import { getAdminIssueAnalytics } from '@/lib/admin-issue-analytics'
import { getAdminInsights } from '@/lib/admin-insights'
import { getAuditSummary, listAuditEntries } from '@/lib/audit-service'
import { getFleetContent } from '@/lib/fleet-service'
import { listAdminMessages } from '@/lib/message-service'
import { listAdminProjects } from '@/lib/project-service'
import { getSiteSettings } from '@/lib/settings-service'

function severityLabel(value: 'high' | 'medium' | 'low') {
  if (value === 'high') return 'Yüksek'
  if (value === 'medium') return 'Orta'
  return 'Düşük'
}

export default async function AdminDashboardPage() {
  const [projects, messages, settings, assetHealth, fleetContent, auditSummary, recentAudit, insights, issueAnalytics] = await Promise.all([
    listAdminProjects(),
    listAdminMessages(),
    getSiteSettings(),
    getSiteAssetHealth(),
    getFleetContent(),
    getAuditSummary(),
    listAuditEntries(6),
    getAdminInsights(),
    getAdminIssueAnalytics(),
  ])

  const mediaCount = projects.reduce((sum, project) => sum + project.media.length, 0)
  const featuredCount = projects.filter((project) => project.featured).length
  const unreadCount = messages.filter((item) => !item.isRead).length
  const publishedCount = projects.filter((project) => project.status === 'Yayında').length
  const draftCount = projects.length - publishedCount
  const projectsWithoutMedia = projects.filter((project) => project.media.length === 0).length
  const missingAssetCount = assetHealth.missingAssets.length
  const orphanUploadCount = assetHealth.orphanUploads.length
  const fleetCategoryCount = fleetContent.items.length
  const fleetModelCount = fleetContent.items.reduce((sum, item) => sum + item.models.length, 0)
  const fleetUnitCount = fleetContent.items.reduce((sum, item) => {
    const parsed = Number.parseInt(item.count, 10)
    return sum + (Number.isFinite(parsed) ? parsed : 0)
  }, 0)
  const issueSummary = issueAnalytics.summary

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-eyebrow mb-4">Yönetim Özeti</div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-7xl">Operasyon Paneli</h1>
          <p className="mt-3 max-w-3xl text-foreground/60">
            {settings.companyName} için içerik, medya, filo ve iletişim akışını tek merkezden daha güvenli yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new" className="btn-premium inline-flex h-12 items-center gap-2 px-6">
            Yeni Proje
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/operations" className="btn-ghost-premium inline-flex h-12 items-center px-6">Operasyon Masası</Link>
          <Link href="/admin/fleet" className="btn-ghost-premium inline-flex h-12 items-center px-6">Filo Yönetimi</Link>
          <Link href="/admin/projects" className="btn-ghost-premium inline-flex h-12 items-center px-6">İçerik Akışı</Link>
          <Link href="/admin/settings" className="btn-ghost-premium inline-flex h-12 items-center px-6">Ayarlar</Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="admin-kpi rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="data-label text-foreground/45">Toplam Proje</div>
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div className="stat-value mt-4 text-5xl text-foreground">{projects.length}</div>
        </div>
        <div className="admin-kpi rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="data-label text-foreground/45">Toplam Medya</div>
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="stat-value mt-4 text-5xl text-foreground">{mediaCount}</div>
        </div>
        <div className="admin-kpi rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="data-label text-foreground/45">Okunmamış</div>
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="stat-value mt-4 text-5xl text-foreground">{unreadCount}</div>
        </div>
        <div className="admin-kpi rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="data-label text-foreground/45">Öne Çıkan</div>
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div className="stat-value mt-4 text-5xl text-foreground">{featuredCount}</div>
        </div>
        <div className="admin-kpi rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="data-label text-foreground/45">Filo Kartları</div>
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="stat-value mt-4 text-5xl text-foreground">{fleetModelCount}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">İçerik Sağlığı</h2>
            <Link href="/admin/projects" className="text-primary hover:text-primary">Projelere Git</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Yayında</div>
              <div className="mt-3 text-3xl text-foreground">{publishedCount}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Taslak</div>
              <div className="mt-3 text-3xl text-foreground">{draftCount}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Medyasız</div>
              <div className="mt-3 text-3xl text-foreground">{projectsWithoutMedia}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Uyarı</div>
              <div className={`mt-3 text-3xl ${missingAssetCount || orphanUploadCount ? 'text-primary' : 'text-emerald-700'}`}>
                {missingAssetCount + orphanUploadCount}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="admin-surface-muted rounded-[24px] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-medium text-foreground">Eksik medya kayıtları</div>
                <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/55">{missingAssetCount}</span>
              </div>
              {assetHealth.missingAssets.length ? (
                <div className="space-y-3">
                  {assetHealth.missingAssets.slice(0, 5).map((issue) => (
                    <div key={`${issue.projectId}-${issue.kind}-${issue.fileUrl}`} className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm text-foreground/70">
                      <div className="font-medium text-foreground">{issue.projectTitle}</div>
                      <div className="mt-1 text-foreground/55">{issue.kind} • {issue.fileUrl}</div>
                    </div>
                  ))}
                  {assetHealth.missingAssets.length > 5 ? <div className="text-sm text-foreground/45">Toplam {assetHealth.missingAssets.length} bozuk medya referansı bulundu.</div> : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-4 text-sm text-emerald-800">
                  Yayın tarafında kırık `/images` veya `/uploads` referansı bulunmadı.
                </div>
              )}
            </div>

            <div className="admin-surface-muted rounded-[24px] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-medium text-foreground">Kullanılmayan upload dosyaları</div>
                <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/55">{orphanUploadCount}</span>
              </div>
              {assetHealth.orphanUploads.length ? (
                <div className="space-y-3">
                  {assetHealth.orphanUploads.slice(0, 5).map((fileUrl) => (
                    <div key={fileUrl} className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3 text-sm text-foreground/65">
                      {fileUrl}
                    </div>
                  ))}
                  {assetHealth.orphanUploads.length > 5 ? <div className="text-sm text-foreground/45">Toplam {assetHealth.orphanUploads.length} kullanılmayan upload dosyası var.</div> : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-4 text-sm text-emerald-800">
                  Yükleme klasöründe projelerden kopmuş dosya görünmüyor.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-surface rounded-[32px] p-6">
          <div className="data-label text-foreground/45">Operasyon Özeti</div>
          <div className="mt-3 text-2xl text-foreground">{settings.heroTitle}</div>
          <p className="mt-3 text-foreground/60">{settings.quoteNotice}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="admin-surface-muted rounded-2xl px-4 py-4">
              <div className="data-label text-foreground/40">Filo kategorisi</div>
              <div className="mt-2 text-2xl text-foreground">{fleetCategoryCount}</div>
            </div>
            <div className="admin-surface-muted rounded-2xl px-4 py-4">
              <div className="data-label text-foreground/40">Model kartı</div>
              <div className="mt-2 text-2xl text-foreground">{fleetModelCount}</div>
            </div>
            <div className="admin-surface-muted rounded-2xl px-4 py-4">
              <div className="data-label text-foreground/40">Toplam birim</div>
              <div className="mt-2 text-2xl text-foreground">{fleetUnitCount}</div>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <Link href="/admin/fleet" className="admin-surface-muted rounded-2xl px-4 py-3 text-foreground/75 transition hover:border-primary/20">
              Filo kartlarını yönet
            </Link>
            <Link href="/" className="admin-surface-muted rounded-2xl px-4 py-3 text-foreground/75 transition hover:border-primary/20">
              Anasayfayı aç
            </Link>
            <Link href="/projects" className="admin-surface-muted rounded-2xl px-4 py-3 text-foreground/75 transition hover:border-primary/20">
              Projeler sayfasını kontrol et
            </Link>
            <Link href="/contact" className="admin-surface-muted rounded-2xl px-4 py-3 text-foreground/75 transition hover:border-primary/20">
              İletişim akışına git
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-surface rounded-[32px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-4xl text-foreground">Öncelikli Aksiyonlar</h2>
          <Link href="/admin/insights" className="text-primary hover:text-primary">İçgörülere Git</Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {insights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="admin-surface-muted rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-medium text-foreground">{insight.title}</div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    insight.severity === 'high'
                      ? 'bg-red-400/10 text-red-700'
                      : insight.severity === 'medium'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-sky-400/10 text-sky-300'
                  }`}
                >
                  {severityLabel(insight.severity)}
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-foreground/60">{insight.description}</p>
              <div className="mt-4 text-sm text-foreground/45">{insight.stat}</div>
              <Link href={insight.href} className="mt-4 inline-flex text-sm font-medium text-primary transition hover:text-primary">
                Hemen aç
              </Link>
            </div>
          ))}
          {insights.length === 0 ? (
            <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-5 text-sm text-emerald-800 xl:col-span-3">
              Şu an dikkat gerektiren öncelikli admin aksiyonu görünmüyor.
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Takip Disiplini</h2>
            <Link href="/admin/operations" className="text-primary hover:text-primary">Operasyon Masası</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Takipte</div>
              <div className="mt-3 text-3xl text-foreground">{issueSummary.open + issueSummary.monitoring}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">48+ Saat</div>
              <div className={`mt-3 text-3xl ${issueSummary.staleOpen48h ? 'text-primary' : 'text-emerald-700'}`}>{issueSummary.staleOpen48h}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">SLA Kaçağı</div>
              <div className={`mt-3 text-3xl ${issueSummary.slaBreaches ? 'text-red-700' : 'text-emerald-700'}`}>{issueSummary.slaBreaches}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Yeniden Açılan</div>
              <div className={`mt-3 text-3xl ${issueSummary.reopened ? 'text-primary' : 'text-foreground'}`}>{issueSummary.reopened}</div>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-foreground/10 bg-background/20 p-4 text-sm text-foreground/60">
            Ortalama çözüm süresi {issueSummary.avgResolveHours > 0 ? `${Math.round(issueSummary.avgResolveHours)} saat` : 'henüz oluşmadı'}.
            7 günü aşan açık takip sayısı: <span className="text-foreground">{issueSummary.staleOpen7d}</span>.
          </div>
        </div>

        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Yaşlanan Issue Listesi</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">İçgörüler</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.watchlist.slice(0, 4).map((issue) => (
              <div key={issue.id} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-base font-medium text-foreground">{issue.title}</div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      issue.severity === 'high'
                        ? 'bg-red-400/10 text-red-700'
                        : issue.severity === 'medium'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-sky-400/10 text-sky-300'
                    }`}
                  >
                    {severityLabel(issue.severity)}
                  </span>
                  {issue.overSla ? <span className="rounded-full border border-red-400/20 bg-red-400/8 px-3 py-1 text-xs text-red-800">SLA Dışı</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-foreground/45">
                  <span>{Math.round(issue.ageHours)} saattir açık</span>
                  <span>{issue.status === 'monitoring' ? 'İzlemede' : 'Açık'}</span>
                  <span>Tekrar: {issue.reopenCount}</span>
                </div>
                <Link href={issue.href} className="mt-4 inline-flex text-sm font-medium text-primary transition hover:text-primary">
                  Issue&apos;ya Git
                </Link>
              </div>
            ))}
            {issueAnalytics.watchlist.length === 0 ? (
              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-5 text-sm text-emerald-800">
                Şu an yaşlanan açık issue görünmüyor.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Alan Basıncı</h2>
            <Link href="/admin/operations" className="text-primary hover:text-primary">Detaylı Operasyon</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {issueAnalytics.domainSummary.map((domain) => (
              <div key={domain.domain} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg text-foreground">
                    {domain.domain === 'projects'
                      ? 'Projeler'
                      : domain.domain === 'messages'
                        ? 'Mesajlar'
                        : domain.domain === 'fleet'
                          ? 'Filo'
                          : domain.domain === 'audit'
                            ? 'Denetim'
                            : 'İçgörüler'}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    domain.slaBreaches
                      ? 'bg-red-400/10 text-red-700'
                      : domain.active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-400/10 text-emerald-700'
                  }`}>
                    {domain.active} aktif
                  </span>
                </div>
                <div className="mt-3 text-sm text-foreground/45">{domain.tracked} takip • {domain.resolved} çözüldü</div>
                <div className="mt-2 text-sm text-foreground/45">SLA: {domain.slaBreaches} • Tekrar: {domain.reopened}</div>
                <div className="mt-2 text-sm text-foreground/45">
                  Ortalama yaş: {domain.avgAgeHours > 0 ? `${Math.round(domain.avgAgeHours)} saat` : '0 saat'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Son Issue Geçişleri</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">Takibi Aç</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.recentTransitions.map((entry) => (
              <div key={`${entry.issueId}-${entry.at}`} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-base font-medium text-foreground">{entry.title}</div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    entry.toStatus === 'resolved'
                      ? 'bg-emerald-400/10 text-emerald-700'
                      : entry.toStatus === 'monitoring'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-red-400/10 text-red-700'
                  }`}>
                    {entry.toStatus === 'resolved' ? 'Çözüldü' : entry.toStatus === 'monitoring' ? 'İzlemede' : 'Açık'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-foreground/45">
                  {new Date(entry.at).toLocaleString('tr-TR')} • {severityLabel(entry.severity)}
                </div>
                <div className="mt-2 text-sm text-foreground/60">
                  {entry.fromStatus ? `${entry.fromStatus} → ${entry.toStatus}` : `${entry.toStatus} olarak kayda girdi`}
                </div>
                <div className="mt-2 text-sm text-foreground/45">{entry.note || 'Not girilmedi'}</div>
                <Link href={entry.href} className="mt-3 inline-flex text-sm font-medium text-primary transition hover:text-primary">
                  Issue&apos;ya Git
                </Link>
              </div>
            ))}
            {issueAnalytics.recentTransitions.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-foreground/10 p-8 text-foreground/50">Henüz issue geçiş kaydı yok.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="admin-surface rounded-[32px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-4xl text-foreground">Filo Kısaltması</h2>
          <Link href="/admin/fleet" className="text-primary hover:text-primary">Filo Yönetimine Git</Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {fleetContent.items.slice(0, 3).map((item) => (
            <div key={item.slug} className="admin-surface-muted rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-medium text-foreground">{item.name}</div>
                <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/65">{item.models.length} model</span>
              </div>
              <div className="mt-2 text-sm text-foreground/45">{item.count} adet • {item.capacity}</div>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-foreground/60">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Denetim Özeti</h2>
            <Link href="/admin/activity" className="text-primary hover:text-primary">Tüm Kayıtlar</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Toplam Kayıt</div>
              <div className="mt-3 text-3xl text-foreground">{auditSummary.total}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">İşlem Türü</div>
              <div className="mt-3 text-3xl text-foreground">{auditSummary.uniqueActions}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Başarılı</div>
              <div className="mt-3 text-3xl text-emerald-700">{auditSummary.success}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Riskli</div>
              <div className="mt-3 text-3xl text-primary">{auditSummary.failure + auditSummary.rejected}</div>
            </div>
          </div>
        </div>

        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Son Panel Hareketleri</h2>
            <Link href="/admin/activity" className="text-primary hover:text-primary">Aktiviteye Git</Link>
          </div>
          <div className="space-y-4">
            {recentAudit.map((entry) => (
              <div key={`${entry.at}-${entry.action}-${entry.target || 'na'}`} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-base font-medium text-foreground">{entry.action}</div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      entry.status === 'success'
                        ? 'bg-emerald-400/10 text-emerald-700'
                        : entry.status === 'failure'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-red-400/10 text-red-700'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-foreground/45">{new Date(entry.at).toLocaleString('tr-TR')}</div>
                <div className="mt-3 text-sm text-foreground/65">
                  {entry.detail || entry.target || 'Ek detay yok'}
                </div>
              </div>
            ))}
            {recentAudit.length === 0 ? <div className="rounded-[24px] border border-dashed border-foreground/10 p-8 text-foreground/50">Henüz denetim kaydı yok.</div> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Son Projeler</h2>
            <Link href="/admin/projects" className="text-primary hover:text-primary">Tümünü Gör</Link>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="admin-surface-muted flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-medium text-foreground">{project.title}</div>
                  <div className="data-label mt-1 text-foreground/45">{project.category || 'Kategori yok'} • {project.media.length} medya • {project.status}</div>
                </div>
                <Link href={`/admin/projects/${project.id}`} className="btn-ghost-premium inline-flex h-10 items-center px-4">Düzenle</Link>
              </div>
            ))}
            {projects.length === 0 ? <div className="rounded-[24px] border border-dashed border-foreground/10 p-8 text-foreground/50">Henüz proje yok.</div> : null}
          </div>
        </div>

        <div className="space-y-8">
          <div className="admin-surface rounded-[32px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-4xl text-foreground">Son Mesajlar</h2>
              <Link href="/admin/messages" className="text-primary hover:text-primary">Tümünü Gör</Link>
            </div>
            <div className="space-y-4">
              {messages.slice(0, 4).map((message) => (
                <div key={message.id} className="admin-surface-muted rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-medium text-foreground">{message.name}</div>
                    <span className={`rounded-full px-2 py-1 text-xs ${message.isRead ? 'bg-foreground/10 text-foreground/60' : 'bg-primary/10 text-primary'}`}>
                      {message.isRead ? 'Okundu' : 'Yeni'}
                    </span>
                  </div>
                  <div className="data-label mt-2 text-foreground/45">{message.subject}</div>
                  <p className="mt-3 line-clamp-2 text-sm text-foreground/60">{message.message}</p>
                </div>
              ))}
              {messages.length === 0 ? <div className="rounded-[24px] border border-dashed border-foreground/10 p-6 text-foreground/50">Henüz mesaj yok.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
