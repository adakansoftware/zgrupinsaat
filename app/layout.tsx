import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { buildDefaultMetadata, buildOrganizationJsonLd, buildServicesJsonLd, buildWebsiteJsonLd } from '@/lib/seo'
import { serializeJsonForScript } from '@/lib/json-script-core'
import { getSiteSettings } from '@/lib/settings-service'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  return buildDefaultMetadata(await getSiteSettings())
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings()
  const organizationJsonLd = buildOrganizationJsonLd(settings)
  const websiteJsonLd = buildWebsiteJsonLd(settings)
  const servicesJsonLd = buildServicesJsonLd(settings)

  return (
    <html lang="tr" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonForScript(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonForScript(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonForScript(servicesJsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
