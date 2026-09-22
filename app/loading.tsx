import Image from 'next/image'

export default function RootLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="space-y-6">
          <div className="brand-logo-pulse relative h-14 w-20 overflow-hidden bg-background">
            <Image
              src="/images/z-grup-logo-small.png"
              alt="Z GRUP logo"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="h-4 w-28 animate-pulse bg-foreground/10" />
          <div className="h-16 max-w-3xl animate-pulse bg-foreground/10" />
          <div className="h-6 max-w-2xl animate-pulse bg-foreground/5" />
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
          <div className="h-72 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
          <div className="h-72 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
        </div>
      </div>
    </main>
  )
}
