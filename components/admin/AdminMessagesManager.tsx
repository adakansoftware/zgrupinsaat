"use client";

import { useMemo, useState } from 'react'
import { DeleteMessageButton } from '@/components/admin/DeleteMessageButton'
import { ToggleReadButton } from '@/components/admin/ToggleReadButton'
import type { AdminMessage } from '@/lib/store'

type SortKey = 'newest' | 'oldest' | 'name'

function sortMessages(messages: AdminMessage[], sortKey: SortKey) {
  const sorted = [...messages]

  switch (sortKey) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export function AdminMessagesManager({ messages }: { messages: AdminMessage[] }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<'all' | 'read' | 'unread'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('newest')

  const filteredMessages = useMemo(() => {
    const matched = messages.filter((message) => {
      const matchesQuery =
        !query ||
        [message.reference, message.name, message.email, message.phone, message.subject, message.message]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())

      const matchesState = state === 'all' || (state === 'read' ? message.isRead : !message.isRead)
      return matchesQuery && matchesState
    })

    return sortMessages(matched, sortKey)
  }, [messages, query, sortKey, state])

  const unreadCount = filteredMessages.filter((message) => !message.isRead).length

  return (
    <div className="space-y-6">
      <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.7fr_auto]">
          <input
            className="input-premium"
            placeholder="Referans, isim, konu veya iletişim bilgisi ara"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Mesajlarda ara"
          />
          <select className="input-premium" value={state} onChange={(event) => setState(event.target.value as typeof state)} aria-label="Mesaj durumuna göre filtrele">
            <option value="all">Tüm mesajlar</option>
            <option value="unread">Sadece yeni</option>
            <option value="read">Sadece okunan</option>
          </select>
          <select className="input-premium" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} aria-label="Mesajları sırala">
            <option value="newest">En yeni</option>
            <option value="oldest">En eski</option>
            <option value="name">İsim A-Z</option>
          </select>
          <div className="rounded-2xl border border-foreground/10 bg-background/20 px-4 py-3 text-sm text-foreground/55">{filteredMessages.length} kayıt</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/65">Yeni: {unreadCount}</span>
          <span className="rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/65">Toplam: {filteredMessages.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div key={message.id} className="industrial-border rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="break-words text-xl font-medium text-foreground">{message.name}</h2>
                  <span className="max-w-full break-all rounded-full border border-foreground/10 px-3 py-1 text-xs text-foreground/55">#{message.reference}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${message.isRead ? 'bg-foreground/10 text-foreground/60' : 'bg-primary/10 text-primary'}`}>
                    {message.isRead ? 'Okundu' : 'Yeni Mesaj'}
                  </span>
                </div>
                <div className="data-label break-words text-foreground/45">{message.subject} • {new Date(message.createdAt).toLocaleString('tr-TR')}</div>
                <div className="grid gap-2 text-sm text-foreground/60 md:grid-cols-2">
                  <div className="break-all">E-posta: {message.email || '-'}</div>
                  <div className="break-all">Telefon: {message.phone || '-'}</div>
                </div>
                <p className="max-w-4xl whitespace-pre-wrap break-words text-foreground/75">{message.message}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ToggleReadButton messageId={message.id} isRead={message.isRead} />
                <DeleteMessageButton messageId={message.id} />
              </div>
            </div>
          </div>
        ))}
        {filteredMessages.length === 0 ? (
          <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-10 text-center text-foreground/50">
            Arama veya filtre sonucunda gösterilecek mesaj bulunamadı.
          </div>
        ) : null}
      </div>
    </div>
  )
}
