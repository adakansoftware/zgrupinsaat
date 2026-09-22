"use client";

import { useRouter } from 'next/navigation'
import { AdminDangerAction } from '@/components/admin/AdminDangerAction'

export function DeleteMediaButton({ mediaId }: { mediaId: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || 'Silme işlemi tamamlanamadı.')
    }

    router.refresh()
  }

  return (
    <AdminDangerAction
      triggerLabel="Sil"
      title="Bu medya kaydı silinsin mi?"
      description="Bu görsel veya video projeden kaldırılır. Kayıt başka bir yerde kullanılmıyorsa yüklenen dosya da temizlenir."
      confirmLabel="Medyayı Sil"
      onConfirm={handleDelete}
      className="rounded-full border border-red-400/20 px-3 py-1 text-sm text-red-700 transition hover:border-red-300/30 hover:text-red-800"
    />
  )
}

