"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isRealPhoneValue, isRealWhatsAppUrl } from '@/lib/contact-utils'
import type { SiteSettings } from '@/lib/store'
import { siteQuickLinks } from '@/lib/site-content'

export function Navbar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const mobileToggleRef = useRef<HTMLInputElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const hasPhone = isRealPhoneValue(settings.contactPhone)
  const hasWhatsApp = isRealWhatsAppUrl(settings.whatsappUrl)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktopQuery.matches) closeMobileMenu()
    }

    closeOnDesktop()
    desktopQuery.addEventListener('change', closeOnDesktop)
    return () => desktopQuery.removeEventListener('change', closeOnDesktop)
  }, [])

  function closeMobileMenu() {
    if (mobileToggleRef.current) {
      mobileToggleRef.current.checked = false
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <input
        ref={mobileToggleRef}
        id="mobile-navigation-toggle"
        type="checkbox"
        className="peer/mobile-nav sr-only lg:hidden"
        aria-hidden="true"
        onChange={(event) => setIsMobileMenuOpen(event.currentTarget.checked)}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'border-b border-border/40 bg-background/95 backdrop-blur-xl' : 'bg-gradient-to-b from-background/80 to-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
          <nav className="flex h-20 items-center justify-between lg:h-24">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden">
                <Image
                  src="/images/z-grup-logo-small.png"
                  alt="Z GRUP İNŞAAT logo"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-lg font-bold uppercase tracking-tight text-foreground">{settings.companyName}</span>
              </div>
            </Link>

            <div className="hidden items-center gap-0 lg:flex">
              {siteQuickLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-1 left-5 right-5 h-0.5 origin-left bg-primary transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                )
              })}
            </div>

            <div className="hidden items-center gap-5 lg:flex">
              {hasPhone ? (
                <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{settings.contactPhone}</span>
                </a>
              ) : null}
              {hasWhatsApp ? (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp ile iletişime geç"
                  title="WhatsApp ile Yaz"
                  className="flex h-11 items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300/45 hover:bg-emerald-500/18 hover:text-emerald-800"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp ile Yaz</span>
                </a>
              ) : null}
              <Button asChild className="h-11 gap-2 bg-primary px-6 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">
                  Teklif Al
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <label
        htmlFor="mobile-navigation-toggle"
        role="button"
        tabIndex={0}
        className="fixed top-0 right-4 z-[100] flex h-20 w-14 touch-manipulation select-none items-center justify-center text-foreground [-webkit-tap-highlight-color:transparent] lg:hidden"
        aria-label="Menü"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            mobileToggleRef.current?.click()
          }
        }}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </label>

      <div
        id="mobile-navigation"
        className="invisible pointer-events-none fixed top-20 left-0 right-0 z-[60] max-h-[calc(100dvh-5rem)] -translate-y-2 overflow-y-auto border-b border-border bg-background opacity-0 transition-all duration-300 peer-checked/mobile-nav:visible peer-checked/mobile-nav:pointer-events-auto peer-checked/mobile-nav:translate-y-0 peer-checked/mobile-nav:opacity-100 lg:hidden"
      >
        <div className="space-y-1 px-6 py-6">
          {siteQuickLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                aria-current={isActive ? 'page' : undefined}
                className={`block px-4 py-3.5 text-base font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? 'bg-secondary/60 text-primary' : 'text-foreground hover:bg-secondary/50 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="mt-4 space-y-4 border-t border-border pt-6">
            {hasPhone ? (
              <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`} onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-semibold">{settings.contactPhone}</span>
              </a>
            ) : null}
            {hasWhatsApp ? (
              <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-emerald-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <span className="font-semibold">WhatsApp ile Yaz</span>
              </a>
            ) : null}
            <Button asChild className="h-12 w-full bg-primary font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
              <Link href="/contact" onClick={closeMobileMenu}>Teklif Al</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
