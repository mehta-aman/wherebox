import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ connected: false });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    const adminDb = createAdminClient() || supabase;
    const { data: account } = await adminDb
      .from("connected_accounts")
      .select("email, last_synced_at")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      email: account.email,
      lastSyncedAt: account.last_synced_at,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
