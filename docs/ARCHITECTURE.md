# WhereBox — System Architecture & Design Specification

## 1. System Overview

WhereBox is an Apple-polish, responsive Progressive Web App (PWA) designed to consolidate shipments from fragmented shopping platforms (Amazon, Flipkart, Myntra, Meesho, Ajio, Shopify) and express courier services (Delhivery, Blue Dart, DTDC, India Post, Ekart, Xpressbees, and global couriers).

```
[ User Browser / Installed PWA (Mobile/Desktop) ]
                      │
                      ▼ HTTPS / TLS 1.3
          [ Next.js 15 App Router ]
   ┌──────────────────┴──────────────────┐
   ▼                                     ▼
[ Client UI Layer ]              [ Route Handlers / Server Actions ]
 - Glassmorphism System           - Per-User Authorization (Server Side)
 - Quick Track Input              - Supabase PostgreSQL Client (RLS)
 - Realtime Timeline              - Carrier Tracking Provider Adapter
 - Offline / PWA Service Worker   - Gmail API Secure Sync Service
                                         │
                 ┌───────────────────────┼────────────────────────┐
                 ▼                       ▼                        ▼
        [ Supabase Auth & DB ]  [ Tracking Provider APIs ]   [ Google OAuth / Gmail ]
        - RLS Per User           - 17TRACK / Ship24 / etc.   - Narrow scopes
        - Isolated Rows          - Webhooks & Polling        - Extract tracking & store
```

---

## 2. Core Architectural Principles

1. **Strict User Scoping & Zero Data Leakage:**
   - Every shipment, tracking event, and notification is hard-linked to an authenticated `user_id`.
   - PostgreSQL Row Level Security (RLS) enforces that no user can read, mutate, or inspect another user's packages.
   - No guest tracking. No cross-account shipment sharing.

2. **Provider-Agnostic Tracking Adapter:**
   - The user interface and domain logic never directly consume a third-party vendor's raw schema.
   - All vendor events map into the canonical status model (`IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `EXCEPTION`, `DELAYED`, `LABEL_CREATED`, etc.).
   - Switching tracking vendors requires updating only the provider adapter.

3. **Ground Truth Over Heuristics:**
   - Provider tracking scans are the authoritative source of truth.
   - Scan inactivity is clearly labeled as `"No recent update"` or `"Needs checking"`, never fabricated as a confirmed carrier delay without courier evidence.

4. **Zero-Cost Operating Target:**
   - Built for deployment on free-tier infrastructure (Vercel Hobby + Supabase Free + Provider Free Tier).
   - Designed to handle personal/family scale (31–100 new shipments/month).

---

## 3. Database Schema (Supabase PostgreSQL)

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier_code TEXT NOT NULL,
  carrier_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'email', 'store')),
  store_name TEXT,
  order_reference TEXT,
  item_label TEXT,
  normalized_status TEXT NOT NULL,
  raw_status TEXT NOT NULL,
  estimated_delivery_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  provider_name TEXT NOT NULL,
  provider_shipment_id TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, tracking_number)
);

-- Tracking Events
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  provider_event_id TEXT,
  event_code TEXT,
  normalized_status TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  raw_payload JSONB
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own shipments"
  ON shipments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own shipments"
  ON shipments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own shipments"
  ON shipments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own shipments"
  ON shipments FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. Tracking Provider Adapter Architecture

```typescript
export interface ITrackingProvider {
  name: string;
  detectCarrier(trackingNumber: string): Promise<CarrierInfo | null>;
  registerTracking(trackingNumber: string, carrierCode?: string): Promise<TrackingRegistrationResult>;
  getTracking(providerShipmentId: string): Promise<NormalizedTrackingData>;
  normalizeWebhookPayload(rawPayload: unknown): NormalizedTrackingData;
  verifyWebhookSignature(request: Request): boolean;
}
```

Implementations:
- `MockTrackingProvider` (used in tests and local development)
- `17TrackProvider` / `Ship24Provider` (Milestone 3)

---

## 5. Gmail Discovery Workflow (Milestone 5)

1. User explicitly initiates Google OAuth with least-privilege Gmail scope (`gmail.readonly`).
2. Server exchanges code for refresh token, stored in an encrypted secrets table (never exposed to client).
3. Background sync job searches for messages matching shipping filters (`from:(amazon OR flipkart OR myntra OR delhivery) has:tracking`).
4. Extractor parses tracking numbers, courier name, and merchant order numbers using heuristic regex and structured DOM parsing.
5. High-confidence detections automatically generate shipment entries; low-confidence matches enter the "Uncertain Detections Review" queue.
6. Full email bodies are **discarded immediately** after parsing; only metadata (store name, order #, tracking #) is persisted.

---

## 6. Progressive Web App (PWA) Design

- Responsive layout adapting seamlessly from iPhone (390px) to iPad/tablets (820px) to Desktop (1440px+).
- iPhone safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`) handled gracefully.
- Standalone app manifest with branded theme color (`#6366F1`) and adaptive icons.
