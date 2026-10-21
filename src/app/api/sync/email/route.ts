import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseOrderEmail, EmailMessagePayload } from "@/lib/email/parser";
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

    const body = (await request.json()) as EmailMessagePayload;

    if (!body || (!body.bodyText && !body.bodyHtml && !body.subject)) {
      return NextResponse.json(
        { error: "Email subject or body content is required for parsing." },
        { status: 400 }
      );
    }

    // 1. Parse email content with universal parser
    const parsed = parseOrderEmail({
      from: body.from || "orders@store.com",
      subject: body.subject || "",
      bodyText: body.bodyText,
      bodyHtml: body.bodyHtml,
    });

    if (!parsed) {
      return NextResponse.json(
        {
          error: "Could not identify courier tracking data in this email.",
          suggestion: "Ensure the email contains an order confirmation or courier waybill (AWB).",
        },
        { status: 422 }
      );
    }

    if (!parsed.trackingNumber) {
      return NextResponse.json(
        {
          error: `Identified ${parsed.storeName} order (${parsed.orderReference || "Reference pending"}), but carrier waybill is not yet generated.`,
          parsed,
        },
        { status: 422 }
      );
    }

    const cleanNumber = parsed.trackingNumber.trim().toUpperCase();

    // 2. Check if shipment already exists
    const { data: existing } = await supabase
      .from("shipments")
      .select("id")
      .eq("user_id", user.id)
      .eq("tracking_number", cleanNumber)
      .maybeSingle();

    if (existing) {
      // Update with newly parsed item details if missing
      await supabase
        .from("shipments")
        .update({
          store_name: parsed.storeName,
          item_label: parsed.itemTitle,
          order_reference: parsed.orderReference,
          source_type: "email",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return NextResponse.json({
        success: true,
        alreadyTracked: true,
        shipmentId: existing.id,
        parsed,
        message: `Package #${cleanNumber} was already tracked. Enriched with product title: "${parsed.itemTitle}".`,
      });
    }

    // 3. Query tracking provider for live courier status
    const trackingResult = await trackShipment(cleanNumber, parsed.carrierCode);

    // 4. Insert into database
    const { data: newShipment, error: insertError } = await supabase
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

    if (insertError || !newShipment) {
      return NextResponse.json(
        { error: insertError?.message || "Failed to save email shipment to database." },
        { status: 500 }
      );
    }

    // 5. Ingest events
    if (trackingResult.events && trackingResult.events.length > 0) {
      const eventRows = trackingResult.events.map((evt) => ({
        shipment_id: newShipment.id,
        normalized_status: trackingResult.normalizedStatus,
        description: evt.description,
        location: evt.location || null,
        timestamp: evt.timestamp,
      }));

      await supabase.from("tracking_events").insert(eventRows);
    }

    // 6. Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      shipment_id: newShipment.id,
      tracking_number: cleanNumber,
      store_name: parsed.storeName,
      title: "Email Shipment Discovered! 📦",
      message: `${parsed.storeName}: "${parsed.itemTitle || "Order Item"}" via ${trackingResult.carrierName}`,
      status: trackingResult.normalizedStatus,
    });

    return NextResponse.json({
      success: true,
      shipment: newShipment,
      parsed,
      message: `Successfully discovered and tracked "${parsed.itemTitle}" from ${parsed.storeName}!`,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
