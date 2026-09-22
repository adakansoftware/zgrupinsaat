import Image from 'next/image'
import { notFound } from 'next/navigation'
import { DeleteMediaButton } from '@/components/admin/DeleteMediaButton'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'
import { MediaActions } from '@/components/admin/MediaActions'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { YouTubeVideo } from '@/components/youtube-video'
import { auditProjectAssets } from '@/lib/asset-health'
import { findAdminProjectById } from '@/lib/project-service'
import { getYouTubeWatchUrl } from '@/lib/youtube'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await findAdminProjectById(id)
  if (!project) return notFound()

  const assetIssues = await auditProjectAssets(project)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-eyebrow mb-4">Proje Detayı</div>
          <h1 className="break-words font-display text-4xl text-foreground sm:text-5xl md:text-6xl">{project.title}</h1>
          <div className="data-label mt-3 break-words text-foreground/45">{project.status} • {project.media.length} medya • {project.location || 'Lokasyon yok'}</div>
        </div>
        <DeleteProjectButton projectId={project.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="industrial-border rounded-[24px] bg-foreground/[0.04] p-5">
          <div className="data-label text-foreground/40">Kategori</div>
          <div className="mt-3 text-xl text-foreground">{project.category || 'Belirtilmedi'}</div>
        </div>
        <div className="industrial-border rounded-[24px] bg-foreground/[0.04] p-5">
          <div className="data-label text-foreground/40">Kapak Medya</div>
          <div className="mt-3 text-xl text-foreground">{project.coverImage ? 'Hazır' : 'Yok'}</div>
        </div>
        <div className="industrial-border rounded-[24px] bg-foreground/[0.04] p-5">
          <div className="data-label text-foreground/40">Etiket Sayısı</div>
          <div className="mt-3 text-xl text-foreground">{project.tags.length}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className={`rounded-[24px] border px-5 py-4 ${assetIssues.length ? 'border-primary/20 bg-primary/8 text-primary' : 'border-emerald-400/20 bg-emerald-400/8 text-emerald-900'}`}>
          <div className="text-sm font-medium">
            {assetIssues.length ? 'Bu projede yayın tarafında kırılabilecek medya referansları var.' : 'Bu proje için yayın medya referansları sağlıklı görünüyor.'}
          </div>
          {assetIssues.length ? (
            <div className="mt-2 space-y-1 text-sm text-foreground/70">
              {assetIssues.slice(0, 4).map((issue) => (
                <div key={`${issue.kind}-${issue.fileUrl}`}>{issue.kind} • {issue.fileUrl}</div>
              ))}
            </div>
          ) : null}
        </div>

        <a
          href={project.status === 'Yayında' ? `/projects/${project.slug}` : '/projects'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost-premium inline-flex h-12 items-center justify-center px-6"
        >
          Yayın Önizleme
        </a>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">Proje Bilgileri</h2>
          <div className="mt-6">
            <ProjectForm mode="edit" project={project} />
          </div>
        </div>

        <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">Medya Ekle</h2>
          <div className="mt-6">
            <MediaUploader projectId={project.id} />
          </div>
        </div>
      </div>

      <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">Yüklü Medyalar</h2>
          <div className="data-label text-foreground/45">Kapak seçimi ve sıralama buradan yönetilir</div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {project.media.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-background/40">
                {item.resourceType === 'video' ? (
                  <YouTubeVideo url={item.fileUrl} title={item.title || project.title} className="h-full w-full" />
                ) : (
                  <div className="relative h-full w-full">
                    <Image src={item.fileUrl} alt={item.title || project.title} fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-base font-medium text-foreground">{item.title || 'Başlıksız medya'}</div>
                  <div className="data-label mt-2 text-foreground/45">
                    {item.resourceType} • sıra {item.sortOrder} {item.isCover ? '• kapak' : ''}
                  </div>
                </div>
                <MediaActions mediaId={item.id} initialTitle={item.title || ''} initialSortOrder={item.sortOrder} initialIsCover={item.isCover} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <a href={item.resourceType === 'video' ? getYouTubeWatchUrl(item.fileUrl) : item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-primary">
                  Aç
                </a>
                <DeleteMediaButton mediaId={item.id} />
              </div>
            </div>
          ))}
          {project.media.length === 0 ? <div className="rounded-[24px] border border-dashed border-foreground/10 p-8 text-foreground/50">Bu projede henüz medya yok.</div> : null}
        </div>
      </div>
    </div>
  )
}
