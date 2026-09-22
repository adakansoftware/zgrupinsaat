import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { isRealPhoneValue } from '@/lib/contact-utils'
import type { SiteSettings } from '@/lib/store'
import { footerServiceLinks, siteQuickLinks } from '@/lib/site-content'

export function Footer({ settings }: { settings: SiteSettings }) {
  const hasPhone = isRealPhoneValue(settings.contactPhone)
  const hasSecondaryPhone = isRealPhoneValue(settings.contactPhoneSecondary)

  return (
    <footer className="relative overflow-hidden border-t border-border/30 bg-card">
      <div className="pointer-events-none absolute inset-0 cinematic-gradient opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-8 lg:py-20">
        <div className="relative z-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-6 flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-14 shrink-0 items-center justify-center overflow-visible">
                <Image
                  src="/images/z-grup-logo-small.png"
                  alt="Z GRUP İNŞAAT logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="break-words text-lg font-bold uppercase text-foreground">{settings.companyName}</span>
                <span className="break-words text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{settings.serviceArea}</span>
              </div>
            </Link>

            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{settings.heroDescription}</p>

            {settings.instagramUrl ? (
              <div className="flex gap-2">
                <a
                  href={settings.instagramUrl}
                  aria-label="Instagram"
                  title="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/45 hover:bg-primary/18 hover:text-primary"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Hızlı Erişim</h4>
            <ul className="space-y-3">
              {siteQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/kvkk-aydinlatma-metni" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">Hizmetlerimiz</h4>
            <ul className="space-y-3">
              {footerServiceLinks.map((service) => (
                <li key={service.href}>
                  <Link href={service.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground">İletişim</h4>
            <ul className="space-y-4">
              {hasPhone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`} className="break-all text-sm font-medium text-foreground transition-colors hover:text-primary">
                      {settings.contactPhone}
                    </a>
                    {hasSecondaryPhone ? (
                      <a href={`tel:${settings.contactPhoneSecondary.replace(/\s+/g, '')}`} className="block break-all text-sm text-muted-foreground transition-colors hover:text-primary">
                        {settings.contactPhoneSecondary}
                      </a>
                    ) : null}
                  </div>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <a href={`mailto:${settings.contactEmail}`} className="break-all text-sm font-medium text-foreground transition-colors hover:text-primary">
                    {settings.contactEmail}
                  </a>
                  {settings.contactEmailSecondary ? (
                    <a href={`mailto:${settings.contactEmailSecondary}`} className="block break-all text-sm text-muted-foreground transition-colors hover:text-primary">
                      {settings.contactEmailSecondary}
                    </a>
                  ) : null}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="break-words text-sm font-medium text-foreground">{settings.address}</div>
                  <div className="break-words text-sm text-muted-foreground">{settings.serviceArea}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-border/30">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} {settings.companyName}. Tüm hakları saklıdır.</div>
          <div className="break-words text-xs text-muted-foreground">
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
