import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

// Strict whitelist of actions allowed to be logged via the client-facing API
const ALLOWED_CLIENT_ACTIONS = [
  "Login",
  "Logout",
  "Document viewed",
  "Document downloaded",
  "Document uploaded", // Initializing from client
  "Protocol created",
  "Protocol updated",
  "Note created",
  "Note updated",
  "Appointment created",
  "Appointment rescheduled",
  "Appointment cancelled"
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, targetUserId, resourceType, resourceId, metadata } = body;

    if (!ALLOWED_CLIENT_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Forcefully set actorId and actorRole to the authenticated user to prevent spoofing
    await logAudit({
      actorId: user.id,
      actorRole: profile.role,
      action,
      targetUserId,
      resourceType,
      resourceId,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Client audit log API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
