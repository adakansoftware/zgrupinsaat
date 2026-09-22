"use client";

import { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  initialValues: {
    companyName: string
    companyShortName: string
    contactPhone: string
    contactPhoneSecondary: string
    contactEmail: string
    contactEmailSecondary: string
    address: string
    serviceArea: string
    workingHours: string
    foundedYear: string
    instagramUrl: string
    whatsappUrl: string
    heroTitle: string
    heroDescription: string
    quoteNotice: string
  }
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-xs leading-6 text-foreground/45">{description}</div>
    </div>
  )
}

export function SettingsForm({ initialValues }: Props) {
  const [form, setForm] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setMessage('')
    setError('')

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      const message = data.message || 'Ayarlar kaydedilemedi.'
      setError(message)
      toast.error(message)
      return
    }

    setMessage('Ayarlar güncellendi.')
    toast.success('Ayarlar güncellendi.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
          <SectionHeader title="Marka Kimliği" description="Firma adı ve kısa marka bilgisini düzenleyin." />
          <div className="grid gap-4">
            <input className="input-premium w-full" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Firma adı" />
            <input className="input-premium w-full" value={form.companyShortName} onChange={(e) => update('companyShortName', e.target.value)} placeholder="Kısa marka adı" />
            <input className="input-premium w-full" value={form.foundedYear} onChange={(e) => update('foundedYear', e.target.value)} placeholder="Kuruluş yılı" />
          </div>
        </div>

        <div className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
          <SectionHeader title="İletişim Kanalları" description="Telefon ve e-posta bilgilerini güncelleyin." />
          <div className="grid gap-4">
            <input className="input-premium w-full" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} placeholder="Birincil telefon" />
            <input className="input-premium w-full" value={form.contactPhoneSecondary} onChange={(e) => update('contactPhoneSecondary', e.target.value)} placeholder="İkincil telefon" />
            <input className="input-premium w-full" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} placeholder="Birincil e-posta" />
            <input className="input-premium w-full" value={form.contactEmailSecondary} onChange={(e) => update('contactEmailSecondary', e.target.value)} placeholder="İkincil e-posta" />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
        <SectionHeader title="Operasyon ve Lokasyon" description="Adres, hizmet bölgesi ve çalışma saatlerini düzenleyin." />
        <div className="grid gap-4 md:grid-cols-3">
          <input className="input-premium w-full md:col-span-3" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Adres" />
          <input className="input-premium w-full" value={form.serviceArea} onChange={(e) => update('serviceArea', e.target.value)} placeholder="Hizmet bölgesi" />
          <input className="input-premium w-full" value={form.workingHours} onChange={(e) => update('workingHours', e.target.value)} placeholder="Çalışma saatleri" />
          <input className="input-premium w-full" value={form.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} placeholder="Instagram URL" />
          <input className="input-premium w-full md:col-span-2" value={form.whatsappUrl} onChange={(e) => update('whatsappUrl', e.target.value)} placeholder="WhatsApp URL" />
        </div>
      </div>

      <div className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
        <SectionHeader title="Hero ve Teklif Metinleri" description="Ana sayfa ve teklif alanında görünen metinleri düzenleyin." />
        <div className="grid gap-4">
          <textarea className="textarea-premium w-full" value={form.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} placeholder="Hero başlığı" />
          <textarea className="textarea-premium w-full" value={form.heroDescription} onChange={(e) => update('heroDescription', e.target.value)} placeholder="Hero açıklaması" />
          <textarea className="textarea-premium w-full" value={form.quoteNotice} onChange={(e) => update('quoteNotice', e.target.value)} placeholder="Teklif notu" />
        </div>
      </div>

      {error ? <p className="rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className="btn-premium h-12 px-6">
          {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </form>
  )
}
