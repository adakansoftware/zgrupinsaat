"use client";

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import type { OperationDomain, OperationIssue, OperationSeverity } from '@/lib/admin-operations'

type Props = {
  issues: OperationIssue[]
  score: number
}

const domainLabels: Record<OperationDomain | 'all', string> = {
  all: 'Tüm alanlar',
  projects: 'Projeler',
  messages: 'Mesajlar',
  fleet: 'Filo',
  audit: 'Denetim',
}

const severityLabels: Record<OperationSeverity | 'all', string> = {
  all: 'Tüm seviyeler',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
}

export function AdminOperationsBoard({ issues, score }: Props) {
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<OperationDomain | 'all'>('all')
  const [severity, setSeverity] = useState<OperationSeverity | 'all'>('all')

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesDomain = domain === 'all' || issue.domain === domain
      const matchesSeverity = severity === 'all' || issue.severity === severity
      const haystack = [issue.title, issue.description, issue.stat, issue.domain].join(' ').toLocaleLowerCase('tr-TR')
      const matchesQuery = !query || haystack.includes(query.toLocaleLowerCase('tr-TR'))
      return matchesDomain && matchesSeverity && matchesQuery
    })
  }, [domain, issues, query, severity])

  return (
    <div className="admin-surface rounded-[32px] p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-display text-4xl text-foreground">Sorun Keşif Masası</h2>
          <div className="mt-2 text-sm text-foreground/45">Operasyon skoru: {score}/100</div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-foreground/35" />
            <input
              className="input-premium pl-11"
              placeholder="Sorun başlığı veya detay ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="input-premium" value={domain} onChange={(event) => setDomain(event.target.value as typeof domain)}>
            {Object.entries(domainLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select className="input-premium" value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}>
            {Object.entries(severityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="admin-surface-muted rounded-[24px] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-medium text-foreground">{issue.title}</div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      issue.severity === 'high'
                        ? 'bg-red-400/10 text-red-700'
                        : issue.severity === 'medium'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-sky-400/10 text-sky-300'
                    }`}
                  >
                    {severityLabels[issue.severity]}
                  </span>
                  <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/60">
                    {domainLabels[issue.domain]}
                  </span>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/60">{issue.description}</p>
                <div className="mt-4 text-sm text-foreground/45">{issue.stat}</div>
              </div>

              <Link href={issue.href} className="btn-ghost-premium inline-flex h-11 items-center gap-2 px-5">
                Aç
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-foreground/10 bg-background/20 p-10 text-center text-foreground/50">
            Bu filtrelerle eşleşen operasyon sorunu görünmüyor.
          </div>
        ) : null}
      </div>
    </div>
  )
}
