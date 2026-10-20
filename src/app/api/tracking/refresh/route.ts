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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shipmentId } = await request.json();
    if (!shipmentId) {
      return NextResponse.json({ error: "shipmentId is required" }, { status: 400 });
    }

    // Fetch existing shipment (enforced by RLS)
    const { data: shipment, error: fetchError } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", shipmentId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Call tracking adapter
    const updated = await trackShipment(shipment.tracking_number, shipment.carrier_code);

    // Update shipment row
    const nowIso = new Date().toISOString();
    await supabase
      .from("shipments")
      .update({
        normalized_status: updated.normalizedStatus,
        raw_status: updated.rawStatus,
        estimated_delivery_at: updated.estimatedDeliveryAt || shipment.estimated_delivery_at,
        last_event_at: updated.lastEventAt || shipment.last_event_at,
        last_checked_at: nowIso,
      })
      .eq("id", shipmentId);

    // Insert any new events
    if (updated.events && updated.events.length > 0) {
      const { data: existingEvents } = await supabase
        .from("tracking_events")
        .select("timestamp, description")
        .eq("shipment_id", shipmentId);

      const existingSet = new Set((existingEvents || []).map((e) => `${e.timestamp}_${e.description}`));

      const newEvents = updated.events
        .filter((e) => !existingSet.has(`${e.timestamp}_${e.description}`))
        .map((e) => ({
          shipment_id: shipmentId,
          normalized_status: updated.normalizedStatus,
          description: e.description,
          location: e.location || null,
          timestamp: e.timestamp,
        }));

      if (newEvents.length > 0) {
        await supabase.from("tracking_events").insert(newEvents);
      }
    }

    return NextResponse.json({ success: true, message: "Tracking refreshed." });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to refresh tracking." },
      { status: 500 }
    );
  }
}
