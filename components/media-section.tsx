"use client"

import Image from 'next/image'
import { mediaGalleryItems } from '@/lib/site-content'

export function MediaSection() {
  return (
    <section id="medya" className="relative overflow-hidden bg-secondary/20 py-24 lg:py-32">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Saha Galerisi</span>
            <h2 className="text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Sahadan <span className="text-primary">gerçek çalışma kareleri</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground lg:text-right">
            Kazı, yükleme, dolgu ve sevkiyat akışını gösteren gerçek saha çalışmalarından seçilen kareler.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {mediaGalleryItems.map((item) => (
            <div key={item.title} className={`group relative cursor-pointer overflow-hidden ${item.tall ? 'row-span-2' : ''}`}>
              <div className={`relative w-full ${item.tall ? 'h-full min-h-[400px] lg:min-h-[500px]' : 'h-48 lg:h-64'}`}>
                <Image src={item.image} alt={`${item.title} - Z GRUP İNŞAAT saha çalışması`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                <div className="absolute right-0 bottom-0 left-0 translate-y-2 p-5 transition-transform duration-300 group-hover:translate-y-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.category}</span>
                  <h4 className="mt-1 text-base font-bold text-foreground lg:text-lg">{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
