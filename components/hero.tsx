import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isRealPhoneValue } from '@/lib/contact-utils'
import type { SiteSettings } from '@/lib/store'

const heroStats = [
  { value: '10+', label: 'Saha Tecrübesi' },
  { value: '7/24', label: 'Saha Takibi' },
  { value: '30+', label: 'Makine ve Kamyon' },
]

export function Hero({ settings }: { settings: SiteSettings }) {
  const [heroLead, ...heroRest] = settings.heroTitle.split(',')
  const heroAccent = heroRest.join(',').trim() || settings.companyShortName
  const hasPhone = isRealPhoneValue(settings.contactPhone)

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden lg:min-h-screen">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-main.jpg"
          alt="Z GRUP İNŞAAT temel kazısı ve hafriyat çalışması"
          fill
          className="scale-105 object-cover"
          priority
          quality={82}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/6 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/4 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-32 pb-24 lg:px-8 lg:pt-44 lg:pb-36">
        <div className="max-w-3xl overflow-visible">
          <h1 className="mb-8 overflow-visible pb-1 text-[2.75rem] leading-[1.08] font-black tracking-[-0.02em] text-foreground sm:text-5xl lg:text-6xl xl:text-[5.25rem]">
            <span className="block">{heroLead}</span>
            <span className="text-gradient mt-2 block overflow-visible pb-1">{heroAccent}</span>
          </h1>

          <p className="mb-12 max-w-xl text-lg leading-[1.7] font-light text-muted-foreground lg:text-xl">
            {settings.heroDescription}
            <span className="font-medium text-foreground"> {settings.quoteNotice}</span>
          </p>

          <div className="mb-20 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="glow-amber h-16 w-full gap-3 bg-primary px-6 text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 sm:w-auto sm:px-10">
              <Link href="/contact">
                Sahanız İçin Görüşelim
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            {hasPhone ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-16 w-full gap-3 border-border/30 bg-card/30 px-6 text-sm font-bold uppercase tracking-[0.1em] text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50 sm:w-auto sm:px-10"
              >
                <a href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}>
                  <Phone className="h-4 w-4" />
                  Telefonla Görüşün
                </a>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-8 lg:gap-0">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col pr-10 lg:pr-14 ${index !== heroStats.length - 1 ? 'lg:border-r lg:border-border/20' : ''} ${index !== 0 ? 'lg:pl-14' : ''}`}
              >
                <span className="text-4xl leading-none font-black tracking-tight text-foreground lg:text-5xl">{stat.value}</span>
                <span className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-muted-foreground">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Keşfet</span>
        <div className="relative h-12 w-px overflow-hidden bg-gradient-to-b from-primary/60 to-transparent">
          <div className="absolute h-4 w-full animate-bounce bg-primary" style={{ animationDuration: '1.5s' }} />
        </div>
      </div>

      <div className="absolute top-1/4 bottom-1/4 left-0 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-70">
        <div className="absolute inset-0 bg-primary blur-sm" />
      </div>

      <div className="absolute top-32 right-8 hidden flex-col items-end gap-2 text-muted-foreground/40 lg:right-16 lg:flex">
        <div className="h-px w-20 bg-gradient-to-l from-primary/40 to-transparent" />
        <span className="font-mono text-[10px] tracking-wider">EST. {settings.foundedYear}</span>
      </div>
    </section>
  )
}
