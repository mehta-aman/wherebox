import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackShipment } from "@/lib/tracking/adapter";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max execution

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}

async function handleRefresh(request: Request) {
  const startTime = Date.now();

  try {
    // 1. Verify authorization secret if configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && process.env.NODE_ENV === "production") {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database admin client not configured. Ensure SUPABASE_SERVICE_ROLE_KEY is set." },
        { status: 500 }
      );
    }

    // 2. Query active, non-delivered, non-archived packages (max 25 per batch)
    const { data: activeShipments, error: fetchError } = await supabase
      .from("shipments")
      .select("*")
      .eq("is_archived", false)
      .neq("normalized_status", "DELIVERED")
      .order("last_checked_at", { ascending: true })
      .limit(25);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!activeShipments || activeShipments.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active shipments requiring refresh.",
        processedCount: 0,
        durationMs: Date.now() - startTime,
      });
    }

    const results = [];
    let updatedCount = 0;
    let statusChanges = 0;
    let newEventsTotal = 0;
    let stagnantCount = 0;

    for (const shipment of activeShipments) {
      try {
        // Poll tracking provider
        const trackingResult = await trackShipment(shipment.tracking_number, shipment.carrier_code);

        const statusChanged = trackingResult.normalizedStatus !== shipment.normalized_status;
        const nowIso = new Date().toISOString();

        // 3. Update shipment record
        const { error: updateError } = await supabase
          .from("shipments")
          .update({
            normalized_status: trackingResult.normalizedStatus,
            raw_status: trackingResult.rawStatus,
            estimated_delivery_at: trackingResult.estimatedDeliveryAt || shipment.estimated_delivery_at,
            delivered_at:
              trackingResult.deliveredAt ||
              (trackingResult.normalizedStatus === "DELIVERED" ? nowIso : shipment.delivered_at),
            last_event_at: trackingResult.lastEventAt || shipment.last_event_at,
            last_checked_at: nowIso,
          })
          .eq("id", shipment.id);

        if (!updateError) {
          updatedCount++;
        }

        if (statusChanged) {
          statusChanges++;
        }

        // 4. Ingest new chronological events
        let newEventsForShipment = 0;
        if (trackingResult.events && trackingResult.events.length > 0) {
          const { data: existingEvents } = await supabase
            .from("tracking_events")
            .select("timestamp, description")
            .eq("shipment_id", shipment.id);

          const existingEventKeys = new Set(
            (existingEvents || []).map((e) => `${e.timestamp}_${e.description}`)
          );

          const freshEvents = trackingResult.events
            .filter((e) => !existingEventKeys.has(`${e.timestamp}_${e.description}`))
            .map((e) => ({
              shipment_id: shipment.id,
              normalized_status: trackingResult.normalizedStatus,
              description: e.description,
              location: e.location || null,
              timestamp: e.timestamp,
            }));

          if (freshEvents.length > 0) {
            await supabase.from("tracking_events").insert(freshEvents);
            newEventsForShipment = freshEvents.length;
            newEventsTotal += freshEvents.length;
          }
        }

        // 5. Deduplicated in-app notification on status milestone change
        if (statusChanged) {
          // Check if notification already dispatched for this status
          const { data: existingNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("shipment_id", shipment.id)
            .eq("status", trackingResult.normalizedStatus)
            .maybeSingle();

          if (!existingNotif) {
            let notificationTitle = "Tracking Update";
            if (trackingResult.normalizedStatus === "DELIVERED") {
              notificationTitle = "Package Delivered! 🎉";
            } else if (trackingResult.normalizedStatus === "OUT_FOR_DELIVERY") {
              notificationTitle = "Out for Delivery Today 🚚";
            } else if (trackingResult.normalizedStatus === "IN_TRANSIT") {
              notificationTitle = "In Transit Update";
            }

            await supabase.from("notifications").insert({
              user_id: shipment.user_id,
              shipment_id: shipment.id,
              tracking_number: shipment.tracking_number,
              store_name: shipment.store_name || null,
              title: notificationTitle,
              message: `${shipment.carrier_name}: ${trackingResult.rawStatus}`,
              status: trackingResult.normalizedStatus,
            });
          }
        }

        // 6. Delivery Delay Heuristic (Stagnant Package Detection)
        // If > 48h without scan and not delivered
        const lastScanTime = new Date(shipment.last_event_at || shipment.created_at).getTime();
        const hoursSinceScan = (Date.now() - lastScanTime) / (1000 * 60 * 60);

        let isStagnant = false;
        if (
          hoursSinceScan > 48 &&
          ["IN_TRANSIT", "SHIPPED", "AT_FACILITY"].includes(trackingResult.normalizedStatus)
        ) {
          isStagnant = true;
          stagnantCount++;

          // Check if a stagnant warning has been dispatched in the last 3 days
          const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
          const { data: recentStagnantNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("shipment_id", shipment.id)
            .eq("title", "Delivery Heuristic: Scan Pending")
            .gt("created_at", threeDaysAgoIso)
            .maybeSingle();

          if (!recentStagnantNotif) {
            await supabase.from("notifications").insert({
              user_id: shipment.user_id,
              shipment_id: shipment.id,
              tracking_number: shipment.tracking_number,
              store_name: shipment.store_name || null,
              title: "Delivery Heuristic: Scan Pending",
              message: `No new carrier scans in ${Math.round(hoursSinceScan)}h for #${shipment.tracking_number}. This is normal between regional hubs.`,
              status: "DELAYED",
            });
          }
        }

        results.push({
          id: shipment.id,
          trackingNumber: shipment.tracking_number,
          carrier: shipment.carrier_name,
          oldStatus: shipment.normalized_status,
          newStatus: trackingResult.normalizedStatus,
          statusChanged,
          newEventsCount: newEventsForShipment,
          isStagnant,
          hoursSinceScan: Math.round(hoursSinceScan),
        });
      } catch (itemErr) {
        results.push({
          id: shipment.id,
          trackingNumber: shipment.tracking_number,
          error: (itemErr as Error).message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: activeShipments.length,
      updatedCount,
      statusChanges,
      newEventsTotal,
      stagnantCount,
      durationMs: Date.now() - startTime,
      shipments: results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error during background refresh" },
      { status: 500 }
    );
  }
}
