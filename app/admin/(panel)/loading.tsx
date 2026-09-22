import Image from 'next/image'

export default function AdminPanelLoading() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex items-center gap-4">
          <div className="brand-logo-pulse relative h-14 w-20 overflow-hidden bg-background">
            <Image
              src="/images/z-grup-logo-small.png"
              alt="Z GRUP logo"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse bg-foreground/10" />
            <div className="h-8 w-52 animate-pulse bg-foreground/10" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-36 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
          <div className="h-36 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
          <div className="h-36 animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
        </div>
        <div className="h-[420px] animate-pulse border border-foreground/10 bg-foreground/[0.03]" />
      </div>
    </div>
  )
}
