export async function triggerNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  entityId?: string;
  entityType?: string;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await fetch("/api/notifications/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("Failed to trigger notification client-side", error);
  }
}
