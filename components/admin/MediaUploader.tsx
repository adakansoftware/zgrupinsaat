"use client";

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function MediaUploader({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [imageTitle, setImageTitle] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [imageSortOrder, setImageSortOrder] = useState(0)
  const [imageIsCover, setImageIsCover] = useState(false)

  const [videoTitle, setVideoTitle] = useState('')
  const [videoSortOrder, setVideoSortOrder] = useState(0)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function saveMedia(payload: Record<string, unknown>, successMessage: string, reset: () => void) {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const saveRes = await fetch(`/api/projects/${projectId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const saveData = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        throw new Error(saveData.message || 'Medya eklenemedi.')
      }

      reset()
      toast.success(successMessage)
      router.refresh()
    } catch (mediaError) {
      const message = mediaError instanceof Error ? mediaError.message : 'Medya eklenemedi.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageAdd(event: React.FormEvent) {
    event.preventDefault()

    const nextImagePath = imagePath.trim()
    if (!nextImagePath) {
      const message = 'Görsel yolu girin.'
      setError(message)
      toast.error(message)
      return
    }

    await saveMedia(
      {
        title: imageTitle.trim() || 'Proje görseli',
        fileUrl: nextImagePath,
        fileType: 'image/jpeg',
        resourceType: 'image',
        thumbnailUrl: nextImagePath,
        isCover: imageIsCover,
        sortOrder: imageSortOrder,
      },
      'Görsel eklendi.',
      () => {
        setImageTitle('')
        setImagePath('')
        setImageSortOrder(0)
        setImageIsCover(false)
      },
    )
  }

  async function handleYouTubeAdd(event: React.FormEvent) {
    event.preventDefault()

    const nextYoutubeUrl = youtubeUrl.trim()
    if (!nextYoutubeUrl) {
      const message = 'YouTube bağlantısı girin.'
      setError(message)
      toast.error(message)
      return
    }

    await saveMedia(
      {
        title: videoTitle.trim() || 'YouTube videosu',
        fileUrl: nextYoutubeUrl,
        fileType: 'video/youtube',
        resourceType: 'video',
        thumbnailUrl: '',
        isCover: false,
        sortOrder: videoSortOrder,
      },
      'YouTube videosu eklendi.',
      () => {
        setVideoTitle('')
        setVideoSortOrder(0)
        setYoutubeUrl('')
      },
    )
  }

  return (
    <div aria-busy={loading} className="space-y-8">
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-[24px] border border-foreground/10 bg-background/20 p-4 text-sm leading-7 text-foreground/55">
        Doğrudan dosya yükleme bu kurulumda kapalıdır. Yine de adminden medya yönetebilirsin:
        görselleri `/images/...` veya `/uploads/...` yolu ile, videoları ise YouTube bağlantısı ile ekleyebilirsin.
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleImageAdd} className="rounded-[24px] border border-foreground/10 bg-background/20 p-5 space-y-5">
          <div>
            <div className="text-sm font-semibold text-foreground">Fotoğraf Ekle</div>
            <div className="mt-1 text-xs leading-6 text-foreground/45">
              Projede kullanmak istediğin görselin public yolunu ekle. Örnek: `/images/project-1.jpg`
            </div>
          </div>

          <input className="input-premium w-full" placeholder="Görsel başlığı" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} />

          <input
            className="input-premium w-full"
            placeholder="Görsel yolu: /images/... veya /uploads/..."
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <input
              type="number"
              className="input-premium w-full"
              placeholder="Sıra"
              value={imageSortOrder}
              onChange={(e) => setImageSortOrder(Number(e.target.value))}
            />
            <label className="admin-surface-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground/70">
              <input type="checkbox" checked={imageIsCover} onChange={(e) => setImageIsCover(e.target.checked)} />
              Kapak görseli olarak işaretle
            </label>
          </div>

          <button className="btn-premium h-12 px-6" type="submit" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Fotoğraf Ekle'}
          </button>
        </form>

        <form onSubmit={handleYouTubeAdd} className="rounded-[24px] border border-foreground/10 bg-background/20 p-5 space-y-5">
          <div>
            <div className="text-sm font-semibold text-foreground">Video Linki Ekle</div>
            <div className="mt-1 text-xs leading-6 text-foreground/45">
              Video dosyası yüklenmez. YouTube paylaşım bağlantısını girerek projeye video ekleyebilirsin.
            </div>
          </div>

          <input className="input-premium w-full" placeholder="Video başlığı" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <input
              className="input-premium w-full"
              placeholder="YouTube linki: https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <input
              type="number"
              className="input-premium w-full"
              placeholder="Sıra"
              value={videoSortOrder}
              onChange={(e) => setVideoSortOrder(Number(e.target.value))}
            />
          </div>

          <button className="btn-premium h-12 px-6" type="submit" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Video Linki Ekle'}
          </button>
        </form>
      </div>
    </div>
  )
}
