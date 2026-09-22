import Image from 'next/image'
import { Shield, Clock, Users, Target, Wrench, TrendingUp, Check } from 'lucide-react'
import { certifications, whyChooseUsReasons } from '@/lib/site-content'

const reasonIcons = [Shield, Wrench, Clock, Users, Target, TrendingUp]

export function WhyUsSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="relative lg:col-span-2">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/about.jpg"
                alt="Z GRUP İNŞAAT ekibi"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="absolute -right-6 -bottom-6 max-w-xs border border-border/50 bg-card p-6 lg:-left-6 lg:right-auto">
              <div className="mb-2 text-4xl font-black text-primary">25+</div>
              <div className="text-sm text-muted-foreground">Yıllık Saha Deneyimi</div>
              <div className="mt-4 border-t border-border/50 pt-4">
                {certifications.slice(0, 2).map((cert) => (
                  <div key={cert} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">Çalışma Anlayışı</span>
            <h2 className="mb-6 text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Saha işinin <span className="text-primary">aksamadan ilerlemesi</span> için net ekip ve sevkiyat düzeni
            </h2>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Kazı, dolgu ve nakliyat işlerinde makine, kamyon ve saha ekibini aynı plan içinde tutarak bekleme, karışıklık ve gereksiz sefer riskini azaltıyoruz.
            </p>
            <p className="mb-10 max-w-2xl text-base leading-7 text-muted-foreground">
              Sahadaki verim çoğu zaman yalnızca güçlü ekipmandan değil, doğru sırayla ilerleyen operasyondan gelir. Bu yüzden işin başlangıcında kapsamı netleştiriyor, gün içinde değişen ihtiyaçlara hızlı cevap veriyor ve işi teslim temposunu bozmayacak şekilde takip ediyoruz.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {whyChooseUsReasons.map((reason, index) => {
                const Icon = reasonIcons[index]

                return (
                  <div key={reason.title} className="group flex items-start gap-4 border border-border/40 bg-card p-5 transition-colors hover:border-primary/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-bold text-foreground">{reason.title}</h3>
                        <span className="bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{reason.stat}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reason.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
