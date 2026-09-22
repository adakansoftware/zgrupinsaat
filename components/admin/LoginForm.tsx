"use client";

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const MIN_LOGIN_LOADING_MS = 1000

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function LoginForm({ nextPath = '/admin' }: { nextPath?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')
    const startedAt = Date.now()

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message = data.message || 'Giriş bilgileri doğrulanamadı.'
        setError(message)
        toast.error(message)
        return
      }

      const elapsed = Date.now() - startedAt
      if (elapsed < MIN_LOGIN_LOADING_MS) {
        await wait(MIN_LOGIN_LOADING_MS - elapsed)
      }

      toast.success('Giriş başarılı.')
      router.push(nextPath)
      router.refresh()
    } catch {
      const message = 'Bağlantı kurulurken bir sorun oluştu. Lütfen tekrar deneyin.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="industrial-border premium-shadow w-full max-w-md rounded-[30px] bg-foreground/[0.045] p-8 md:p-9">
      <div className="brand-logo-pulse relative mb-6 h-14 w-20 overflow-hidden bg-background">
        <Image
          src="/images/z-grup-logo-small.png"
          alt="Z GRUP logo"
          fill
          sizes="80px"
          className="object-contain"
        />
      </div>
      <div className="section-eyebrow mb-4">Admin girişi</div>
      <h1 className="font-display text-5xl text-foreground">Yönetim Paneli</h1>
      <p className="mt-3 text-foreground/60">Yalnızca yetkili kullanıcılar için güvenli giriş alanı.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-foreground/70">E-posta</label>
          <input
            id="admin-email"
            type="email"
            className="input-premium w-full"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-foreground/70">Şifre</label>
          <input
            id="admin-password"
            type="password"
            className="input-premium w-full"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {error ? <p role="alert" aria-live="assertive" className="mt-4 rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <button type="submit" disabled={loading} className="btn-premium mt-6 h-12 w-full px-6">
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </form>
  )
}
