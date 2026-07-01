"use server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchMemberAuditLogs(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return [];
  
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("audit_logs")
    .select("id, action, created_at, resource_type, metadata")
    .eq("target_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  return data || [];
}
