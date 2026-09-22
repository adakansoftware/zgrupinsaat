"use client";

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function ToggleReadButton({ messageId, isRead }: { messageId: string; isRead: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle() {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message = data.message || 'Mesaj güncellenemedi.'
        setError(message)
        toast.error(message)
        return
      }

      toast.success(isRead ? 'Mesaj tekrar yeni olarak işaretlendi.' : 'Mesaj okundu olarak işaretlendi.')
      router.refresh()
    } catch {
      const message = 'Mesaj durumu güncellenirken bağlantı sorunu oluştu.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handleToggle} disabled={loading} className="btn-ghost-premium h-10 px-4">
        {loading ? '...' : isRead ? 'Yeniden Yeni Yap' : 'Okundu Yap'}
      </button>
      {error ? <div role="alert" aria-live="assertive" className="text-xs text-red-700">{error}</div> : null}
    </div>
  )
}
