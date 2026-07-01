import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
 try {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body = await request.json();
 
 if (body.action === "mark_all") {
 const { error } = await supabase
 .from("notifications")
 .update({ is_read: true, read_at: new Date().toISOString() })
 .eq("user_id", user.id)
 .eq("is_read", false);
 
 if (error) throw error;
 return NextResponse.json({ success: true });
 }
 
 if (body.action === "mark_one" && body.notificationId) {
 const { error } = await supabase
 .from("notifications")
 .update({ is_read: true, read_at: new Date().toISOString() })
 .eq("id", body.notificationId)
 .eq("user_id", user.id); // Security check
 
 if (error) throw error;
 return NextResponse.json({ success: true });
 }

 return NextResponse.json({ error: "Invalid action" }, { status: 400 });
 } catch (error: unknown) {
 console.error("[POST /api/notifications/read]", error);
 return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
 }
}
