-- WhereBox Initial Database Schema & Security Policies
-- Version 1.0 (Supabase PostgreSQL)

-- 1. Profiles Table (Synchronized with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier_code TEXT NOT NULL,
  carrier_name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'email', 'store')),
  store_name TEXT,
  order_reference TEXT,
  item_label TEXT,
  normalized_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  raw_status TEXT NOT NULL DEFAULT 'Shipment registered',
  estimated_delivery_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  provider_name TEXT NOT NULL DEFAULT 'manual',
  provider_shipment_id TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_tracking_number UNIQUE (user_id, tracking_number)
);

-- 3. Tracking Events Table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  provider_event_id TEXT,
  event_code TEXT,
  normalized_status TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  raw_payload JSONB
);

-- 4. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  tracking_number TEXT NOT NULL,
  store_name TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(user_id, normalized_status);
CREATE INDEX IF NOT EXISTS idx_shipments_archived ON public.shipments(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON public.tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7. Restrictive RLS Policies

-- PROFILES: Users can only read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- SHIPMENTS: Hard isolation by user_id
CREATE POLICY "Users can view own shipments"
  ON public.shipments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments"
  ON public.shipments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipments"
  ON public.shipments FOR DELETE
  USING (auth.uid() = user_id);

-- TRACKING EVENTS: Isolated through parent shipment ownership
CREATE POLICY "Users can view tracking events of own shipments"
  ON public.tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE public.shipments.id = public.tracking_events.shipment_id
        AND public.shipments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tracking events for own shipments"
  ON public.tracking_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE public.shipments.id = public.tracking_events.shipment_id
        AND public.shipments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tracking events for own shipments"
  ON public.tracking_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE public.shipments.id = public.tracking_events.shipment_id
        AND public.shipments.user_id = auth.uid()
    )
  );

-- NOTIFICATIONS: Hard isolation by user_id
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
