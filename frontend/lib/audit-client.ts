export async function logClientAudit(
  action: string,
  params?: {
    targetUserId?: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });
  } catch (error) {
    console.error("Failed to log audit event client-side", error);
  }
}
