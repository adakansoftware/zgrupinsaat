import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { serviceCards } from '@/lib/site-content'

export function ServicesSection() {
  return (
    <section id="hizmetler" className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Hizmet Kapsamı</span>
            <h2 className="text-3xl leading-tight font-black text-foreground sm:text-4xl lg:text-5xl">
              Kazıdan sevkiyata <span className="text-primary">kontrollü saha akışı</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Her iş aynı ekipmanla ve aynı tempoyla ilerlemez. Bu yüzden hizmetlerimizi sadece araç listesi olarak değil;
              saha erişimi, zemin yapısı, günlük iş hedefi ve sevkiyat ritmine göre şekillenen operasyon başlıkları olarak ele alıyoruz.
            </p>
          </div>
          <p className="max-w-md text-muted-foreground lg:text-right">
            Hafriyat, dolgu, damperli nakliyat, lowbed ve arazöz desteğini işin kapsamına göre planlıyor; makine, kamyon ve sevkiyat akışını sahadaki tempoya göre yönetiyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {serviceCards.map((service, index) => (
            <Link
              key={service.title}
              href={service.href}
              className={`group hover-lift relative cursor-pointer overflow-hidden border border-border/50 bg-card ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              aria-label={`${service.title} hizmetini incele`}
            >
              <div className={`relative w-full ${index === 0 ? 'h-full min-h-[400px] lg:min-h-[500px]' : 'h-56 lg:h-64'}`}>
                <Image
                  src={service.image}
                  alt={`${service.title} - Z GRUP İNŞAAT iş makinesi hizmetleri`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={index === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              <div className="absolute right-0 bottom-0 left-0 p-6 lg:p-8">
                <h3 className={`mb-2 font-bold text-foreground ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>{service.title}</h3>
                <p className={`mb-4 leading-relaxed text-muted-foreground ${index === 0 ? 'max-w-lg text-base' : 'text-sm'}`}>{service.description}</p>
                <div className="flex translate-y-2 items-center gap-2 text-sm font-semibold text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span>Detayları İncele</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
