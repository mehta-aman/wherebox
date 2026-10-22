import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchOrderMessagesFromGmail,
  refreshGoogleAccessToken,
} from "@/lib/email/gmail";
import { parseOrderEmail } from "@/lib/email/parser";
import { trackShipment } from "@/lib/tracking/adapter";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database client not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const adminDb = createAdminClient() || supabase;

    // 1. Fetch user's connected Google account
    const { data: account, error: accError } = await adminDb
      .from("connected_accounts")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (accError || !account) {
      return NextResponse.json(
        {
          error: "No connected Gmail account found.",
          needsAuth: true,
          instruction: "Please connect your Gmail account to enable automatic order discovery.",
        },
        { status: 404 }
      );
    }

    // 2. Refresh token if expired
    let accessToken = account.access_token;
    const isExpired = account.token_expires_at
      ? new Date(account.token_expires_at).getTime() < Date.now() + 60000
      : false;

    if (isExpired && account.refresh_token) {
      try {
        const refreshed = await refreshGoogleAccessToken(account.refresh_token);
        accessToken = refreshed.accessToken;
        await adminDb
          .from("connected_accounts")
          .update({
            access_token: refreshed.accessToken,
            token_expires_at: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", account.id);
      } catch (refreshErr) {
        return NextResponse.json(
          {
            error: `Failed to refresh Gmail authorization: ${(refreshErr as Error).message}`,
            needsAuth: true,
          },
          { status: 401 }
        );
      }
    }

    // 3. Fetch recent order messages from Gmail
    const body = await request.json().catch(() => ({}));
    const daysBack = typeof body.daysBack === "number" ? body.daysBack : 14;

    const emailMessages = await fetchOrderMessagesFromGmail(accessToken, daysBack);

    if (emailMessages.length === 0) {
      return NextResponse.json({
        success: true,
        discoveredCount: 0,
        message: "No new order or dispatch emails found in the last 14 days.",
      });
    }

    // 4. Check already synced email IDs to avoid duplicate processing
    const messageIds = emailMessages.map((m) => m.messageId);
    const { data: alreadySynced } = await adminDb
      .from("synced_emails")
      .select("message_id")
      .eq("user_id", user.id)
      .in("message_id", messageIds);

    const syncedSet = new Set((alreadySynced || []).map((r) => r.message_id));

    const newlyDiscovered = [];

    for (const msg of emailMessages) {
      if (syncedSet.has(msg.messageId)) {
        continue;
      }

      // Parse message
      const parsed = parseOrderEmail(msg);
      if (!parsed || !parsed.trackingNumber) {
        // Record as inspected so we don't re-process
        await adminDb.from("synced_emails").insert({
          user_id: user.id,
          message_id: msg.messageId,
          sender: msg.from,
          subject: msg.subject,
          status: "ignored",
        });
        continue;
      }

      const cleanNumber = parsed.trackingNumber.trim().toUpperCase();

      // Check if already in shipments table
      const { data: existingShipment } = await adminDb
        .from("shipments")
        .select("id")
        .eq("user_id", user.id)
        .eq("tracking_number", cleanNumber)
        .maybeSingle();

      if (existingShipment) {
        // Update product metadata if present
        await adminDb
          .from("shipments")
          .update({
            store_name: parsed.storeName,
            item_label: parsed.itemTitle,
            order_reference: parsed.orderReference,
            source_type: "email",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingShipment.id);

        await adminDb.from("synced_emails").insert({
          user_id: user.id,
          message_id: msg.messageId,
          sender: msg.from,
          subject: msg.subject,
          tracking_number: cleanNumber,
          item_title: parsed.itemTitle,
          store_name: parsed.storeName,
          status: "imported",
        });
        continue;
      }

      // Query live tracking data
      const trackingResult = await trackShipment(cleanNumber, parsed.carrierCode);

      // Create new shipment
      const { data: newShipment, error: insertError } = await adminDb
        .from("shipments")
        .insert({
          user_id: user.id,
          tracking_number: cleanNumber,
          carrier_code: trackingResult.carrierCode,
          carrier_name: trackingResult.carrierName,
          source_type: "email",
          store_name: parsed.storeName,
          order_reference: parsed.orderReference || trackingResult.orderReference || null,
          item_label: parsed.itemTitle || `${trackingResult.carrierName} Package`,
          normalized_status: trackingResult.normalizedStatus,
          raw_status: trackingResult.rawStatus,
          estimated_delivery_at: trackingResult.estimatedDeliveryAt || null,
          shipped_at: trackingResult.shippedAt || null,
          delivered_at: trackingResult.deliveredAt || null,
          last_event_at: trackingResult.lastEventAt || new Date().toISOString(),
          last_checked_at: new Date().toISOString(),
          provider_name: trackingResult.providerName,
          provider_shipment_id: trackingResult.providerShipmentId || null,
        })
        .select()
        .single();

      if (!insertError && newShipment) {
        // Ingest events
        if (trackingResult.events && trackingResult.events.length > 0) {
          const eventsPayload = trackingResult.events.map((evt) => ({
            shipment_id: newShipment.id,
            normalized_status: trackingResult.normalizedStatus,
            description: evt.description,
            location: evt.location || null,
            timestamp: evt.timestamp,
          }));
          await adminDb.from("tracking_events").insert(eventsPayload);
        }

        // Record synced email ledger
        await adminDb.from("synced_emails").insert({
          user_id: user.id,
          message_id: msg.messageId,
          sender: msg.from,
          subject: msg.subject,
          tracking_number: cleanNumber,
          item_title: parsed.itemTitle,
          store_name: parsed.storeName,
          status: "imported",
        });

        // Add in-app notification
        await adminDb.from("notifications").insert({
          user_id: user.id,
          shipment_id: newShipment.id,
          tracking_number: cleanNumber,
          store_name: parsed.storeName,
          title: "Gmail Order Discovered! 📦",
          message: `${parsed.storeName}: "${parsed.itemTitle || "Order Item"}" via ${trackingResult.carrierName}`,
          status: trackingResult.normalizedStatus,
        });

        newlyDiscovered.push({
          itemTitle: parsed.itemTitle,
          storeName: parsed.storeName,
          trackingNumber: cleanNumber,
          carrierName: trackingResult.carrierName,
          status: trackingResult.normalizedStatus,
        });
      }
    }

    // Update last_synced_at timestamp
    await adminDb
      .from("connected_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", account.id);

    return NextResponse.json({
      success: true,
      scannedCount: emailMessages.length,
      discoveredCount: newlyDiscovered.length,
      shipments: newlyDiscovered,
      message:
        newlyDiscovered.length > 0
          ? `Discovered ${newlyDiscovered.length} package${newlyDiscovered.length > 1 ? "s" : ""} from your Gmail!`
          : "Your packages are up to date. No new un-tracked orders found.",
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
