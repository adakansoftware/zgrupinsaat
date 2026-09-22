import Link from 'next/link'
import { AlertTriangle, FolderKanban, Mail, ShieldAlert, Truck } from 'lucide-react'
import { AdminIssueResolutionBoard } from '@/components/admin/AdminIssueResolutionBoard'
import { AdminOperationsBoard } from '@/components/admin/AdminOperationsBoard'
import { getAdminIssueAnalytics } from '@/lib/admin-issue-analytics'
import { getSyncedAdminIssueStateMap } from '@/lib/admin-issue-tracker'
import { getAdminOperationsCenter } from '@/lib/admin-operations'

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Tarih yok'
    : date.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
}

function scoreTone(score: number) {
  if (score >= 85) return 'text-emerald-700'
  if (score >= 65) return 'text-primary'
  return 'text-red-700'
}

function getDomainLabel(domain: 'projects' | 'messages' | 'fleet' | 'audit') {
  if (domain === 'projects') return 'Projeler'
  if (domain === 'messages') return 'Mesajlar'
  if (domain === 'fleet') return 'Filo'
  return 'Denetim'
}

function getAnalyticsDomainLabel(domain: 'projects' | 'messages' | 'fleet' | 'audit' | 'insights') {
  if (domain === 'insights') return 'İçgörüler'
  return getDomainLabel(domain)
}

