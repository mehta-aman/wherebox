# WhereBox — Implementation Status & Roadmap

## Current State

- **Current Milestone:** Milestone 1 Completed (Foundation & Brand System).
- **Next Milestone:** Milestone 2 (Authentication & Database with Supabase & RLS).
- **Status:** All baseline components, design tokens, responsive PWA layouts, and automated tests passing with 0 errors.

---

## Completed Milestones

### Milestone 1 — Foundation & Brand System ✅
- [x] Initialized Next.js 15.5.28 with React 19, TypeScript strict mode, and App Router.
- [x] Configured Tailwind CSS v4 with custom brand tokens, Apple-inspired glassmorphism, and responsive breakpoints.
- [x] Created official vector brand assets:
  - WhereBox wordmark ("Where" navy, "Box" indigo-to-violet gradient).
  - Isometric parcel box + location pin symbol.
  - App Icon 4 variations: Default (PWA), Light, Dark Monochrome, and Glyph.
  - PWA Web App Manifest (`public/manifest.json`), icons (`192x192`, `512x512`), and SVG favicon.
- [x] Built core reusable UI component library:
  - `Button` (Primary gradient, Secondary, Glass, Outline, Ghost, Danger).
  - `Input` & `SearchBar`.
  - `TrackingInput` (Quick Track with real-time heuristic courier detection and popular store picker).
  - `GlassCard` (translucent surfaces with soft elevation and backdrop blur).
  - `ShipmentCard` (store avatar, carrier tag, masked tracking number, one-click copy, quick refresh).
  - `StatusBadge` (normalized canonical status mapping with semantic pills).
  - `SummaryCard` (interactive metrics: Total, In Transit, Out for Delivery, Delivered, Delayed/Exceptions).
  - `ShipmentTimeline` (chronological event history connecting dots with carrier notes and locations).
  - `ShipmentDetailsModal` (full detail drawer with carrier raw scan note, timeline, copy/archive/delete).
  - `UpcomingDeliveriesPanel` (calendar grouped delivery expectations with disclaimer).
  - `NotificationDropdown` (in-app notification center with unread counters and clear/read actions).
  - `EmptyState`, `LoadingState`, and `ErrorState`.
  - `ResponsiveSidebar` (Desktop) & `MobileNavigation` (Mobile bottom bar with safe-area insets).
- [x] Implemented isolated demo fixtures (`src/data/demo-shipments.ts`) covering Amazon, Flipkart, Myntra, Apple, Delhivery, Blue Dart, DTDC, India Post, and UPS.
- [x] Configured Vitest test runner and created 13 automated unit tests verifying carrier detection, summary calculation, and formatting utilities.
- [x] Created documentation suite (`README.md`, `BRAND_GUIDELINES.md`, `ARCHITECTURE.md`, `.env.example`).

---

## Upcoming Milestones

### Milestone 2 — Authentication & Database (In Progress) 🟡
- [x] Installed `@supabase/supabase-js` and `@supabase/ssr`.
- [x] Created PostgreSQL migration `20261020000000_initial_schema.sql` covering `profiles`, `shipments`, `tracking_events`, and `notifications`.
- [x] Successfully deployed database schema and verified table provisioning in Supabase.
- [x] Verified Row Level Security (RLS) enforcement: unauthenticated writes are rejected (`42501`) and data read isolation is strictly preserved.
- [x] Configured browser and server-side Supabase SSR client helpers with defensive URL sanitization.
- [ ] Implement user authentication UI (Sign In / Sign Up / Forgot Password).
- [ ] Connect authenticated dashboard queries to live Supabase backend.

### Milestone 3 — Live Manual Tracking ⏳
- Evaluate and select free-tier tracking provider (17TRACK / Ship24).
- Implement `ITrackingProvider` adapter interface.
- Implement live tracking registration and status polling.
- Handle provider rate limits, retries, and network timeouts.

### Milestone 4 — Tracking Updates & Notifications ⏳
- Webhook receiver or cron-based polling worker.
- Normalization pipeline for status changes.
- Email delivery notifications & Web Push where supported.

### Milestone 5 — Gmail Shipment Discovery ⏳
- Google Cloud Console OAuth setup with narrow `gmail.readonly` scope.
- Order confirmation & tracking number extraction engine.
- High-confidence auto-add & uncertain match review screen.

### Milestone 6 — Testing & Deployment ⏳
- End-to-end security and authorization validation.
- Vercel Hobby deployment setup.

### Milestone 7 — AI Delivery Assistant (Future Phase) ⏳
- Structured tool-calling queries grounded strictly in user's database records.

---

## Verification & Tests Performed

| Check / Test Suite | Command | Result | Notes |
|---|---|---|---|
| TypeScript Compilation | `npx tsc --noEmit` | **Passed (0 errors)** | Strict mode enabled |
| ESLint Verification | `npx eslint .` | **Passed (0 warnings, 0 errors)** | Clean lint |
| Next.js Production Build | `npm run build` | **Passed (0 errors)** | Static routes prerendered |
| Unit Tests (Vitest) | `npm test` | **Passed (13/13 tests)** | Carrier detection & summary logic verified |

---

## External Configuration Required (Milestone 2 & 3)

When ready to proceed to Milestone 2, the following credentials will be required in `.env.local`:
1. **Supabase Project:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. **Google OAuth (Optional for Google Sign-in):**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## Exact Next Step

Begin **Milestone 2 (Authentication and Database)**:
1. Set up Supabase database migration scripts in `supabase/migrations/`.
2. Configure Supabase Auth SSR helper for Next.js App Router.
3. Replace demo state bindings with authenticated user database operations protected by Row Level Security.
