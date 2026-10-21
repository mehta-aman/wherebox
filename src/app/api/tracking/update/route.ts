import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { shipmentId, itemLabel, storeName, orderReference } = await request.json();

    if (!shipmentId) {
      return NextResponse.json({ error: "shipmentId is required" }, { status: 400 });
    }

    const updatePayload: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };
    if (itemLabel !== undefined) updatePayload.item_label = itemLabel?.trim() || null;
    if (storeName !== undefined) updatePayload.store_name = storeName?.trim() || null;
    if (orderReference !== undefined) updatePayload.order_reference = orderReference?.trim() || null;

    const { data, error } = await supabase
      .from("shipments")
      .update(updatePayload)
      .eq("id", shipmentId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, shipment: data, message: "Order details updated successfully." });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
