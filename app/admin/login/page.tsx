import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { isAdminAuthenticated, normalizeAdminNextTarget } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Admin Giriş',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = normalizeAdminNextTarget(params.next)

  if (await isAdminAuthenticated()) {
    redirect(nextPath)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(144,6,0,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(144,6,0,0.08),transparent_32%)]" />
      <div className="container-shell relative z-10 flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-5xl rounded-[36px] border border-foreground/10 bg-foreground/[0.025] p-4 md:p-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hidden lg:block">
              <div className="section-eyebrow mb-4">Yetkili erişim</div>
              <h1 className="font-display text-6xl leading-[0.95] text-foreground">Yönetim paneline giriş yapın</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-foreground/60">
                Yetkili hesap bilgilerinizle panele güvenli şekilde giriş yapın.
              </p>
              <div className="mt-8 grid max-w-xl grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-5">
                  <div className="data-label text-foreground/40">Erişim</div>
                  <div className="mt-3 text-lg text-foreground">Yetkili giriş</div>
                </div>
                <div className="rounded-[24px] border border-foreground/10 bg-foreground/[0.03] p-5">
                  <div className="data-label text-foreground/40">Oturum</div>
                  <div className="mt-3 text-lg text-foreground">Korunan panel</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <LoginForm nextPath={nextPath} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
