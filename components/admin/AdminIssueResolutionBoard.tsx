"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowUpRight, Clock3, LoaderCircle, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { InsightSeverity } from '@/lib/admin-insights'

type IssueStatus = 'open' | 'monitoring' | 'resolved'

export type AdminIssueResolutionItem = {
  id: string
  title: string
  description: string
  stat: string
  href: string
  severity: InsightSeverity
  domainLabel?: string
  status: IssueStatus
  note: string
  updatedAt?: string
}

type Props = {
  title: string
  description: string
  issues: AdminIssueResolutionItem[]
}

const severityLabels: Record<InsightSeverity, string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
}

const statusLabels: Record<IssueStatus, string> = {
  open: 'Açık',
  monitoring: 'İzlemede',
  resolved: 'Çözüldü',
}

const statusClasses: Record<IssueStatus, string> = {
  open: 'border-red-400/20 bg-red-400/8 text-red-800',
  monitoring: 'border-primary/20 bg-primary/8 text-primary',
  resolved: 'border-emerald-400/20 bg-emerald-400/8 text-emerald-800',
}

const severityClasses: Record<InsightSeverity, string> = {
  high: 'bg-red-400/10 text-red-700',
  medium: 'bg-primary/10 text-primary',
  low: 'bg-sky-400/10 text-sky-300',
}

function formatDate(value?: string) {
  if (!value) return 'Henüz güncellenmedi'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Henüz güncellenmedi'
    : date.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminIssueResolutionBoard({ title, description, issues }: Props) {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Record<string, { status: IssueStatus; note: string }>>(
    Object.fromEntries(issues.map((issue) => [issue.id, { status: issue.status, note: issue.note }]))
  )
  const [savingId, setSavingId] = useState<string | null>(null)

  function updateDraft(id: string, next: Partial<{ status: IssueStatus; note: string }>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        status: next.status ?? current[id]?.status ?? 'open',
        note: next.note ?? current[id]?.note ?? '',
      },
    }))
  }

  async function handleSave(id: string) {
    const draft = drafts[id]
    if (!draft || savingId) return

    setSavingId(id)

    try {
      const response = await fetch(`/api/admin-issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data.message || 'Çözüm durumu güncellenemedi.')
        return
      }

      toast.success('Çözüm takibi güncellendi.')
      router.refresh()
    } catch {
      toast.error('Çözüm takibi kaydedilirken bağlantı sorunu oluştu.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="admin-surface rounded-[32px] p-6">
      <div className="mb-5">
        <h2 className="font-display text-4xl text-foreground">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/60">{description}</p>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => {
          const draft = drafts[issue.id] ?? { status: issue.status, note: issue.note }
          const isSaving = savingId === issue.id

          return (
            <div key={issue.id} className="admin-surface-muted rounded-[24px] p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-lg font-medium text-foreground">{issue.title}</div>
                    <span className={`rounded-full px-3 py-1 text-xs ${severityClasses[issue.severity]}`}>
                      {severityLabels[issue.severity]}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusClasses[draft.status]}`}>
                      {statusLabels[draft.status]}
                    </span>
                    {issue.domainLabel ? (
                      <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/60">{issue.domainLabel}</span>
                    ) : null}
                  </div>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/60">{issue.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground/45">
                    <span>{issue.stat}</span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-foreground/30" />
                      {formatDate(issue.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-[220px_1fr]">
                    <select
                      className="input-premium"
                      value={draft.status}
                      onChange={(event) => updateDraft(issue.id, { status: event.target.value as IssueStatus })}
                      disabled={isSaving}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <textarea
                      className="input-premium min-h-[112px] resize-y py-3"
                      placeholder="Kısa çözüm notu veya takip bilgisi girin"
                      value={draft.note}
                      onChange={(event) => updateDraft(issue.id, { note: event.target.value })}
                      maxLength={500}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-3 xl:w-[190px]">
                  <Link href={issue.href} className="btn-ghost-premium inline-flex h-11 items-center justify-center gap-2 px-5">
                    İncele
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleSave(issue.id)}
                    disabled={isSaving}
                    className="btn-primary-premium inline-flex h-11 items-center justify-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Kaydediliyor' : 'Durumu Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {issues.length === 0 ? (
          <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 p-10 text-center text-emerald-800">
            Şu an takip gerektiren açık issue görünmüyor.
          </div>
        ) : null}
      </div>
    </section>
  )
}
