import type { SiteSettings } from '@/lib/store'

export function AdminFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-10">
      <div className="admin-surface-muted rounded-[28px] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="data-label text-foreground/40">Panel Alt Bilgisi</div>
            <div className="mt-1 text-sm text-foreground/60">
              © {new Date().getFullYear()} {settings.companyName}. Tüm hakları saklıdır.
            </div>
          </div>
          <div className="text-sm text-foreground/55">
            Design by{' '}
            <a
              href="https://www.instagram.com/adakansoftware"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Adakan Software
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
