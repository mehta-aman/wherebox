import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleOAuthUrl } from "@/lib/email/gmail";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database client not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=/api/auth/google/connect", appUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${appUrl}/?google_setup=needed`);
    }

    // State payload encodes user ID to prevent CSRF
    const state = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString("base64");
    const authUrl = getGoogleOAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
