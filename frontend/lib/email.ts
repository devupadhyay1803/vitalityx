// Resend wrapper — gracefully degrades if RESEND_API_KEY is missing
type EmailArgs = { to: string; subject: string; html: string; from?: string };

export async function sendEmail({ to, subject, html, from }: EmailArgs) {
  const key = process.env.RESEND_API_KEY;
  const sender = from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!key) {
    console.log(`[VitalityX/email] STUB - would send to ${to}: "${subject}"`);
    return { id: "stub", stubbed: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ from: sender, to, subject, html }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("[VitalityX/email] Resend failed:", t);
    return { error: t };
  }
  return res.json();
}
