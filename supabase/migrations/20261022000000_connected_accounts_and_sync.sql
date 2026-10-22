-- WhereBox Milestone 5: Connected Accounts & Email Sync Schema
-- Tables for Google OAuth and tracking synced order emails

-- 1. Connected Accounts Table (Stores OAuth refresh tokens per user)
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google' CHECK (provider IN ('google', 'outlook', 'apple')),
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY['https://www.googleapis.com/auth/gmail.readonly'],
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- 2. Synced Email Records (Deduplication ledger so we never re-parse the same email)
CREATE TABLE IF NOT EXISTS public.synced_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT,
  tracking_number TEXT,
  item_title TEXT,
  store_name TEXT,
  confidence NUMERIC(3, 2) DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'imported' CHECK (status IN ('imported', 'needs_review', 'ignored')),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_email_message UNIQUE (user_id, message_id)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_user_id ON public.synced_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_tracking ON public.synced_emails(user_id, tracking_number);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_emails ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can view own connected accounts"
  ON public.connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON public.connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON public.connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON public.connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own synced emails"
  ON public.synced_emails FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own synced emails"
  ON public.synced_emails FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own synced emails"
  ON public.synced_emails FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own synced emails"
  ON public.synced_emails FOR DELETE
  USING (auth.uid() = user_id);
