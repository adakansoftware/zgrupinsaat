"use client";

import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, Ban, CheckCircle2, Search } from 'lucide-react'
import type { AuditEntry } from '@/lib/audit-service'

type Props = {
  entries: AuditEntry[]
  latestAt: string
}

function formatAuditDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Tarih yok'
    : date.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdminActivityFeed({ entries, latestAt }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | AuditEntry['status']>('all')

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus = status === 'all' || entry.status === status
      const haystack = [entry.action, entry.target, entry.detail, entry.ip].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR')
      const matchesQuery = !query || haystack.includes(query.toLocaleLowerCase('tr-TR'))
      return matchesStatus && matchesQuery
    })
  }, [entries, query, status])

  return (
    <div className="admin-surface rounded-[32px] p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-display text-4xl text-foreground">Son Kayıtlar</h2>
          <div className="mt-2 text-sm text-foreground/45">
            Son güncelleme: {latestAt ? formatAuditDate(latestAt) : 'Kayıt yok'}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-foreground/35" />
            <input
              className="input-premium pl-11"
              placeholder="İşlem, hedef veya IP ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="input-premium" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">Tüm durumlar</option>
            <option value="success">Başarılı</option>
            <option value="failure">Başarısız</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div key={`${entry.at}-${entry.action}-${entry.target || 'na'}`} className="admin-surface-muted rounded-[24px] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-medium text-foreground">{entry.action}</div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      entry.status === 'success'
                        ? 'bg-emerald-400/10 text-emerald-700'
                        : entry.status === 'failure'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-red-400/10 text-red-700'
                    }`}
                  >
                    {entry.status === 'success' ? 'Başarılı' : entry.status === 'failure' ? 'Başarısız' : 'Reddedildi'}
                  </span>
                </div>

                <div className="mt-2 text-sm text-foreground/45">{formatAuditDate(entry.at)}</div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3">
                    <div className="data-label text-foreground/35">IP</div>
                    <div className="mt-2 break-all text-sm text-foreground/70">{entry.ip || 'Yok'}</div>
                  </div>
                  <div className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3">
                    <div className="data-label text-foreground/35">Hedef</div>
                    <div className="mt-2 break-all text-sm text-foreground/70">{entry.target || 'Yok'}</div>
                  </div>
                  <div className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3">
                    <div className="data-label text-foreground/35">Detay</div>
                    <div className="mt-2 break-words text-sm text-foreground/70">{entry.detail || 'Yok'}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3">
                {entry.status === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                ) : entry.status === 'failure' ? (
                  <AlertTriangle className="h-5 w-5 text-primary" />
                ) : (
                  <Ban className="h-5 w-5 text-red-700" />
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-foreground/10 p-10 text-center text-foreground/50">
            <Activity className="mx-auto mb-4 h-6 w-6 text-foreground/35" />
            Bu filtrelerle eşleşen audit kaydı görünmüyor.
          </div>
        ) : null}
      </div>
    </div>
  )
}
