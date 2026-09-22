import Link from 'next/link'
import { Bell, ExternalLink, Sparkles, TriangleAlert } from 'lucide-react'
import type { SiteSettings } from '@/lib/store'

type AdminTopbarProps = {
  settings: SiteSettings
  unreadCount: number
  alertCount: number
  issueHealthScore: number
  slaCount: number
  reopenedCount: number
}

function toneClass(score: number) {
  if (score >= 85) return 'text-emerald-700'
  if (score >= 65) return 'text-primary'
  return 'text-red-700'
}

export function AdminTopbar({ settings, unreadCount, alertCount, issueHealthScore, slaCount, reopenedCount }: AdminTopbarProps) {
  return (
    <div className="admin-surface sticky top-0 z-20 min-w-0 rounded-[28px] px-5 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="section-eyebrow mb-3">Kontrol Merkezi</div>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Yönetim Paneli</div>
          <p className="mt-2 max-w-2xl text-sm text-foreground/55">
            İçerik, medya, filo ve operasyon uyarılarını tek ekrandan daha hızlı yönetin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="admin-surface-muted min-w-0 rounded-2xl px-4 py-3">
            <div className="data-label text-foreground/40">Marka</div>
            <div className="mt-2 max-w-[180px] truncate text-sm text-foreground/80 sm:max-w-none">{settings.companyShortName}</div>
          </div>
          <div className="admin-surface-muted rounded-2xl px-4 py-3">
            <div className="data-label text-foreground/40">Sağlık Skoru</div>
            <div className={`mt-2 flex items-center gap-2 text-sm ${toneClass(issueHealthScore)}`}>
              <Sparkles className="h-4 w-4" />
              {issueHealthScore}/100
            </div>
          </div>
          <div className="admin-surface-muted rounded-2xl px-4 py-3">
            <div className="data-label text-foreground/40">Okunmamış</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
              <Bell className="h-4 w-4 text-primary" />
              {unreadCount} mesaj
            </div>
          </div>
          <Link href="/admin/operations" className="admin-surface-muted rounded-2xl px-4 py-3 transition hover:border-primary/20">
            <div className="data-label text-foreground/40">SLA</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
              <TriangleAlert className={`h-4 w-4 ${slaCount ? 'text-red-700' : 'text-emerald-700'}`} />
              {slaCount} kaçak • {reopenedCount} tekrar
            </div>
          </Link>
          <Link href="/admin/insights" className="admin-surface-muted rounded-2xl px-4 py-3 transition hover:border-primary/20">
            <div className="data-label text-foreground/40">Uyarı</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-foreground/80">
              <TriangleAlert className="h-4 w-4 text-primary" />
              {alertCount} kayıt
            </div>
          </Link>
          <Link href="/" className="btn-ghost-premium inline-flex h-[58px] items-center justify-center gap-2 px-5">
            Siteyi Gör
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