export default async function AdminOperationsPage() {
  const [{ snapshot, issues, summary }, issueStateMap, issueAnalytics] = await Promise.all([
    getAdminOperationsCenter(),
    getSyncedAdminIssueStateMap(),
    getAdminIssueAnalytics(),
  ])

  const trackedIssues = issues.map((issue) => {
    const state = issueStateMap[issue.id]
    return {
      ...issue,
      domainLabel: getDomainLabel(issue.domain),
      status: state?.status ?? 'open',
      note: state?.note ?? '',
      updatedAt: state?.updatedAt,
    }
  })

  const cards = [
    {
      label: 'Proje Riski',
      value:
        snapshot.projectHealth.publishedWithoutMedia.length +
        snapshot.projectHealth.publishedWithoutSummary.length +
        snapshot.projectHealth.staleDrafts.length +
        snapshot.projectHealth.stalePublished.length,
      icon: FolderKanban,
    },
    {
      label: 'Mesaj Kuyruğu',
      value: snapshot.messageQueue.unread24h.length,
      icon: Mail,
    },
    {
      label: 'Filo Uyarısı',
      value:
        snapshot.fleetHealth.countMismatch.length +
        snapshot.fleetHealth.duplicateSpecs.length +
        snapshot.fleetHealth.missingImages.length,
      icon: Truck,
    },
    {
      label: 'Denetim Riski',
      value: snapshot.auditHealth.failedOrRejected7d.length,
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="section-eyebrow mb-4">Operasyon Masası</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Canlı Operasyon Durumu</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">
          Projeler, mesaj kuyruğu, filo bütünlüğü ve denetim kayıtları artık yalnızca sayıyla değil, filtrelenebilir sorun
          listesi ve operasyon skoru ile izlenir.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-kpi rounded-[24px] p-5">
              <div className="flex items-center justify-between">
                <div className="data-label text-foreground/45">{card.label}</div>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3 text-4xl text-foreground">{card.value}</div>
            </div>
          )
        })}
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Operasyon Skoru</div>
          <div className={`mt-3 text-4xl ${scoreTone(summary.score)}`}>{summary.score}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Odak Özeti</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">İçgörülere Git</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Toplam issue</div>
              <div className="mt-3 text-3xl text-foreground">{summary.total}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Yüksek öncelik</div>
              <div className="mt-3 text-3xl text-red-700">{summary.high}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Orta öncelik</div>
              <div className="mt-3 text-3xl text-primary">{summary.medium}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Düşük öncelik</div>
              <div className="mt-3 text-3xl text-sky-300">{summary.low}</div>
            </div>
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-4xl text-foreground">En Acil Sinyal</h2>
          </div>
          {issues[0] ? (
            <div className="rounded-[24px] border border-primary/15 bg-primary/8 p-5">
              <div className="text-xl text-foreground">{issues[0].title}</div>
              <p className="mt-3 text-sm leading-7 text-primary/90">{issues[0].description}</p>
              <div className="mt-4 text-sm text-primary/80">{issues[0].stat}</div>
              <Link href={issues[0].href} className="mt-4 inline-flex text-sm font-medium text-foreground transition hover:text-primary">
                Müdahaleye Git
              </Link>
            </div>
          ) : (
            <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-5 text-sm text-emerald-800">
              Şu an dikkat gerektiren operasyon sinyali görünmüyor.
            </div>
          )}
        </section>
      </div>

      <AdminOperationsBoard issues={issues} score={summary.score} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Operasyon Sağlığı</h2>
            <Link href="/admin" className="text-primary hover:text-primary">Dashboard</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Sağlık skoru</div>
              <div className={`mt-3 text-3xl ${scoreTone(issueAnalytics.summary.healthScore)}`}>{issueAnalytics.summary.healthScore}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">SLA kaçağı</div>
              <div className={`mt-3 text-3xl ${issueAnalytics.summary.slaBreaches ? 'text-red-700' : 'text-emerald-700'}`}>{issueAnalytics.summary.slaBreaches}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">7 günlük geçiş</div>
              <div className="mt-3 text-3xl text-foreground">{issueAnalytics.summary.transitionCount7d}</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Toparlanma</div>
              <div className={`mt-3 text-3xl ${issueAnalytics.focus.recoveryRate >= 100 ? 'text-emerald-700' : issueAnalytics.focus.recoveryRate >= 60 ? 'text-primary' : 'text-red-700'}`}>
                %{issueAnalytics.focus.recoveryRate}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-foreground/10 bg-background/20 p-4 text-sm text-foreground/60">
            En yoğun alan {issueAnalytics.focus.hottestDomain ? getAnalyticsDomainLabel(issueAnalytics.focus.hottestDomain) : 'yok'}.
            Baskı skoru: <span className="text-foreground">{issueAnalytics.focus.highestPressureCount}</span>.
          </div>
          <div className="mt-4 rounded-[24px] border border-foreground/10 bg-background/20 p-4 text-sm text-foreground/60">
            Haftalık yön {
              issueAnalytics.focus.weeklyDirection === 'up'
                ? 'yukarı'
                : issueAnalytics.focus.weeklyDirection === 'down'
                  ? 'aşağı'
                  : 'dengede'
            }.
            Fark: <span className="text-foreground">{issueAnalytics.focus.weeklyDelta}</span>. {issueAnalytics.focus.recommendation}
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">7 Günlük Akış</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">Takibi Aç</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.trend7d.map((item) => (
              <div key={item.dayKey} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-medium text-foreground">{new Date(item.dayKey).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</div>
                  <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/60">{item.updated + item.resolved} hareket</span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-foreground/45">
                  <div>Açılan: <span className="text-foreground">{item.opened}</span></div>
                  <div>Çözülen: <span className="text-foreground">{item.resolved}</span></div>
                  <div>Güncellenen: <span className="text-foreground">{item.updated}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Haftalık Kıyas</h2>
            <Link href="/admin" className="text-primary hover:text-primary">Genel Özet</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Yeni Açılan</div>
              <div className={`mt-3 text-3xl ${issueAnalytics.weeklyComparison.openedDelta > 0 ? 'text-red-700' : 'text-foreground'}`}>
                {issueAnalytics.weeklyComparison.currentOpened}
              </div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Çözülen</div>
              <div className={`mt-3 text-3xl ${issueAnalytics.weeklyComparison.resolvedDelta >= 0 ? 'text-emerald-700' : 'text-primary'}`}>
                {issueAnalytics.weeklyComparison.currentResolved}
              </div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Açılış Farkı</div>
              <div className={`mt-3 text-3xl ${issueAnalytics.weeklyComparison.openedDelta > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {issueAnalytics.weeklyComparison.openedDelta > 0 ? '+' : ''}{issueAnalytics.weeklyComparison.openedDelta}
              </div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="data-label text-foreground/40">Net Baskı</div>
              <div className={`mt-3 text-3xl ${
                issueAnalytics.weeklyComparison.netPressureDelta > 0
                  ? 'text-red-700'
                  : issueAnalytics.weeklyComparison.netPressureDelta < 0
                    ? 'text-emerald-700'
                    : 'text-foreground'
              }`}>
                {issueAnalytics.weeklyComparison.netPressureDelta > 0 ? '+' : ''}{issueAnalytics.weeklyComparison.netPressureDelta}
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-foreground/10 bg-background/20 p-4 text-sm text-foreground/60">
            Önceki 3 gün: {issueAnalytics.weeklyComparison.previousOpened} açılan / {issueAnalytics.weeklyComparison.previousResolved} çözülen.
            Son 3 gün momentumu {
              issueAnalytics.weeklyComparison.momentum === 'accelerating'
                ? ' hızlanıyor'
                : issueAnalytics.weeklyComparison.momentum === 'improving'
                  ? ' toparlanıyor'
                  : ' dengede'
            }.
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Alan Playbookları</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">İçgörüler</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.playbooks.slice(0, 4).map((playbook) => (
              <div key={playbook.domain} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-base font-medium text-foreground">{playbook.label}</div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    playbook.priority === 'critical'
                      ? 'bg-red-400/10 text-red-700'
                      : playbook.priority === 'watch'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-400/10 text-emerald-700'
                  }`}>
                    {playbook.priority === 'critical' ? 'Kritik' : playbook.priority === 'watch' ? 'İzle' : 'Stabil'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${scoreTone(playbook.healthScore)}`}>
                    {playbook.healthScore}/100
                  </span>
                </div>
                <div className="mt-3 text-sm text-foreground/45">
                  {playbook.issueCount} takip • {playbook.slaBreaches} SLA kaçağı
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground/60">{playbook.action}</p>
                <div className="mt-3 text-sm text-foreground/45">{playbook.reason}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Alan Momentumu</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">Takibi Aç</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.domainMomentum.slice(0, 4).map((item) => (
              <div key={item.domain} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-medium text-foreground">{item.label}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      item.momentum === 'accelerating'
                        ? 'bg-red-400/10 text-red-700'
                        : item.momentum === 'improving'
                          ? 'bg-emerald-400/10 text-emerald-700'
                          : 'bg-foreground/10 text-foreground/65'
                    }`}>
                      {item.momentum === 'accelerating' ? 'Yük artıyor' : item.momentum === 'improving' ? 'Toparlanıyor' : 'Dengede'}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs ${scoreTone(item.healthScore)}`}>{item.healthScore}/100</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-foreground/45 md:grid-cols-3">
                  <div>Son 3 gün: <span className="text-foreground">{item.currentOpened}</span> açık / <span className="text-foreground">{item.currentResolved}</span> çözüm</div>
                  <div>Önceki 3 gün: <span className="text-foreground">{item.previousOpened}</span> açık / <span className="text-foreground">{item.previousResolved}</span> çözüm</div>
                  <div>
                    Basınç farkı:{' '}
                    <span className={item.pressureDelta > 0 ? 'text-red-700' : item.pressureDelta < 0 ? 'text-emerald-700' : 'text-foreground'}>
                      {item.pressureDelta > 0 ? '+' : ''}{item.pressureDelta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Aksiyon Kuyruğu</h2>
            <Link href="/admin" className="text-primary hover:text-primary">Özet</Link>
          </div>
          <div className="space-y-4">
            {issueAnalytics.actionQueue.slice(0, 4).map((item) => (
              <div key={item.issueId} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-medium text-foreground">
                    {item.queueRank}. {item.title}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    item.riskScore >= 75
                      ? 'bg-red-400/10 text-red-700'
                      : item.riskScore >= 45
                        ? 'bg-primary/10 text-primary'
                        : 'bg-sky-400/10 text-sky-300'
                  }`}>
                    Risk {item.riskScore}
                  </span>
                </div>
                <div className="mt-2 text-sm text-foreground/45">
                  {getAnalyticsDomainLabel(item.domain)} • {item.ownerHint} • {item.status === 'monitoring' ? 'İzlemede' : 'Açık'}
                </div>
                <div className="mt-3 text-sm text-foreground">{item.actionLabel}</div>
                <p className="mt-2 text-sm leading-7 text-foreground/60">{item.rationale}</p>
                <Link href={item.href} className="mt-3 inline-flex text-sm font-medium text-primary transition hover:text-primary">
                  Müdahaleye Git
                </Link>
              </div>
            ))}
            {issueAnalytics.actionQueue.length === 0 ? (
              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-5 text-sm text-emerald-800">
                Aksiyon kuyruğuna düşen açık kayıt görünmüyor.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <AdminIssueResolutionBoard
        title="Çözüm Takibi"
        description="Filtrelenmiş sorun listesine ek olarak, her issue için müdahale durumu ve kısa not saklayın."
        issues={trackedIssues}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Alan Baskısı</h2>
            <Link href="/admin" className="text-primary hover:text-primary">Özet</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {issueAnalytics.domainSummary.map((domain) => (
              <div key={domain.domain} className="admin-surface-muted rounded-[24px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg text-foreground">{getAnalyticsDomainLabel(domain.domain)}</div>
                  <span className={`rounded-full px-3 py-1 text-xs ${scoreTone(domain.healthScore)}`}>
                    {domain.healthScore}/100
                  </span>
                </div>
                <div className="mt-3 text-sm text-foreground/45">{domain.tracked} takip • {domain.resolved} çözüldü</div>
                <div className="mt-2 text-sm text-foreground/45">Aktif: {domain.active} • SLA: {domain.slaBreaches}</div>
                <div className="mt-2 text-sm text-foreground/45">Tekrar: {domain.reopened} • Yaş: {domain.avgAgeHours > 0 ? `${Math.round(domain.avgAgeHours)} saat` : '0 saat'}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
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
                  {formatDate(entry.at)} • {getAnalyticsDomainLabel(entry.domain)}
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
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="admin-surface rounded-[32px] p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Müdahale Öneri Masası</h2>
            <Link href="/admin/insights" className="text-primary hover:text-primary">İçgörülere Git</Link>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {issueAnalytics.watchlist.slice(0, 3).map((issue) => (
              <div key={issue.id} className="admin-surface-muted rounded-[24px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-medium text-foreground">{issue.title}</div>
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    issue.riskScore >= 75
                      ? 'bg-red-400/10 text-red-700'
                      : issue.riskScore >= 45
                        ? 'bg-primary/10 text-primary'
                        : 'bg-sky-400/10 text-sky-300'
                  }`}>
                    Risk {issue.riskScore}
                  </span>
                </div>
                <div className="mt-3 text-sm text-foreground/45">
                  {getAnalyticsDomainLabel(issue.domain)} • {issue.status === 'monitoring' ? 'İzlemede' : 'Açık'} • {Math.round(issue.ageHours)} saat
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground/60">{issue.recommendation}</p>
                <Link href={issue.href} className="mt-4 inline-flex text-sm font-medium text-primary transition hover:text-primary">
                  Müdahaleye Git
                </Link>
              </div>
            ))}
            {issueAnalytics.watchlist.length === 0 ? (
              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-5 text-sm text-emerald-800 xl:col-span-3">
                Şu an öneri gerektiren açık issue görünmüyor.
              </div>
            ) : null}
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Mesaj Kuyruğu</h2>
            <Link href="/admin/messages" className="text-primary hover:text-primary">Mesajlara Git</Link>
          </div>
          <div className="space-y-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="text-lg text-foreground">24+ saat bekleyen</div>
              <div className="mt-2 text-sm text-foreground/45">{snapshot.messageQueue.unread24h.length} mesaj</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="text-lg text-foreground">72+ saat bekleyen</div>
              <div className="mt-2 text-sm text-foreground/45">{snapshot.messageQueue.unread72h.length} mesaj</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="text-lg text-foreground">7+ gün bekleyen</div>
              <div className="mt-2 text-sm text-foreground/45">{snapshot.messageQueue.unread7d.length} mesaj</div>
            </div>
            {snapshot.messageQueue.unread24h[0] ? (
              <div className="rounded-[24px] border border-primary/15 bg-primary/8 p-4 text-sm text-primary">
                En eski açık talep: {snapshot.messageQueue.unread24h[0].name} • {formatDate(snapshot.messageQueue.unread24h[0].createdAt)}
              </div>
            ) : null}
          </div>
        </section>

        <section className="admin-surface rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-4xl text-foreground">Denetim Riski</h2>
            <Link href="/admin/activity" className="text-primary hover:text-primary">Aktiviteye Git</Link>
          </div>
          <div className="space-y-4">
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="text-lg text-foreground">7 gündeki riskli kayıt</div>
              <div className="mt-2 text-sm text-foreground/45">{snapshot.auditHealth.failedOrRejected7d.length} kayıt</div>
            </div>
            <div className="admin-surface-muted rounded-[24px] p-4">
              <div className="text-lg text-foreground">Başarısız admin girişleri</div>
              <div className="mt-2 text-sm text-foreground/45">{snapshot.auditHealth.failedLogins7d.length} kayıt</div>
            </div>
            {snapshot.auditHealth.failedOrRejected7d[0] ? (
              <div className="rounded-[24px] border border-red-400/15 bg-red-400/8 p-4 text-sm text-red-900">
                Son riskli kayıt: {snapshot.auditHealth.failedOrRejected7d[0].action} • {formatDate(snapshot.auditHealth.failedOrRejected7d[0].at)}
              </div>
            ) : (
              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-4 text-sm text-emerald-800">
                Son 7 günde dikkat çeken başarısız veya reddedilen işlem görünmüyor.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
