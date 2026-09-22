"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertTriangle, Images, Search, Video } from 'lucide-react'
import { DeleteMediaButton } from '@/components/admin/DeleteMediaButton'
import { YouTubeVideo } from '@/components/youtube-video'
import type { AdminMediaEntry } from '@/lib/admin-media'
import { getYouTubeWatchUrl } from '@/lib/youtube'

type Props = {
  entries: AdminMediaEntry[]
}

export function AdminMediaLibrary({ entries }: Props) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'image' | 'video'>('all')
  const [status, setStatus] = useState<'all' | 'Yayında' | 'Taslak'>('all')
  const [brokenOnly, setBrokenOnly] = useState(false)
  const [coverOnly, setCoverOnly] = useState(false)

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType = type === 'all' || entry.media.resourceType === type
      const matchesStatus = status === 'all' || entry.project.status === status
      const matchesBroken = !brokenOnly || entry.broken
      const matchesCover = !coverOnly || entry.media.isCover
      const haystack = [
        entry.media.title,
        entry.media.fileUrl,
        entry.project.title,
        entry.project.category,
        entry.project.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr-TR')
      const matchesQuery = !query || haystack.includes(query.toLocaleLowerCase('tr-TR'))

      return matchesType && matchesStatus && matchesBroken && matchesCover && matchesQuery
    })
  }, [brokenOnly, coverOnly, entries, query, status, type])

  const imageCount = filteredEntries.filter((entry) => entry.media.resourceType === 'image').length
  const videoCount = filteredEntries.filter((entry) => entry.media.resourceType === 'video').length
  const brokenCount = filteredEntries.filter((entry) => entry.broken).length

  return (
    <div className="space-y-6">
      <div className="admin-surface rounded-[28px] p-5">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr_0.7fr_auto_auto_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-foreground/35" />
            <input
              className="input-premium pl-11"
              placeholder="Medya adı, proje adı veya yol ara"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="input-premium" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
            <option value="all">Tüm tipler</option>
            <option value="image">Görseller</option>
            <option value="video">Videolar</option>
          </select>
          <select className="input-premium" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="all">Tüm durumlar</option>
            <option value="Yayında">Yayında</option>
            <option value="Taslak">Taslak</option>
          </select>
          <label className="admin-surface-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70">
            <input type="checkbox" checked={brokenOnly} onChange={(event) => setBrokenOnly(event.target.checked)} />
            Sadece kırık
          </label>
          <label className="admin-surface-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70">
            <input type="checkbox" checked={coverOnly} onChange={(event) => setCoverOnly(event.target.checked)} />
            Sadece kapak
          </label>
          <div className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/55">{filteredEntries.length} kayıt</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Görsel: {imageCount}</span>
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Video: {videoCount}</span>
          <span className="admin-surface-muted rounded-2xl px-4 py-3 text-sm text-foreground/65">Kırık: {brokenCount}</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredEntries.map((entry) => (
          <div key={entry.media.id} className="admin-surface-muted overflow-hidden rounded-[26px]">
            <div className="aspect-[4/3] overflow-hidden bg-background/40">
              {entry.media.resourceType === 'video' ? (
                <YouTubeVideo url={entry.media.fileUrl} title={entry.media.title || entry.project.title} className="h-full w-full" />
              ) : (
                <div className="relative h-full w-full">
                  <Image src={entry.media.fileUrl} alt={entry.media.title || entry.project.title} fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${entry.media.resourceType === 'video' ? 'bg-sky-400/10 text-sky-300' : 'bg-primary/10 text-primary'}`}>
                  {entry.media.resourceType === 'video' ? (
                    <span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><Images className="h-3 w-3" /> Görsel</span>
                  )}
                </span>
                {entry.media.isCover ? <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-700">Kapak</span> : null}
                {entry.broken ? (
                  <span className="rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-700 inline-flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Kırık
                  </span>
                ) : null}
              </div>

              <div className="mt-4 text-lg font-medium text-foreground">{entry.media.title || 'Başlıksız medya'}</div>
              <div className="mt-2 text-sm text-foreground/45">{entry.project.title} • {entry.project.status}</div>
              <div className="mt-3 line-clamp-2 break-all text-xs text-foreground/45">{entry.media.fileUrl}</div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/admin/projects/${entry.project.id}`} className="btn-ghost-premium inline-flex h-10 items-center px-4">
                  Projeye Git
                </Link>
                <a
                  href={entry.media.resourceType === 'video' ? getYouTubeWatchUrl(entry.media.fileUrl) : entry.media.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-premium inline-flex h-10 items-center px-4"
                >
                  Aç
                </a>
                <DeleteMediaButton mediaId={entry.media.id} />
              </div>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-foreground/10 bg-background/20 p-10 text-center text-foreground/50 md:col-span-2 xl:col-span-3">
            Bu filtrelerle eşleşen medya kaydı görünmüyor.
          </div>
        ) : null}
      </div>
    </div>
  )
}
