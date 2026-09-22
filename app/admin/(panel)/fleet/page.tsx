import { FleetManager } from '@/components/admin/FleetManager'
import { getFleetContent } from '@/lib/fleet-service'

export default async function AdminFleetPage() {
  const fleetContent = await getFleetContent()

  return (
    <div className="space-y-6">
      <div>
        <div className="section-eyebrow mb-4">Filo Yönetimi</div>
        <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">Filo İçeriği</h1>
        <p className="mt-3 max-w-3xl text-foreground/60">
          Filomuz sayfasındaki kategori kartlarını, detay başlıklarını ve ekipman model kartlarını buradan yönetin.
        </p>
      </div>

      <div className="industrial-border rounded-[28px] bg-foreground/[0.04] p-4 sm:p-6 md:rounded-[32px]">
        <FleetManager initialContent={fleetContent} />
      </div>
    </div>
  )
}
