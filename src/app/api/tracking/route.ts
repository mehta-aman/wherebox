import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const body = await request.json();
    const { trackingNumber, storeName, itemLabel, orderReference, carrierCode } = body;

    if (!trackingNumber || typeof trackingNumber !== "string" || !trackingNumber.trim()) {
      return NextResponse.json({ error: "Tracking number is required." }, { status: 400 });
    }

    const cleanNumber = trackingNumber.trim().toUpperCase();

    // Check if package already exists for this user
    const { data: existing } = await supabase
      .from("shipments")
      .select("id")
      .eq("user_id", user.id)
      .eq("tracking_number", cleanNumber)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Package #${cleanNumber} is already in your tracking dashboard.` },
        { status: 409 }
      );
    }

    // Call Tracking Provider Adapter to fetch carrier scans & status
    const trackingResult = await trackShipment(cleanNumber, carrierCode);

    // Determine platform / store name automatically if not provided
    let finalStore = storeName?.trim();
    if (!finalStore) {
      if (trackingResult.carrierCode === "ekart") {
        finalStore = "Flipkart";
      } else if (cleanNumber.startsWith("TBA") || trackingResult.carrierCode === "amazon_in") {
        finalStore = "Amazon";
      } else if (trackingResult.carrierCode === "bluedart") {
        finalStore = "Blue Dart Express";
      } else {
        finalStore = `${trackingResult.carrierName} Package`;
      }
    }

    // Determine product / item label automatically if not provided
    let finalItemLabel = itemLabel?.trim();
    if (!finalItemLabel) {
      if (trackingResult.destinationCity) {
        finalItemLabel = `Delivery to ${trackingResult.destinationCity}`;
      } else {
        finalItemLabel = `${trackingResult.carrierName} Shipment`;
      }
    }

    const finalOrderRef = orderReference?.trim() || trackingResult.orderReference || `WB-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert shipment into Supabase
    const { data: newShipment, error: insertError } = await supabase
      .from("shipments")
      .insert({
        user_id: user.id,
        tracking_number: cleanNumber,
        carrier_code: trackingResult.carrierCode,
        carrier_name: trackingResult.carrierName,
        source_type: "manual",
        store_name: finalStore,
        order_reference: finalOrderRef,
        item_label: finalItemLabel,
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
        { error: insertError?.message || "Failed to create shipment in database." },
        { status: 500 }
      );
    }

    // Insert carrier tracking events
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

    // Create in-app notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      shipment_id: newShipment.id,
      tracking_number: cleanNumber,
      store_name: storeName?.trim() || null,
      title: "Package Tracking Active",
      message: `${trackingResult.carrierName}: ${trackingResult.rawStatus}`,
      status: trackingResult.normalizedStatus,
    });

    return NextResponse.json({
      success: true,
      shipment: newShipment,
      message: `Package #${cleanNumber} added via ${trackingResult.carrierName}!`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
