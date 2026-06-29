import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate we have the required fields
    if (!body.userId || !body.title || !body.message || !body.type || !body.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call the server helper (which uses the Service Role key to bypass RLS)
    await createNotification({
      userId: body.userId,
      title: body.title,
      message: body.message,
      type: body.type,
      category: body.category,
      entityId: body.entityId,
      entityType: body.entityType,
      link: body.link,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[POST /api/notifications/trigger]", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
