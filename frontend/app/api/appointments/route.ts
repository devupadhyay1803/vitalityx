import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { CONSENT_VERSION } from "@/lib/consent";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: consentRecord } = await supabase
      .from("consent_records")
      .select("consent_version")
      .eq("user_id", user.id)
      .eq("consent_version", CONSENT_VERSION)
      .single();
      
    if (!consentRecord) {
      return NextResponse.json({ error: "Forbidden: You must accept the latest Terms & Consent before proceeding." }, { status: 403 });
    }

    const { action, appointmentId, memberId, staffId } = await req.json();

    if (!action || !appointmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // This is the backend hook for email placeholders (Booking confirmation, Reminder, Reschedule, Cancellation)
    // Here we simulate triggering a transactional email provider like Resend or SendGrid.
    
    let subject = "";
    if (action === "booked") subject = "Your VitalityX Session is Booked";
    if (action === "rescheduled") subject = "Your VitalityX Session has been Rescheduled";
    if (action === "cancelled") subject = "Your VitalityX Session was Cancelled";
    if (action === "confirmed") subject = "Your VitalityX Session is Confirmed";

    console.log(`[Email Placeholder] Action: ${action} | Subject: ${subject} | Appointment ID: ${appointmentId}`);

    if (action === "booked") {
      // Create notification for staff
      const { data: apt } = await supabase.from("appointments").select("staff_id").eq("id", appointmentId).single();
      if (apt?.staff_id) {
        await createNotification({
          userId: apt.staff_id,
          title: "New Appointment Booked",
          message: "A member has scheduled a new session.",
          type: "appointment_booked",
          category: "appointments",
          link: "/staff/sessions"
        });
      }
    }
    
    if (action === "rescheduled" || action === "cancelled") {
      // Notify both parties
      const { data: apt } = await supabase.from("appointments").select("staff_id, member_id").eq("id", appointmentId).single();
      if (apt) {
        const type = action === "cancelled" ? "appointment_cancelled" : "appointment_rescheduled";
        await createNotification({
          userId: apt.staff_id,
          title: `Appointment ${action === 'cancelled' ? 'Cancelled' : 'Rescheduled'}`,
          message: `An appointment was ${action}.`,
          type, category: "appointments", link: "/staff/sessions"
        });
        await createNotification({
          userId: apt.member_id,
          title: `Appointment ${action === 'cancelled' ? 'Cancelled' : 'Rescheduled'}`,
          message: `Your appointment was ${action}.`,
          type, category: "appointments", link: "/member/sessions"
        });
      }
    }

    return NextResponse.json({ success: true, message: `Hook for ${action} executed` });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
