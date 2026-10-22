import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const isConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ connected: false, configured: isConfigured });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false, configured: isConfigured });
    }

    const adminDb = createAdminClient() || supabase;
    const { data: account } = await adminDb
      .from("connected_accounts")
      .select("email, last_synced_at")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ connected: false, configured: isConfigured });
    }

    return NextResponse.json({
      connected: true,
      configured: isConfigured,
      email: account.email,
      lastSyncedAt: account.last_synced_at,
    });
  } catch {
    return NextResponse.json({ connected: false, configured: isConfigured });
  }
}
