import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PUBLIC_PHONE_TEL } from '@/lib/contact-details'
import { isRealPhoneValue } from '@/lib/contact-utils'
import type { SiteSettings } from '@/lib/store'

export function CTASection({ settings }: { settings: SiteSettings }) {
  const hasPhone = isRealPhoneValue(settings.contactPhone)

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0">
        <Image
          src="/images/cta-bg.jpg"
          alt="Hafriyat operasyonu"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
      </div>

      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">
              İş Kapsamını Netleştirelim
            </span>
            <h2 className="mb-6 text-3xl leading-tight font-black text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Hafriyat ve nakliyat ihtiyacınızı{' '}
              <span className="text-primary">sahaya uygun çalışma planına çevirelim</span>
            </h2>

            <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Konum, yaklaşık metraj, malzeme türü ve çalışma takvimini paylaşın; uygun makine, kamyon ve sevkiyat düzenini birlikte netleştirelim.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {hasPhone ? (
                <Button asChild size="lg" className="h-14 w-full gap-2 bg-primary px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 sm:w-auto">
                  <a href={PUBLIC_PHONE_TEL}>
                    <Phone className="h-5 w-5" />
                    Hemen Ara
                  </a>
                </Button>
              ) : null}
              <Button asChild size="lg" variant="outline" className="h-14 w-full gap-2 border-border/50 bg-secondary/30 px-8 text-sm font-bold uppercase tracking-wider text-foreground hover:bg-secondary/50 sm:w-auto">
                <Link href="/contact">
                  Teklif Talebi
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2">
            <div className="border border-border/40 bg-card/80 p-8 text-center backdrop-blur">
              <div className="mb-2 text-4xl font-black text-primary lg:text-5xl">25+</div>
              <div className="text-sm text-muted-foreground">Saha Deneyimi</div>
            </div>
            <div className="border border-border/40 bg-card/80 p-8 text-center backdrop-blur">
              <div className="mb-2 text-4xl font-black text-primary lg:text-5xl">7/24</div>
              <div className="text-sm text-muted-foreground">Saha Takibi</div>
            </div>
            <div className="border border-border/40 bg-card/80 p-8 text-center backdrop-blur">
              <div className="mb-2 text-4xl font-black text-primary lg:text-5xl">Planlı</div>
              <div className="text-sm text-muted-foreground">Planlı İş Akışı</div>
            </div>
            <div className="border border-border/40 bg-card/80 p-8 text-center backdrop-blur">
              <div className="mb-2 text-4xl font-black text-primary lg:text-5xl">30+</div>
              <div className="text-sm text-muted-foreground">Araç ve Makine</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
