import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getFleetHref, type FleetItem, type FleetStat } from '@/lib/fleet-service'

type FleetSectionProps = {
  items: FleetItem[]
  stats: FleetStat[]
}

export function FleetSection({ items, stats }: FleetSectionProps) {
  return (
    <section id="filo" className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Makine ve Nakliye Altyapısı</span>
          <h2 className="mb-6 text-3xl leading-tight font-black text-foreground sm:text-4xl lg:text-5xl">
            Sahaya göre kurulan <span className="text-primary">makine ve araç gücü</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Saha koşuluna, zemin durumuna ve sevkiyat ihtiyacına göre doğru makine, kamyon ve ekipman kombinasyonunu kurarak işin akışını koruyoruz.
          </p>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-border/40 bg-card p-6 text-center">
              <div className="mb-1 text-3xl font-black text-primary lg:text-4xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={getFleetHref(item.slug)}
              className="group hover-lift relative overflow-hidden border border-border/40 bg-card transition-colors hover:border-primary/50"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="relative h-64 w-full shrink-0 lg:h-auto lg:w-1/2">
                  <Image src={item.image} alt={`${item.name} - Z GRUP İNŞAAT iş makinesi ve araç filosu`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-background/80 lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent lg:hidden" />

                  <div className="absolute top-4 left-4 bg-primary px-4 py-2 text-primary-foreground">
                    <span className="text-2xl font-black">{item.count}</span>
                    <span className="ml-1 text-xs font-medium">Adet</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-6 lg:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black text-foreground lg:text-2xl">{item.name}</h3>
                    <span className="bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{item.capacity}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                      Detayı Gör
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <p className="mb-5 leading-relaxed text-muted-foreground">{item.description}</p>

                  <div>
                    <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Markalar</span>
                    <div className="flex flex-wrap gap-2">
                      {item.specs.map((spec) => (
                        <span key={spec} className="bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
