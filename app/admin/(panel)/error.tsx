"use client";

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminPanelError({ reset }: ErrorProps) {
  return (
    <div className="rounded-[32px] border border-foreground/10 bg-foreground/[0.04] p-8 text-center md:p-10">
      <div className="section-eyebrow mb-4">Yönetim uyarısı</div>
      <h1 className="font-display text-4xl text-foreground md:text-5xl">Panel verisi şimdi yüklenemedi</h1>
      <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
        Panel verilerine erişimde kısa süreli bir aksaklık oluştu. Yeniden deneyerek kaldığınız yerden devam edebilirsiniz.
      </p>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={reset}
          className="btn-premium inline-flex h-12 items-center px-6"
        >
          Paneli Yeniden Dene
        </button>
      </div>
    </div>
  )
}
