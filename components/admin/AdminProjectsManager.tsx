"use client";

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Images, Search, Star } from 'lucide-react'
import type { Project } from '@/lib/store'

type SortKey = 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc'

function sortProjects(projects: Project[], sortKey: SortKey) {
  const sorted = [...projects]

  switch (sortKey) {
    case 'updated-asc':
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'tr'))
    case 'updated-desc':
    default:
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
}

function formatProjectDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Güncel değil' : date.toLocaleDateString('tr-TR')
}

export function AdminProjectsManager({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'Yayında' | 'Taslak'>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('updated-desc')

  const filteredProjects = useMemo(() => {
    const matched = projects.filter((project) => {
      const matchesQuery =
        !query ||
        [project.title, project.location, project.category, project.summary, ...project.tags]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())

      const matchesStatus = status === 'all' || project.status === status
      const matchesFeatured = !featuredOnly || project.featured

      return matchesQuery && matchesStatus && matchesFeatured
    })

    return sortProjects(matched, sortKey)
  }, [featuredOnly, projects, query, sortKey, status])

  const publishedCount = filteredProjects.filter((project) => project.status === 'Yayında').length
  const draftCount = filteredProjects.filter((project) => project.status === 'Taslak').length
  const totalMediaCount = filteredProjects.reduce((sum, project) => sum + project.media.length, 0)

  return (
    <div className="space-y-6">
      <div className="admin-surface rounded-[28px] p-5">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr_0.6fr_0.7fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-foreground/35" />
            <input
              className="input-premium pl-11"
              placeholder="Proje adı, konum veya etiket ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Projelerde ara"
            />
          </label>
          <select className="input-premium" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Proje durumuna göre filtrele">
            <option value="all">Tüm durumlar</option>
            <option value="Yayında">Yayında</option>
            <option value="Taslak">Taslak</option>
          </select>
          <select className="input-premium" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} aria-label="Projeleri sırala">
            <option value="updated-desc">En yeni güncelleme</option>
            <option value="updated-asc">En eski güncelleme</option>
            <option value="title-asc">Başlık A-Z</option>
            <option value="title-desc">Başlık Z-A</option>
          </select>
          <label className="admin-surface-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70">
            <input type="checkbox" checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} aria-label="Sadece öne çıkan projeleri göster" />
            Öne çıkanlar
          </label>
          <div className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/55">{filteredProjects.length} kayıt</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Yayında: {publishedCount}</span>
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Taslak: {draftCount}</span>
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Medya: {totalMediaCount}</span>
        </div>
      </div>

      <div className="admin-surface rounded-[32px] p-4 md:p-6">
        <div className="grid gap-4 pt-1">
          {filteredProjects.map((project) => (
            <div key={project.id} className="admin-surface-muted overflow-hidden rounded-[26px] transition hover:border-primary/20">
              <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="relative min-h-[220px]">
                  <Image
                    src={project.cardImage || project.coverImage || '/images/project-1.jpg'}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute right-4 bottom-4 left-4 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs ${project.status === 'Yayında' ? 'bg-emerald-400/10 text-emerald-700' : 'bg-foreground/10 text-foreground/70'}`}>
                      {project.status}
                    </span>
                    {project.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        <Star className="h-3 w-3" />
                        Öne Çıkan
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col p-5 lg:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-semibold text-foreground">{project.title}</h2>
                      <div className="mt-2 break-words text-sm text-foreground/45">
                        {project.category || 'Kategori yok'} • {project.location || 'Lokasyon yok'}
                      </div>
                    </div>

                    <Link href={`/admin/projects/${project.id}`} className="btn-ghost-premium inline-flex h-11 items-center px-5">
                      Düzenle
                    </Link>
                  </div>

                  {project.summary ? <p className="mt-4 max-w-3xl break-words text-sm leading-7 text-foreground/65">{project.summary}</p> : null}

                  <div className="mt-5 flex flex-wrap gap-3 text-xs text-foreground/55">
                    <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3 py-2">
                      <Images className="h-3.5 w-3.5 text-primary" />
                      {project.media.length} medya
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3 py-2">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {formatProjectDate(project.updatedAt)}
                    </span>
                  </div>

                  {project.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/65">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-foreground/10 bg-background/20 p-10 text-center text-foreground/50">
              Bu filtrelerle eşleşen proje bulunamadı.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
