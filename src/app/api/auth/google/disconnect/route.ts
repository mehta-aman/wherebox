import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokeGoogleToken } from "@/lib/email/gmail";

export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database client not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminDb = createAdminClient() || supabase;

    // Fetch account to get token for revocation
    const { data: account } = await adminDb
      .from("connected_accounts")
      .select("access_token, refresh_token")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (account) {
      const tokenToRevoke = account.refresh_token || account.access_token;
      if (tokenToRevoke) {
        await revokeGoogleToken(tokenToRevoke);
      }

      // Delete account row
      await adminDb
        .from("connected_accounts")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "google");
    }

    return NextResponse.json({
      success: true,
      message: "Gmail account disconnected and tokens revoked.",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
