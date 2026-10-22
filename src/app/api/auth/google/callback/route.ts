import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleCode } from "@/lib/email/gmail";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const stateRaw = requestUrl.searchParams.get("state");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!code) {
    const error = requestUrl.searchParams.get("error") || "Authorization denied";
    return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(error)}`);
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${appUrl}/?error=DatabaseClientError`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verify CSRF state
    let stateUserId: string | undefined;
    if (stateRaw) {
      try {
        const decoded = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
        stateUserId = decoded.userId;
      } catch {
        // invalid state
      }
    }

    const effectiveUserId = user?.id || stateUserId;
    if (!effectiveUserId) {
      return NextResponse.redirect(`${appUrl}/login?error=SessionExpired`);
    }

    // Exchange code for Google tokens
    const tokens = await exchangeGoogleCode(code);

    const adminDb = createAdminClient() || supabase;
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();

    // Upsert into connected_accounts
    await adminDb.from("connected_accounts").upsert(
      {
        user_id: effectiveUserId,
        provider: "google",
        email: tokens.email,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken || null,
        token_expires_at: expiresAt,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );

    return NextResponse.redirect(`${appUrl}/?gmail=connected&email=${encodeURIComponent(tokens.email)}`);
  } catch (err) {
    return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent((err as Error).message)}`);
  }
}
