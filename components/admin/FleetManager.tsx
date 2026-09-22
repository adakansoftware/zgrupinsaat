"use client";

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import type { FleetContent } from '@/lib/fleet-service'

type Props = {
  initialContent: FleetContent
}

function createEmptyStat() {
  return { value: '', label: '' }
}

function createEmptyModel() {
  return { name: '', quantity: '', role: '', details: '', image: '' }
}

function createEmptyItem() {
  return {
    slug: '',
    name: '',
    count: '',
    modelCount: 1,
    capacity: '',
    description: '',
    specs: [''],
    image: '',
    detailTitle: '',
    detailDescription: '',
    models: [createEmptyModel()],
  }
}

function createSlug(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function FleetManager({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const summary = useMemo(() => {
    const itemCount = content.items.length
    const modelCount = content.items.reduce((sum, item) => sum + item.models.length, 0)
    const totalUnits = content.items.reduce((sum, item) => sum + Number.parseInt(item.count, 10) || sum, 0)
    return { itemCount, modelCount, totalUnits }
  }, [content])

  function updateStat(index: number, key: 'value' | 'label', value: string) {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.map((stat, statIndex) => (statIndex === index ? { ...stat, [key]: value } : stat)),
    }))
  }

  function updateItem(index: number, key: string, value: string | number | string[]) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item

        if (key === 'name') {
          const name = String(value)
          return {
            ...item,
            name,
            slug: item.slug || createSlug(name),
          }
        }

        return { ...item, [key]: value }
      }),
    }))
  }

  function updateSpec(itemIndex: number, specIndex: number, value: string) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? { ...item, specs: item.specs.map((spec, currentSpecIndex) => (currentSpecIndex === specIndex ? value : spec)) }
          : item,
      ),
    }))
  }

  function updateModel(itemIndex: number, modelIndex: number, key: string, value: string) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              models: item.models.map((model, currentModelIndex) => (currentModelIndex === modelIndex ? { ...model, [key]: value } : model)),
              modelCount: item.models.length,
            }
          : item,
      ),
    }))
  }

  function addStat() {
    setContent((prev) => ({ ...prev, stats: [...prev.stats, createEmptyStat()] }))
  }

  function removeStat(index: number) {
    setContent((prev) => ({ ...prev, stats: prev.stats.filter((_, statIndex) => statIndex !== index) }))
  }

  function addItem() {
    setContent((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }))
  }

  function removeItem(index: number) {
    setContent((prev) => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }))
  }

  function addSpec(itemIndex: number) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex ? { ...item, specs: [...item.specs, ''] } : item,
      ),
    }))
  }

  function removeSpec(itemIndex: number, specIndex: number) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? { ...item, specs: item.specs.filter((_, currentSpecIndex) => currentSpecIndex !== specIndex) }
          : item,
      ),
    }))
  }

  function addModel(itemIndex: number) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              models: [...item.models, createEmptyModel()],
              modelCount: item.models.length + 1,
            }
          : item,
      ),
    }))
  }

  function removeModel(itemIndex: number, modelIndex: number) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item, currentItemIndex) =>
        currentItemIndex === itemIndex
          ? {
              ...item,
              models: item.models.filter((_, currentModelIndex) => currentModelIndex !== modelIndex),
              modelCount: Math.max(0, item.models.length - 1),
            }
          : item,
      ),
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setMessage('')
    setError('')

    const normalized = {
      ...content,
      items: content.items.map((item) => ({
        ...item,
        slug: createSlug(item.slug || item.name),
        modelCount: item.models.length,
        specs: item.specs.filter((spec) => spec.trim().length > 0),
      })),
      stats: content.stats.filter((stat) => stat.label.trim().length > 0 || stat.value.trim().length > 0),
    }

    try {
      const response = await fetch('/api/fleet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const nextMessage = data.message || 'Filo kaydedilemedi.'
        setError(nextMessage)
        toast.error(nextMessage)
        return
      }

      setContent(data)
      setMessage('Filo verileri güncellendi.')
      toast.success('Filo verileri güncellendi.')
    } catch {
      const nextMessage = 'Kayıt sırasında bağlantı sorunu oluştu. Lütfen tekrar deneyin.'
      setError(nextMessage)
      toast.error(nextMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Kategori</div>
          <div className="mt-3 text-4xl text-foreground">{summary.itemCount}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Model Kartı</div>
          <div className="mt-3 text-4xl text-foreground">{summary.modelCount}</div>
        </div>
        <div className="admin-kpi rounded-[24px] p-5">
          <div className="data-label text-foreground/45">Toplam Adet</div>
          <div className="mt-3 text-4xl text-foreground">{summary.totalUnits}</div>
        </div>
      </div>

      <div className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Üst İstatistikler</div>
            <div className="mt-1 text-xs text-foreground/45">Filomuz sayfasındaki özet kutularını yönetin.</div>
          </div>
          <button type="button" onClick={addStat} className="btn-ghost-premium inline-flex h-11 items-center gap-2 px-4">
            <Plus className="h-4 w-4" />
            İstatistik Ekle
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-foreground/75">İstatistik {index + 1}</div>
                <button type="button" onClick={() => removeStat(index)} className="text-foreground/45 transition hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="input-premium" value={stat.value} onChange={(event) => updateStat(index, 'value', event.target.value)} placeholder="Değer" />
                <input className="input-premium" value={stat.label} onChange={(event) => updateStat(index, 'label', event.target.value)} placeholder="Etiket" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Filo Kategorileri</div>
            <div className="mt-1 text-xs text-foreground/45">Kart sayısı model sayısına göre otomatik eşitlenir.</div>
          </div>
          <button type="button" onClick={addItem} className="btn-premium inline-flex h-11 items-center gap-2 px-5">
            <Plus className="h-4 w-4" />
            Kategori Ekle
          </button>
        </div>

        {content.items.map((item, itemIndex) => (
          <section key={`${item.slug}-${itemIndex}`} className="rounded-[28px] border border-foreground/10 bg-background/20 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-foreground">{item.name || `Kategori ${itemIndex + 1}`}</div>
                <div className="mt-1 text-xs text-foreground/45">Slug: /fleet/{item.slug || createSlug(item.name) || 'kategori'}</div>
              </div>
              <button type="button" onClick={() => removeItem(itemIndex)} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/8 px-4 text-sm text-red-700">
                <Trash2 className="h-4 w-4" />
                Kategoriyi Sil
              </button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <input className="input-premium" value={item.name} onChange={(event) => updateItem(itemIndex, 'name', event.target.value)} placeholder="Kategori adı" />
              <input className="input-premium" value={item.slug} onChange={(event) => updateItem(itemIndex, 'slug', createSlug(event.target.value))} placeholder="Slug" />
              <input className="input-premium" value={item.count} onChange={(event) => updateItem(itemIndex, 'count', event.target.value)} placeholder="Toplam adet" />
              <input className="input-premium" value={item.capacity} onChange={(event) => updateItem(itemIndex, 'capacity', event.target.value)} placeholder="Kapasite / etiket" />
              <input className="input-premium xl:col-span-2" value={item.image} onChange={(event) => updateItem(itemIndex, 'image', event.target.value)} placeholder="Ana görsel yolu" />
              <textarea className="textarea-premium xl:col-span-2" value={item.description} onChange={(event) => updateItem(itemIndex, 'description', event.target.value)} placeholder="Kart açıklaması" />
              <input className="input-premium xl:col-span-2" value={item.detailTitle} onChange={(event) => updateItem(itemIndex, 'detailTitle', event.target.value)} placeholder="Detay başlığı" />
              <textarea className="textarea-premium xl:col-span-2" value={item.detailDescription} onChange={(event) => updateItem(itemIndex, 'detailDescription', event.target.value)} placeholder="Detay açıklaması" />
            </div>

            <div className="mt-5 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Etiketler</div>
                <button type="button" onClick={() => addSpec(itemIndex)} className="text-sm text-primary transition hover:text-primary">Etiket Ekle</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {item.specs.map((spec, specIndex) => (
                  <div key={`${item.slug}-spec-${specIndex}`} className="flex items-center gap-2">
                    <input className="input-premium" value={spec} onChange={(event) => updateSpec(itemIndex, specIndex, event.target.value)} placeholder="Etiket / marka" />
                    <button type="button" onClick={() => removeSpec(itemIndex, specIndex)} className="rounded-2xl border border-foreground/10 px-3 py-3 text-foreground/45 transition hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">Alt Model Kartları</div>
                  <div className="mt-1 text-xs text-foreground/45">Mevcut kart sayısı: {item.models.length}</div>
                </div>
                <button type="button" onClick={() => addModel(itemIndex)} className="btn-ghost-premium inline-flex h-10 items-center gap-2 px-4">
                  <Plus className="h-4 w-4" />
                  Model Ekle
                </button>
              </div>

              <div className="space-y-4">
                {item.models.map((model, modelIndex) => (
                  <div key={`${item.slug}-model-${modelIndex}`} className="rounded-2xl border border-foreground/10 bg-background/20 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm text-foreground/75">Model {modelIndex + 1}</div>
                      <button type="button" onClick={() => removeModel(itemIndex, modelIndex)} className="text-foreground/45 transition hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 xl:grid-cols-2">
                      <input className="input-premium" value={model.name} onChange={(event) => updateModel(itemIndex, modelIndex, 'name', event.target.value)} placeholder="Model adı" />
                      <input className="input-premium" value={model.quantity} onChange={(event) => updateModel(itemIndex, modelIndex, 'quantity', event.target.value)} placeholder="Adet etiketi" />
                      <input className="input-premium xl:col-span-2" value={model.role} onChange={(event) => updateModel(itemIndex, modelIndex, 'role', event.target.value)} placeholder="Rol / kısa etiket" />
                      <input className="input-premium xl:col-span-2" value={model.image ?? ''} onChange={(event) => updateModel(itemIndex, modelIndex, 'image', event.target.value)} placeholder="Model görsel yolu" />
                      <textarea className="textarea-premium xl:col-span-2" value={model.details} onChange={(event) => updateModel(itemIndex, modelIndex, 'details', event.target.value)} placeholder="Model açıklaması" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {error ? <p className="rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className="btn-premium h-12 px-6">
          {loading ? 'Kaydediliyor...' : 'Filo Değişikliklerini Kaydet'}
        </button>
      </div>
    </form>
  )
}
