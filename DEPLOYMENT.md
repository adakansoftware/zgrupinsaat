# Deployment Notes

## Hosting Assumptions

- File mode: one writable application instance and persistent storage for `data/`
- Postgres mode: reachable PostgreSQL database and no writable disk requirement for content
- Environment variables managed outside the repository

## Required Runtime Expectations

- Node.js version compatible with Next.js 16
- If `CONTENT_STORE=file`, read/write access to `data/`
- If `CONTENT_STORE=postgres`, a valid `DATABASE_URL`
- Stable origin configuration through `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL`
- If you use hashed admin credentials, provide `ADMIN_PASSWORD_HASH`; otherwise provide `ADMIN_PASSWORD`
- The current defaults are `CONTENT_STORE=file` and `RATE_LIMIT_STORE=memory`
- For multi-instance PostgreSQL deployments, set both `CONTENT_STORE=postgres` and `RATE_LIMIT_STORE=postgres`

## Recommended Release Flow

1. Update environment variables.
2. If using file mode, restore or attach persisted `data/` and any curated `public/images/` assets.
3. If using Postgres mode, run `npm run db:init` once against the target database.
4. If migrating existing JSON content, run `npm run db:import:file-data` before switching production traffic.
5. For shared rate limiting, set `RATE_LIMIT_STORE=postgres` after `npm run db:init` has created `rate_limit_buckets`.
6. Run `npm run test`.
7. Run `npm run lint`.
8. Run `npm run build`.
9. Deploy the application.
10. Verify `/api/health`.
11. Verify admin login and one sample content update.
12. Confirm contact form submission and one admin-side project/media update.

## Backup Guidance

- Back up `data/` together with any custom files kept under `public/images/` when using file mode.
- Back up the PostgreSQL database together with `public/images/` when using Postgres mode.
- Keep recovery copies of the generated `.bak` JSON files.
- Before major content migrations, take a fresh snapshot.

## Operational Warnings

- File-based persistence is not ideal for horizontal scaling.
- The current rate limiter is in-memory only, so limits reset on restart and are not shared across instances.
- Concurrent edits are hardened, but a shared database is still the correct future upgrade for larger teams.
- The upload API is intentionally disabled in this build; production image management currently relies on controlled `public/images` assets or a future object-storage integration.
- If the live domain changes, update both `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` together.
- See [PRODUCTION_MIGRATION.md](PRODUCTION_MIGRATION.md) before moving to multi-instance or serverless production.
