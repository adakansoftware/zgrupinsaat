import { z } from 'zod'
import { getComparableOrigin } from '@/lib/origin'
import { isValidPasswordHashFormat } from '@/lib/password-hash'

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    CONTENT_STORE: z.enum(['file', 'postgres']).default('file'),
    RATE_LIMIT_STORE: z.enum(['memory', 'postgres']).default('memory'),
    DATABASE_URL: z.string().trim().url('DATABASE_URL geçerli bir PostgreSQL bağlantı adresi olmalıdır.').optional(),
    ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL geçerli bir e-posta olmalıdır.'),
    ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD en az 12 karakter olmalıdır.').optional(),
    ADMIN_PASSWORD_HASH: z.string().trim().optional(),
    ADMIN_SESSION_SECRET: z.string().min(32, 'ADMIN_SESSION_SECRET en az 32 karakter olmalıdır.'),
    APP_ORIGIN: z.string().trim().url('APP_ORIGIN geçerli bir URL olmalıdır.').optional(),
    NEXT_PUBLIC_SITE_URL: z.string().trim().url('NEXT_PUBLIC_SITE_URL geçerli bir URL olmalıdır.').optional(),
    GOOGLE_SITE_VERIFICATION: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.ADMIN_PASSWORD && !value.ADMIN_PASSWORD_HASH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ADMIN_PASSWORD veya ADMIN_PASSWORD_HASH ayarlanmalıdır.',
        path: ['ADMIN_PASSWORD'],
      })
    }

    if (value.ADMIN_PASSWORD_HASH && !isValidPasswordHashFormat(value.ADMIN_PASSWORD_HASH)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ADMIN_PASSWORD_HASH desteklenen scrypt formatında olmalıdır.',
        path: ['ADMIN_PASSWORD_HASH'],
      })
    }

    if (value.APP_ORIGIN && value.NEXT_PUBLIC_SITE_URL) {
      const appOrigin = getComparableOrigin(value.APP_ORIGIN)
      const publicOrigin = getComparableOrigin(value.NEXT_PUBLIC_SITE_URL)

      if (appOrigin && publicOrigin && appOrigin !== publicOrigin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "APP_ORIGIN ve NEXT_PUBLIC_SITE_URL aynı origin'e işaret etmelidir.",
          path: ['NEXT_PUBLIC_SITE_URL'],
        })
      }
    }

    if (value.CONTENT_STORE === 'postgres' && !value.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CONTENT_STORE=postgres için DATABASE_URL ayarlanmalıdır.',
        path: ['DATABASE_URL'],
      })
    }

    if (value.RATE_LIMIT_STORE === 'postgres' && value.CONTENT_STORE !== 'postgres') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RATE_LIMIT_STORE=postgres requires CONTENT_STORE=postgres.',
        path: ['RATE_LIMIT_STORE'],
      })
    }
  })

// `next build` evaluates modules during page data collection, often in an
// environment without runtime secrets. Substitute inert placeholders there;
// runtime (`next start`) still validates the real values.
const isNextBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  CONTENT_STORE: process.env.CONTENT_STORE,
  RATE_LIMIT_STORE: process.env.RATE_LIMIT_STORE,
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? (isNextBuildPhase ? 'build@example.com' : undefined),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? (isNextBuildPhase ? 'next-build-placeholder' : undefined),
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_SESSION_SECRET:
    process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET ||
    (isNextBuildPhase ? 'next-build-placeholder-secret-not-used-at-runtime' : undefined),
  APP_ORIGIN: process.env.APP_ORIGIN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
})

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues.map((issue) => issue.message).join(' ')
  throw new Error(`Ortam değişkenleri güvenli değil: ${message}`)
}

export const env = parsedEnv.data
