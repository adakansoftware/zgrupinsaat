# Z Grup İnşaat Phone, SEO/GEO and Cloudflare Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all public phone and WhatsApp contact paths, add complete truthful SEO/GEO outputs, deploy Next.js to Cloudflare Workers, verify live responses, and push `main` without changing UI.

**Architecture:** Keep existing `SiteSettings` and page components. Add contact constants/helpers for exact link generation, extend existing `lib/seo.ts` schema builders, generate LLM text through focused route handlers, and use OpenNext for Workers compatibility. Tests assert behavior through pure functions and route outputs before production edits.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Node test runner, Neon Postgres, OpenNext Cloudflare adapter, Wrangler.

## Global Constraints

- Preserve UI structure, copy, images, colors, spacing, and existing company information.
- Display only `+90 532 449 94 55`; use `tel:+905324499455` and `https://wa.me/905324499455`.
- Remove secondary phone and secondary WhatsApp behavior.
- Never invent reviews, ratings, addresses, coordinates, projects, fleet entries, or FAQs.
- Do not modify `.env`, secrets, or user-owned files.
- Do not stage existing `.gitignore` or `data/admin-issue-status.json` changes.

---

### Task 1: Canonical contact data and UI links

**Files:**
- Create: `lib/contact-details.ts`
- Modify: `test/run.ts`
- Modify: `data/settings.json`
- Modify: `lib/file-defaults.ts`
- Modify: `lib/store.ts`
- Modify: `components/navbar.tsx`
- Modify: `components/hero.tsx`
- Modify: `components/cta-section.tsx`
- Modify: `components/footer.tsx`
- Modify: `components/contact-section.tsx`
- Modify: `components/floating-whatsapp.tsx`
- Modify: `components/admin/SettingsForm.tsx`

**Interfaces:**
- Produces `PUBLIC_PHONE_DISPLAY`, `PUBLIC_PHONE_TEL`, `PUBLIC_WHATSAPP_URL`, and `getPublicTelephoneHref(): string`.
- Existing `SiteSettings` stays compatible; `contactPhoneSecondary` remains serialized as an empty string.

- [ ] Add assertions to `test/run.ts` for exact constants, empty secondary phone defaults, and source scan absence of old number/secondary UI rendering.
- [ ] Run `npm test`; confirm failure because `lib/contact-details.ts` does not exist or old defaults remain.
- [ ] Add contact constants and update defaults/data to exact required values.
- [ ] Replace computed `tel:` hrefs with exact helper output; add `whitespace-nowrap` to visible phone anchors; remove secondary phone rendering and admin input.
- [ ] Run `npm test`; confirm pass.

### Task 2: Truthful structured data and crawler outputs

**Files:**
- Create: `lib/llms-content.ts`
- Create: `app/llms.txt/route.ts`
- Create: `app/llms-full.txt/route.ts`
- Modify: `test/run.ts`
- Modify: `lib/seo.ts`
- Modify: `app/robots.ts`
- Modify: `app/sitemap.ts`
- Modify: `app/services/[slug]/page.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Modify: `app/fleet/[slug]/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/fleet/page.tsx`

**Interfaces:**
- Produces `buildBreadcrumbJsonLd(items)`, `buildServiceJsonLd(service, settings)`, `buildProjectJsonLd(project, settings)`, `buildFleetJsonLd(item, settings)`, and `buildFaqJsonLd(faqs)` in `lib/seo.ts`.
- Produces `buildLlmsIndex(...)` and `buildLlmsFull(...)` in `lib/llms-content.ts`.
- Route handlers return `text/plain; charset=utf-8`.

- [ ] Add assertions for bot allow rules, canonical public routes, schema types, real FAQ data, project/fleet identity, and both LLM text builders.
- [ ] Run `npm test`; confirm failure because builders/routes are missing.
- [ ] Implement focused schema builders using only existing service, project, fleet, FAQ, and site settings data.
- [ ] Render schemas on matching pages using existing safe JSON serialization; do not change visual markup.
- [ ] Add `OAI-SearchBot` and `OAI-AdsBot` allow rules; include `/llms.txt` and `/llms-full.txt` in sitemap.
- [ ] Implement LLM routes from existing content repositories.
- [ ] Run `npm test`; confirm pass.

### Task 3: Cloudflare Workers adapter

**Files:**
- Create: `wrangler.jsonc`
- Create: `open-next.config.ts`
- Create: `.assetsignore`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces scripts `build:cloudflare`, `preview:cloudflare`, and `deploy:cloudflare`.
- Worker entry point `.open-next/worker.js`; assets directory `.open-next/assets`; Worker name `zgrupinsaat`.

- [ ] Run `npx @opennextjs/cloudflare build`; confirm expected failure because adapter/config is absent.
- [ ] Install `@opennextjs/cloudflare` and `wrangler` as dev dependencies without changing environment files.
- [ ] Add OpenNext and Wrangler config with `nodejs_compat`, current compatibility date, assets binding, and observability.
- [ ] Run `npm run build:cloudflare`; confirm `.open-next/worker.js` and `.open-next/assets` exist.

### Task 4: Full local verification and protected commit

**Files:**
- Verify all changed files.

- [ ] Run old contact scan: `rg -n "539\s*941|905399416521|532\s*555" app components lib data public` and require zero matches.
- [ ] Run `npm test`, `npm run lint`, `npm run build`, and `npm run build:cloudflare`; require exit code `0`.
- [ ] Run `git diff --check` and inspect `git diff --stat` plus `git status --short`.
- [ ] Confirm `.env`, secrets, `.gitignore`, `data/admin-issue-status.json`, UI copy, and image files are absent from staged changes.
- [ ] Commit application changes with `feat: unify contact and expand SEO for Cloudflare`.

### Task 5: Deploy, live verification, and push

**Files:**
- No source changes unless deployment exposes a tested compatibility bug.

- [ ] Confirm Cloudflare auth with `npx wrangler whoami`.
- [ ] Deploy with `npm run deploy:cloudflare` and record Workers URL.
- [ ] Request `/`, `/api/health`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`; require HTTP `200`.
- [ ] Fetch live homepage and public text endpoints; require no old phone or WhatsApp number and require new phone/WhatsApp values.
- [ ] Push commits with `git push origin main`.
- [ ] Confirm `origin/main` contains final application commit and working tree retains only pre-existing user changes.
