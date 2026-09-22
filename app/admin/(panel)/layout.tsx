import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminFooter } from '@/components/admin/AdminFooter'
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { getAdminIssueAnalytics } from '@/lib/admin-issue-analytics'
import { getAdminInsightsSummary } from '@/lib/admin-insights'
import { isAdminAuthenticated } from '@/lib/auth'
import { listAdminMessages } from '@/lib/message-service'
import { getSiteSettings } from '@/lib/settings-service'

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const [settings, messages, insightsSummary, issueAnalytics] = await Promise.all([
    getSiteSettings(),
    listAdminMessages(),
    getAdminInsightsSummary(),
    getAdminIssueAnalytics(),
  ])
  const unreadCount = messages.filter((item) => !item.isRead).length

  return (
    <div className="admin-panel-shell min-h-screen text-foreground">
      <div className="relative grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-foreground/8 bg-background/28 p-6 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <Link href="/admin" className="admin-surface block rounded-[30px] p-5 transition hover:border-primary/20">
            <div className="section-eyebrow mb-3">Yönetim Merkezi</div>
            <div className="break-words font-display text-[clamp(0.96rem,0.92rem+0.34vw,1.08rem)] leading-[1.1] tracking-[0.04em] text-foreground">
              {settings.companyShortName.toUpperCase()}
            </div>
            <div className="mt-3 break-words text-sm text-foreground/55">{settings.companyName}</div>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground/45">
              <span className="rounded-full border border-foreground/10 px-3 py-1">Canlı İçerik</span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">Admin</span>
            </div>
          </Link>

          <AdminSidebarNav unreadCount={unreadCount} />

          <div className="admin-surface-muted mt-8 rounded-[24px] p-5">
            <div className="data-label text-foreground/40">İletişim</div>
            <div className="mt-3 text-2xl text-foreground">Hazır</div>
            <p className="mt-2 break-words text-sm text-foreground/55">{settings.serviceArea}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/55">
              <span className="max-w-full break-all rounded-full border border-foreground/10 px-3 py-1">{settings.contactPhone}</span>
              <span className="max-w-full break-all rounded-full border border-foreground/10 px-3 py-1">{settings.contactEmail}</span>
            </div>
          </div>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </aside>

        <main className="flex min-h-screen min-w-0 flex-col p-4 md:p-8">
          <AdminTopbar
            settings={settings}
            unreadCount={unreadCount}
            alertCount={insightsSummary.total}
            issueHealthScore={issueAnalytics.summary.healthScore}
            slaCount={issueAnalytics.summary.slaBreaches}
            reopenedCount={issueAnalytics.summary.reopened}
          />
          <div className="flex-1 pt-6">
            <div className="admin-surface rounded-[28px] p-4 md:rounded-[34px] md:p-7">
              {children}
            </div>
          </div>
          <AdminFooter settings={settings} />
        </main>
      </div>
    </div>
  )
}
