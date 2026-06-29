import { createClient } from "@supabase/supabase-js";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  entityId?: string;
  entityType?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await admin.from("notifications").insert({
    user_id: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    category: params.category,
    entity_id: params.entityId,
    entity_type: params.entityType,
    link: params.link,
    metadata: params.metadata || {},
  });

  if (error) {
    console.error("[Notifications] Failed to create notification:", error);
  }
}
