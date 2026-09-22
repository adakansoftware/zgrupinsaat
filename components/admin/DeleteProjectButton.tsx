"use client";

import { useRouter } from 'next/navigation'
import { AdminDangerAction } from '@/components/admin/AdminDangerAction'

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || 'Silme işlemi tamamlanamadı.')
    }

    router.push('/admin/projects')
    router.refresh()
  }

  return (
    <AdminDangerAction
      triggerLabel="Projeyi Sil"
      title="Bu proje kalıcı olarak silinsin mi?"
      description="Projeye bağlı içerikler kaldırılır. Sadece başka bir yerde kullanılmayan yüklenen dosyalar temizlenir."
      confirmLabel="Projeyi Kalıcı Sil"
      onConfirm={handleDelete}
      className="btn-ghost-premium h-11 px-5 text-red-700"
    />
  )
}

