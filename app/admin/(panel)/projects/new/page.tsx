import { ProjectForm } from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow mb-4">Yeni Kayıt</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Proje Oluştur</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">Yeni referans projesini temel bilgiler ve kapak görseliyle oluşturun.</p>
      </div>

      <div className="industrial-border max-w-4xl rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
        <ProjectForm mode="create" />
      </div>
    </div>
  )
}
