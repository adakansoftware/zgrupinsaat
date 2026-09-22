import Link from 'next/link'
import { AdminProjectsManager } from '@/components/admin/AdminProjectsManager'
import { listAdminProjects } from '@/lib/project-service'

export default async function AdminProjectsPage() {
  const projects = await listAdminProjects()
  const publishedCount = projects.filter((project) => project.status === 'Yayında').length
  const featuredCount = projects.filter((project) => project.featured).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-eyebrow mb-4">Proje Yönetimi</div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Projeler</h1>
          <p className="mt-3 max-w-3xl text-foreground/60">
            Referans işlerinizi daha hızlı filtreleyin, görünürlüğünü takip edin ve medya düzenini tek akışta yönetin.
          </p>
        </div>
        <Link href="/admin/projects/new" className="btn-premium inline-flex h-12 items-center justify-center px-6">Yeni Proje Ekle</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Toplam Proje</div>
          <div className="mt-3 text-4xl font-black text-foreground">{projects.length}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Yayında</div>
          <div className="mt-3 text-4xl font-black text-foreground">{publishedCount}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/40">Öne Çıkan</div>
          <div className="mt-3 text-4xl font-black text-foreground">{featuredCount}</div>
        </div>
      </div>

      <AdminProjectsManager projects={projects} />
    </div>
  )
}
