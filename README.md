# Z GRUP İNŞAAT Corporate Platform

Production-ready corporate website and admin panel built with Next.js 16.

## Project Scope

- Public routes: `/`, `/about`, `/services`, `/projects`, `/projects/[slug]`, `/fleet`, `/contact`
- Admin routes: `/admin/login`, `/admin`, `/admin/projects`, `/admin/messages`, `/admin/settings`
- Content storage: JSON files under `data/` or PostgreSQL via `pg`
- Upload storage: `public/uploads`
- Auth model: environment-based admin credentials with secure session cookie

## Quick Start

1. Install dependencies:

```powershell
npm install
```

2. Create the local environment file:

```powershell
Copy-Item .env.example .env
```

3. Update `.env` with the real production-safe values.

4. Run verification:

```powershell
npm run test
npm run lint
npm run build
```

5. Start local development:

```powershell
npm run dev
```

## Required Environment

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password
# Optional alternative to ADMIN_PASSWORD:
# ADMIN_PASSWORD_HASH=scrypt:<salt-base64url>:<hash-base64url>
ADMIN_SESSION_SECRET=use-a-long-random-secret
CONTENT_STORE=file
RATE_LIMIT_STORE=memory
# Only required when CONTENT_STORE=postgres
# DATABASE_URL=postgresql://user:password@host/database?sslmode=require
APP_ORIGIN=https://example.com
NEXT_PUBLIC_SITE_URL=https://example.com
```

## PostgreSQL Setup

If you want to run the project on Vercel or another serverless platform with persistent data:

1. Set `CONTENT_STORE=postgres`
2. Set `DATABASE_URL`
3. Create the schema:

```powershell
npm run db:init
```

4. Import current JSON content if needed:

```powershell
npm run db:import:file-data
```

## Production Notes

- `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` should match the live domain.
- In production, configure at least one of `APP_ORIGIN` or `NEXT_PUBLIC_SITE_URL`; if both are set, they must point to the same origin.
- If `CONTENT_STORE=file`, `data/` must be readable and writable in production.
- The current build keeps the upload API disabled; image assets are expected under `public/images` and video embeds should use YouTube URLs.
- File mode is best deployed to a single writable instance.
- Postgres mode is the safer choice for Vercel and other stateless hosting.
- Keep `data/` and custom `public/images/` assets in backups together when using file mode.
- Use strong, client-specific admin credentials before handoff.
- Rate limiting is currently memory-backed, so it is local-instance only unless replaced with a shared store.
- `/api/health` now reports the active content store, rate-limit store, and production warnings after admin authentication.

## Operations

- Health endpoint: `/api/health`
- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`
- Web manifest: `/manifest.webmanifest`
- KVKK page: `/kvkk-aydinlatma-metni`

## Handoff Documents

- [README_ADMIN.md](README_ADMIN.md)
- [CLIENT_HANDOFF.md](CLIENT_HANDOFF.md)
- [DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [PRODUCTION_MIGRATION.md](PRODUCTION_MIGRATION.md)
