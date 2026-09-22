import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Calendar, MapPin } from 'lucide-react'
import type { Project } from '@/lib/store'

type ProjectsSectionProps = {
  projects: Project[]
}

function formatProjectDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Güncel' : String(date.getFullYear())
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const publishedProjects = projects.filter((project) => project.status === 'Yayında')
  const featuredProject = publishedProjects.find((project) => project.featured) || publishedProjects[0]
  const otherProjects = publishedProjects.filter((project) => project.id !== featuredProject?.id).slice(0, 3)

  return (
    <section id="projeler" className="relative overflow-hidden py-28 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="absolute inset-0 cinematic-gradient" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Saha İşleri</span>
            </div>
            <h2 className="text-4xl leading-[0.95] font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sahada yönetilen <span className="text-gradient">hafriyat ve nakliyat işleri</span>
            </h2>
          </div>
          <div className="lg:max-w-sm">
            <Link href="/projects" className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground lg:justify-end">
              <span>Saha işlerini incele</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </div>

        {featuredProject ? (
          <div className="grid gap-5 lg:grid-cols-5">
            <Link href={`/projects/${featuredProject.slug}`} className="group relative cursor-pointer overflow-hidden lg:col-span-3 lg:row-span-2">
              <div className="deep-shadow relative h-full min-h-[680px] sm:min-h-[550px] lg:min-h-full">
                <Image
                  src={featuredProject.cardImage || featuredProject.coverImage || '/images/project-1.jpg'}
                  alt={`${featuredProject.title} - Z GRUP İNŞAAT hafriyat çalışması`}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute top-0 left-0 h-24 w-24 bg-primary/10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              </div>

              <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8 lg:p-12">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">{featuredProject.category || 'Proje'}</span>
                  <span className="glass-surface px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground">{featuredProject.location || 'Türkiye'}</span>
                  <span className="glass-surface px-4 py-2 text-[11px] font-medium text-muted-foreground">{featuredProject.media.length || 1} medya</span>
                </div>

                <h3 className="mb-4 text-2xl leading-tight font-black text-foreground lg:text-4xl">{featuredProject.title}</h3>
                <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">{featuredProject.summary || featuredProject.description}</p>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{featuredProject.location || 'Türkiye'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatProjectDate(featuredProject.updatedAt)}</span>
                    </span>
                  </div>
                  <div className="glass-surface hidden h-12 w-12 translate-x-4 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:flex">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid gap-5 lg:col-span-2">
              {otherProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group hover-lift relative cursor-pointer overflow-hidden">
                  <div className="flex h-full flex-col border border-border/30 bg-card sm:flex-row">
                    <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44 lg:w-48">
                      <Image
                        src={project.cardImage || project.coverImage || '/images/project-2.jpg'}
                        alt={`${project.title} - Z GRUP İNŞAAT saha çalışması`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(min-width: 1024px) 192px, (min-width: 640px) 176px, 100vw"
                      />
                      <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-card/90 sm:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent sm:hidden" />
                      <span className="absolute top-3 left-3 bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">{project.category || 'Proje'}</span>
                    </div>

                    <div className="flex flex-1 flex-col justify-center p-5 lg:p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-bold text-primary">{project.location || 'Türkiye'}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-xs text-muted-foreground">{project.media.length || 1} medya</span>
                      </div>

                      <h3 className="mb-2 text-base leading-snug font-bold text-foreground transition-colors group-hover:text-primary lg:text-lg">{project.title}</h3>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.summary || project.description}</p>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary" />
                            {project.location || 'Türkiye'}
                          </span>
                          <span>{formatProjectDate(project.updatedAt)}</span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 -translate-x-2 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] border border-foreground/10 bg-foreground/[0.03] px-8 py-12 text-center text-foreground/58">
            Henüz yayında proje kaydı bulunmuyor.
          </div>
        )}
      </div>
    </section>
  )
}
