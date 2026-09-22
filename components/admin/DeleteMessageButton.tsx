"use client";

import { useRouter } from 'next/navigation'
import { AdminDangerAction } from '@/components/admin/AdminDangerAction'

export function DeleteMessageButton({ messageId }: { messageId: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || 'Mesaj silinemedi.')
    }

    router.refresh()
  }

  return (
    <AdminDangerAction
      triggerLabel="Sil"
      title="Bu mesaj kaydı silinsin mi?"
      description="Mesaj geçmişten kaldırılır. Bu işlem geri alınamaz."
      confirmLabel="Mesajı Sil"
      onConfirm={handleDelete}
      className="rounded-full border border-red-400/20 px-3 py-1 text-sm text-red-700 transition hover:border-red-300/30 hover:text-red-800"
    />
  )
}
