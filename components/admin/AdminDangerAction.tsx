"use client";

import { type MouseEvent, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type AdminDangerActionProps = {
  triggerLabel: string
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  className?: string
}

export function AdminDangerAction({
  triggerLabel,
  title,
  description,
  confirmLabel,
  onConfirm,
  className = '',
}: AdminDangerActionProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    try {
      await onConfirm()
      setOpen(false)
      toast.success('İşlem tamamlandı.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İşlem tamamlanamadı.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className={className} type="button">
          {triggerLabel}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full max-w-xl rounded-[28px] border border-foreground/10 bg-card p-0 text-foreground shadow-[0_24px_80px_-28px_rgba(0,0,0,0.8)]">
        <div className="rounded-[28px] border border-foreground/8 bg-foreground/[0.025] p-7">
          <AlertDialogHeader className="text-left">
            <div className="section-eyebrow mb-3">Onay gerekli</div>
            <AlertDialogTitle className="font-display text-3xl text-foreground">{title}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm leading-7 text-foreground/60">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <div role="alert" className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <AlertDialogFooter className="mt-7">
            <AlertDialogCancel className="h-11 rounded-2xl border-foreground/10 bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.06]">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              className="btn-premium h-11 rounded-2xl border-primary/30 bg-[linear-gradient(135deg,rgba(144,6,0,0.92),rgba(115,5,0,0.94))] px-5 text-[0.75rem] text-primary-foreground hover:brightness-110"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
