"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { isRealPhoneValue, isRealWhatsAppUrl } from '@/lib/contact-utils'
import type { SiteSettings } from '@/lib/store'

type ContactSectionProps = {
  settings: SiteSettings
  mapsEmbedUrl?: string
}

export function ContactSection({ settings, mapsEmbedUrl = '' }: ContactSectionProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Teklif Talebi',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)

  const [days, hours] = settings.workingHours.split('/').map((item) => item.trim())
  const hasPhone = isRealPhoneValue(settings.contactPhone)
  const hasSecondaryPhone = isRealPhoneValue(settings.contactPhoneSecondary)
  const hasWhatsApp = isRealWhatsAppUrl(settings.whatsappUrl)
  const hasMapsEmbed = mapsEmbedUrl.startsWith('https://')
  const contactInfo = [
    hasPhone ? { icon: Phone, label: 'Telefon', value: settings.contactPhone, subValue: hasSecondaryPhone ? settings.contactPhoneSecondary : '' } : null,
    { icon: Mail, label: 'E-posta', value: settings.contactEmail, subValue: settings.contactEmailSecondary },
    { icon: MapPin, label: 'Adres', value: settings.address, subValue: settings.serviceArea },
    { icon: Clock, label: 'Çalışma Saatleri', value: days || settings.workingHours, subValue: hours || '' },
  ].filter((item): item is { icon: typeof Phone; label: string; value: string; subValue: string } => Boolean(item))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setFeedback('')
    setError('')
    setReference('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message = data.message || 'Talebiniz şu anda gönderilemedi. Lütfen telefon veya WhatsApp üzerinden iletişime geçin.'
        setError(message)
        toast.error(message)
        return
      }

      const message = data.message || 'Talebiniz başarıyla iletildi. Saha bilgilerinizi inceleyip sizinle iletişime geçeceğiz.'
      setFeedback(message)
      setReference(data.reference || '')
      toast.success('Talebiniz iletildi.')
      setForm({
        name: '',
        phone: '',
        email: '',
        subject: 'Teklif Talebi',
        message: '',
      })
      setMarketingConsent(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="iletisim" className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-primary">İletişim</span>
          <h2 className="mb-6 text-3xl leading-tight font-black text-foreground sm:text-4xl lg:text-5xl">
            Sahanız için <span className="text-primary">net keşif ve doğru plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Saha lokasyonu, yaklaşık metraj, malzeme türü ve çalışma tarihini paylaşın; doğru makine, kamyon ve sevkiyat planını birlikte netleştirelim.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="glass-card p-8 lg:col-span-3 lg:p-10">
            <h3 className="mb-2 text-xl font-bold text-foreground">Keşif ve Teklif Formu</h3>
            <p className="mb-8 text-muted-foreground">{settings.quoteNotice}</p>

            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-foreground">Ad Soyad</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                    autoComplete="name"
                    className="w-full border border-border/50 bg-input px-4 py-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-2 block text-sm font-semibold text-foreground">Telefon</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="(5XX) XXX XX XX"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    required
                    autoComplete="tel"
                    className="w-full border border-border/50 bg-input px-4 py-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-foreground">E-posta</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                    autoComplete="email"
                    className="w-full border border-border/50 bg-input px-4 py-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-foreground">İş Kapsamı</label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Örn. Damperli nakliyat, temel kazısı, dolgu"
                    value={form.subject}
                    onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                    required
                    className="w-full border border-border/50 bg-input px-4 py-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-foreground">Saha Bilgisi</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Lokasyon, yaklaşık metraj, taşınacak malzeme, çalışma tarihi, giriş-çıkış durumu ve ihtiyaç duyulan ekipman hakkında kısa bilgi verin..."
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  required
                  className="w-full resize-none border border-border/50 bg-input px-4 py-3.5 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {error ? <p className="text-sm text-red-700" role="alert" aria-live="assertive">{error}</p> : null}
              {feedback ? <p className="text-sm text-emerald-700" role="status" aria-live="polite">{feedback}</p> : null}
              {reference ? (
                <p className="text-sm text-foreground/55" role="status" aria-live="polite">
                  Talep referansı: <span className="font-medium text-foreground">{reference}</span>
                </p>
              ) : null}

              <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-4 text-sm leading-7 text-foreground/60">
                Kişisel verileriniz, talebinizin değerlendirilmesi ve sizinle iletişime geçilmesi amacıyla işlenmektedir. Detaylı bilgi için{' '}
                <Link href="/kvkk-aydinlatma-metni" className="font-medium text-foreground underline decoration-foreground/20 underline-offset-4 transition hover:decoration-foreground">
                  KVKK Aydınlatma Metni&apos;ni
                </Link>{' '}
                inceleyebilirsiniz.
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-4 py-4 text-sm leading-6 text-foreground/65">
                <input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-1" />
                <span>Talebimle ilgili bilgilendirme, keşif ve teklif süreci için benimle iletişime geçilmesini kabul ediyorum.</span>
              </label>

              <Button size="lg" disabled={loading} className="h-14 w-full gap-2 bg-primary text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90">
                <Send className="h-4 w-4" />
                {loading ? 'Gönderiliyor...' : 'Keşif Talebi Gönder'}
              </Button>
            </form>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {contactInfo.map((info) => (
              <div key={info.label} className="glass-card p-6 transition-colors hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{info.label}</div>
                    {info.label === 'Telefon' ? (
                      <>
                        <a href={`tel:${String(info.value).replace(/\s+/g, '')}`} className="break-all font-semibold text-foreground transition-colors hover:text-primary">
                          {info.value}
                        </a>
                        {info.subValue ? (
                          <a href={`tel:${String(info.subValue).replace(/\s+/g, '')}`} className="block break-all text-sm text-muted-foreground transition-colors hover:text-primary">
                            {info.subValue}
                          </a>
                        ) : null}
                      </>
                    ) : info.label === 'E-posta' ? (
                      <>
                        <a href={`mailto:${info.value}`} className="break-all font-semibold text-foreground transition-colors hover:text-primary">
                          {info.value}
                        </a>
                        {info.subValue ? (
                          <a href={`mailto:${info.subValue}`} className="block break-all text-sm text-muted-foreground transition-colors hover:text-primary">
                            {info.subValue}
                          </a>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <div className="break-words font-semibold text-foreground">{info.value}</div>
                        <div className="break-words text-sm text-muted-foreground">{info.subValue}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="glass-card overflow-hidden p-0">
              {hasMapsEmbed ? (
                <div className="w-full">
                  <iframe
                    src={mapsEmbedUrl}
                    title="Z GRUP İNŞAAT konum haritası"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="aspect-[4/3] w-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Konum</div>
                  <div className="text-lg font-semibold text-foreground">{settings.address || 'Adana, Türkiye'}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{settings.serviceArea}</p>
                </div>
              )}
            </div>

            {hasWhatsApp ? (
              <div className="bg-primary p-6">
                <h4 className="mb-2 text-lg font-bold text-primary-foreground">Hızlı İletişim Hattı</h4>
                <p className="mb-4 text-sm text-primary-foreground/80">
                  Acil kazı, dolgu, hafriyat nakliyesi veya makine yönlendirmesi için doğrudan iletişime geçebilirsiniz.
                </p>
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between font-bold text-primary-foreground">
                  <span>WhatsApp ile Görüşün</span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
