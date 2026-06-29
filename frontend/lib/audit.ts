import { createAdminClient } from "./supabase/admin";
import { headers } from "next/headers";

type LogAuditParams = {
  actorId: string;
  actorRole: string;
  action: string;
  targetUserId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
};

export async function logAudit(params: LogAuditParams) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const adminClient = createAdminClient();
    
    const { error } = await adminClient.from("audit_logs").insert({
      actor_id: params.actorId,
      actor_role: params.actorRole,
      target_user_id: params.targetUserId || null,
      action: params.action,
      resource_type: params.resourceType || null,
      resource_id: params.resourceId || null,
      metadata: params.metadata || {},
      ip_address: ip,
      user_agent: userAgent
    });

    if (error) {
      console.error("Failed to insert audit log:", error);
    }
  } catch (err) {
    console.error("Audit logging error:", err);
  }
}
