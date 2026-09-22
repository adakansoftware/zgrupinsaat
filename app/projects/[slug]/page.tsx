import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Calendar, CheckCircle2, Layers3, MapPin, Tags } from 'lucide-react'
import { CTASection } from '@/components/cta-section'
import { SiteFrame } from '@/components/site-frame'
import { YouTubeVideo } from '@/components/youtube-video'
import { buildProjectGallery, buildProjectHighlights, buildProjectScopes, findPublishedProjectBySlug } from '@/lib/project-service'
import { buildShareMetadata, getCanonicalUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/settings-service'

function formatProjectDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Güncel iş kaydı'

  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await findPublishedProjectBySlug(slug)

  if (!project) {
    return {
      title: 'İş Kaydı Bulunamadı',
    }
  }

  const description = project.summary || project.description

  return {
    title: {
      absolute: `${project.title} | Z GRUP İNŞAAT`,
    },
    description,
    alternates: {
      canonical: getCanonicalUrl(`/projects/${project.slug}`),
    },
    ...buildShareMetadata({
      title: project.title,
      description,
      pathname: `/projects/${project.slug}`,
      image: project.coverImage || '/images/project-1.jpg',
      type: 'article',
    }),
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()])
  const project = await findPublishedProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const gallery = buildProjectGallery(project)
  const featureMedia = gallery[0]
  const supportingMedia = gallery.slice(1, 5)
  const highlights = buildProjectHighlights(project)
  const scopes = buildProjectScopes(project)

  return (
    <SiteFrame settings={settings}>
      <section className="relative overflow-hidden pt-36 pb-18 lg:pt-44">
        <div className="absolute inset-0">
          <Image src={project.coverImage || '/images/project-1.jpg'} alt={`${project.title} - Z GRUP İNŞAAT proje görseli`} fill className="object-cover" priority quality={95} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/48" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/75" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent" />
        </div>

        <div className="pointer-events-none absolute right-[8%] bottom-0 h-56 w-56 rounded-full bg-primary/12 blur-[140px]" />
        <div className="pointer-events-none absolute top-20 left-[10%] h-40 w-40 rounded-full bg-primary/8 blur-[110px]" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
          <Link href="/projects" className="glass-surface mb-8 inline-flex h-12 items-center gap-3 px-5 text-sm font-semibold text-foreground">
            <ArrowLeft className="h-4 w-4 text-primary" />
            Tüm İşlere Dön
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_380px] lg:items-end">
            <div className="max-w-4xl">
              <div className="section-eyebrow mb-6">İş Detayı</div>
              <h1 className="break-words text-4xl leading-[0.95] font-black tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl xl:text-[5rem]">
                {project.title}
              </h1>
              <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-muted-foreground lg:text-xl">
                {project.summary || project.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="glass-surface inline-flex max-w-full items-center gap-2 px-4 py-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  {project.location || 'Türkiye'}
                </span>
                <span className="glass-surface inline-flex max-w-full items-center gap-2 px-4 py-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatProjectDate(project.updatedAt)}
                </span>
                <span className="glass-surface inline-flex max-w-full items-center gap-2 px-4 py-3">
                  <Tags className="h-4 w-4 text-primary" />
                  {project.category || 'Operasyon'}
                </span>
              </div>
            </div>

            <div className="glass-card p-7 lg:p-8">
              <div className="data-label text-foreground/45">İş Özeti</div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
                  <div className="stat-value text-3xl text-foreground">{Math.max(gallery.length, 1)}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-foreground/48">Saha Karesi</div>
                </div>
                <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-4">
                  <div className="stat-value text-3xl text-foreground">{scopes.length}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-foreground/48">Kapsam Başlığı</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-foreground/58">
                Saha görselleri, iş kapsamı ve uygulama notları birlikte sunulur.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="glass-card overflow-hidden">
              <div className="relative min-h-[380px] sm:min-h-[460px]">
                {featureMedia.resourceType === 'video' ? (
                  <YouTubeVideo url={featureMedia.fileUrl} title={featureMedia.title || project.title} className="h-full w-full" />
                ) : (
                  <Image src={featureMedia.fileUrl} alt={`${featureMedia.title || project.title} - Z GRUP İNŞAAT saha görseli`} fill className="object-cover" quality={95} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4">
                  <div>
                    <div className="section-eyebrow mb-3">Ana Görünüm</div>
                    <div className="break-words text-2xl font-black text-foreground lg:text-3xl">{featureMedia.title || project.title}</div>
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-foreground/15 bg-background/50 text-foreground backdrop-blur sm:flex">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-8">
                <div className="section-eyebrow mb-5">Saha Özeti</div>
                <h2 className="break-words text-3xl font-black text-foreground lg:text-4xl">İşin akışı; erişim, ekipman ve sevkiyat düzenine göre planlandı.</h2>
                <p className="mt-6 break-words text-base leading-8 text-muted-foreground">{project.description || project.summary}</p>
              </div>

              <div className="glass-card p-8">
                <div className="section-eyebrow mb-5">Çalışma Kapsamı</div>
                <div className="grid gap-3">
                  {scopes.map((scope) => (
                    <div key={scope} className="flex items-start gap-3 rounded-[22px] border border-foreground/8 bg-foreground/[0.03] px-4 py-4">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="text-sm leading-7 text-foreground/76">{scope}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden pb-18 lg:pb-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-eyebrow mb-4">Saha Görselleri</div>
              <h2 className="text-3xl font-black text-foreground lg:text-4xl">Çalışma alanından seçilen kareler</h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {supportingMedia.map((media, index) => (
              <div
                key={media.id}
                className={`group overflow-hidden rounded-[30px] border border-foreground/10 bg-card/85 ${
                  index === 0 ? 'lg:col-span-7' : index === 1 ? 'lg:col-span-5' : 'lg:col-span-6'
                }`}
              >
                <div className={`relative overflow-hidden ${index < 2 ? 'aspect-[16/10]' : 'aspect-[5/4]'}`}>
                  {media.resourceType === 'video' ? (
                    <YouTubeVideo url={media.fileUrl} title={media.title || project.title} className="h-full w-full" />
                  ) : (
                    <Image src={media.fileUrl} alt={`${media.title || project.title} - Z GRUP İNŞAAT saha çalışması`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/78 via-transparent to-transparent" />
                </div>
                <div className="p-5 lg:p-6">
                  <div className="break-words text-lg font-semibold text-foreground">{media.title || `${project.title} detay karesi`}</div>
                  <div className="mt-2 text-sm leading-7 text-foreground/55">{media.resourceType === 'video' ? 'Saha videosu' : 'Çalışma alanı görseli'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden pb-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="mb-10">
            <div className="section-eyebrow mb-4">İş Kapsamı</div>
            <h2 className="text-3xl font-black text-foreground lg:text-4xl">Sahadaki ihtiyacı özetleyen bilgi blokları</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="glass-card p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Layers3 className="h-5 w-5 text-primary" />
                </div>
                <div className="data-label text-foreground/45">{highlight.label}</div>
                <div className="mt-3 text-2xl font-black text-foreground">{highlight.value}</div>
                <p className="mt-4 text-sm leading-7 text-foreground/58">{highlight.note}</p>
              </div>
            ))}
          </div>

          {project.tags.length ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="max-w-full break-words rounded-full border border-foreground/10 bg-foreground/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <CTASection settings={settings} />
    </SiteFrame>
  )
}
