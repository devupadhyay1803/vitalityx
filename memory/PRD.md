# VitalityX Health — PRD & Build Status

## Original Problem Statement
Continuing development on VitalityX Health, a Next.js + Supabase precision longevity platform on Supabase free tier + Vercel Hobby. The 8-fix scope: legal pages, public navbar auth-awareness, demo switcher, 5-step signup, member dashboard, member portal sidebar+pages, staff console, cart+Stripe checkout.

## Stack & Hosting
- Next.js 16.2.9 (App Router) + TypeScript
- Supabase (auth + Postgres + Realtime + Storage) — free tier
- Tailwind v4 + shadcn/ui + Lucide + Recharts + SWR + Sonner
- Stripe (test mode) + Resend (stubbed — no key yet)
- Hosted in Emergent K8s: FastAPI proxy at port 8001 forwards `/api/*` → Next.js dev on port 3000

## User Personas (from PRD)
- **Member** — primary consumer; sees their own labs/protocol/messages
- **Coach** — owns a member's protocol; assigned 1:N members; reads assigned members only
- **Admin / Ops** — full data access; not yet UI-exposed
- **Relationship Lead** — read+comment only; not yet UI-exposed

## Implemented (Jan 2026)

### Public marketing site
- `/` Landing (hero + science + protocols + supplements sections)
- `/terms`, `/privacy`, `/gina`, `/help` (8-Q accordion)
- `/forgot-password`, `/reset-password`
- Auth-aware navbar (Sign In ↔ avatar dropdown with Go to Dashboard + Sign Out)
- Demo switcher (bottom-right pill, only when `NEXT_PUBLIC_DEMO_MODE=true`)

### Auth
- `/login` (with "Sign up →" link + Forgot password)
- `/signup` 5-step (account → profile → intake → consent → meet team) with localStorage draft
- Supabase email/password auth; profiles + client_records created in app code (no trigger)
- RLS: Members see own data; coaches see assigned members; SECURITY DEFINER helpers prevent recursion

### Member portal (`/member/*`)
- Sidebar + mobile bottom nav (Dashboard, My Data, Protocol, Sessions, Supplements, Messages, Check-in, Settings)
- Dashboard: greeting, 4 stat cards, today's protocol with checkboxes, bio-age trend (Recharts), recent biomarkers, my team card. Uses single `get_member_dashboard(uuid)` RPC.
- My Data: tabs (Biomarkers / Genetics / Bio Age)
- Protocol: checkable items with expandable "why" text
- Sessions: list + book modal (date/time picker)
- Supplements: list active subscriptions, pause/cancel via Stripe API
- Messages: realtime conversation with assigned coach (single Supabase channel)
- Check-in: 3 sliders → sparkline of last 7 days
- Settings: name, email, password, notification prefs (JSONB)

### Staff console (`/staff/*`)
- Dashboard: client count + today's sessions
- Clients: searchable table
- Client detail: profile + intake + consent + protocol + biomarkers + labs. Writes a row to `staff_access_logs` on every visit (via admin client / service role)
- Protocol builder: add/remove items with "why" text
- Lab upload: PDF to Supabase Storage + manual biomarker entry
- Sessions: filterable list
- Messages: shared with member
- Settings: 2FA TOTP enroll button
- Idle timeout: 30 min via global activity listeners

### Commerce
- Cart context (localStorage)
- Cart icon with badge in navbar
- `/cart` page with qty + remove + subtotal
- `POST /api/stripe/checkout` (server-side price catalog; supports subscription mode)
- `POST /api/stripe/webhook` (records paid order + supplement_subscriptions on `checkout.session.completed`)
- `POST /api/stripe/subscription` (pause/cancel)
- `/order-confirmation?session_id=…` with polling

## Database (Supabase Postgres)
12 tables: profiles, client_records, sessions, protocol_items, protocol_completions, lab_results, biomarkers, genetic_traits, messages, daily_checkins, orders, supplement_subscriptions, staff_access_logs.
Migrations:
- 001_init.sql — full schema + RPCs + RLS
- 002_fix_insert_rls.sql — permissive INSERTs
- 003_fix_profiles_rls.sql — fixed infinite recursion

## Test Status
- Iteration 1: 1 critical (profiles RLS recursion) — FIXED via 003
- Iteration 2: 18/18 backend pytest, ~95% frontend, 0 critical, 0 ui_bugs, 0 integration_issues
- Cart→Stripe E2E verified (real `checkout.stripe.com` URL returned, pending order written)
- Coach login → /staff/dashboard works; member login → /member/dashboard works

## Backlog / Deferred

**P0 (do next)**
- Real Resend key (sender domain + API key) so order confirmations actually send
- Stripe webhook signature verification (set `STRIPE_WEBHOOK_SECRET` after `stripe listen`)

**P1 (M3 — clinical loop polish)**
- Membership tiers (currently only supplement subscriptions)
- Lab/Genetic product pages (separate from supplements)
- In-app Notifications inbox
- Documents tab in member portal
- Mandatory 2FA enforcement for Coach/Admin/Ops via middleware (currently button only)

**P2**
- Relationship Lead role + UI
- Twilio SMS for lifecycle events
- Lab PDF auto-parsing (would need Edge Function — burn quota)
- Member↔Coach typing indicators / read receipts

## Free-tier observance
- ✅ No DB triggers used (signup writes via app code)
- ✅ No Edge Functions
- ✅ 1 RPC per dashboard load (single round trip)
- ✅ Realtime ONLY on /member/messages + /staff/messages
- ✅ ISR-friendly architecture; static legal pages
- ✅ No base64 images in DB; lab PDFs in Storage
