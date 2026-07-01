import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { ClientTabs } from "@/components/staff/client-tabs";
import {
 Activity, FileText, Upload, CheckCircle2, Calendar, FlaskConical,
 ListChecks, Users, Package, XCircle, RefreshCw, Dna, Clock, MessageSquare
} from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface TimelineEvent {
 id: string;
 type: string;
 title: string;
 description: string;
 date: Date;
 icon: React.ReactNode;
 link?: string;
}

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();
 const admin = createAdminClient();

 const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
 if (!profile) notFound();

 // ── Fetch all data sources in parallel ──────
 const [
 { data: logs },
 { data: labs },
 { data: appointments },
 { data: protocolItems },
 { data: bioRecords },
 { data: careTeam },
 { data: documents },
 { data: orders },
 { data: subs },
 { data: notifications },
 { data: protocolCompletions },
 { data: auditLogs },
 ] = await Promise.all([
 admin.from("staff_access_logs").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("lab_results").select("id,biological_age,tested_at,created_at,pdf_url").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("appointments").select("id,title,status,scheduled_start,session_type,updated_at,created_at").eq("member_id", id).order("created_at", { ascending: false }).limit(50),
 admin.from("protocol_items").select("id,title,created_at,active,created_by").eq("member_id", id).order("created_at", { ascending: false }).limit(30),
 admin.from("biological_age_records").select("id,biological_age,longevity_score,calculated_at,created_at").eq("member_id", id).order("calculated_at", { ascending: false }).limit(10),
 admin.from("care_team_assignments").select("id,role,created_at,staff:profiles!care_team_assignments_staff_id_fkey(full_name)").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("documents").select("id,title,category,created_at").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("orders").select("id,amount_total,currency,created_at").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("supplement_subscriptions").select("id,product_name,status,created_at").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
 admin.from("notifications").select("id,title,message,type,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(30),
 admin.from("protocol_completions").select("id,item_id,completed_at,item:protocol_items(title)").eq("member_id", id).order("completed_at", { ascending: false }).limit(20),
 admin.from("audit_logs").select("id,action,created_at,resource_type,metadata").eq("target_user_id", id).in("action", ["Protocol updated", "Lab reviewed"]).order("created_at", { ascending: false }).limit(20),
 ]);

 const events: TimelineEvent[] = [];

 // ── 1. Staff access logs ─────────────────────
 for (const log of logs ?? []) {
 try {
 events.push({
 id: `log-${log.id}`,
 type: "access",
 title: "Staff Access",
 description: `Staff member (${String(log.staff_id).substring(0, 6)}…) accessed ${log.resource_type ?? "record"}`,
 date: new Date(log.created_at),
 icon: <Activity size={16} className="text-blue-400" />,
 });
 } catch { /* skip */ }
 }

 // ── 2. Lab results ───────────────────────────
 for (const lab of labs ?? []) {
 try {
 events.push({
 id: `lab-${lab.id}`,
 type: "lab",
 title: "Lab Result Uploaded",
 description: lab.biological_age != null
 ? `Biological Age: ${lab.biological_age} yrs — Tested ${lab.tested_at ?? "—"}`
 : `Lab results uploaded — Tested ${lab.tested_at ?? "—"}`,
 date: new Date(lab.created_at),
 icon: <FlaskConical size={16} className="text-amber-400" />,
 link: `/staff/clients/${id}/labs`,
 });
 } catch { /* skip */ }
 }

 // ── 3. Appointments ──────────────────────────
 for (const apt of appointments ?? []) {
 try {
 // Always add the booking event
 events.push({
 id: `apt-booked-${apt.id}`,
 type: "appointment",
 title: "Appointment Booked",
 description: `${apt.title ?? "Session"} scheduled for ${apt.scheduled_start ? new Date(apt.scheduled_start).toLocaleDateString() : "TBD"}`,
 date: new Date(apt.created_at),
 icon: <Calendar size={16} className="text-blue-400" />,
 link: `/staff/sessions`,
 });

 // Status-change events (only if status was actually updated)
 if (apt.updated_at && apt.updated_at !== apt.created_at) {
 if (apt.status === "Confirmed") {
 events.push({ id: `apt-confirmed-${apt.id}`, type: "appointment", title: "Appointment Confirmed", description: `${apt.title ?? "Session"} was confirmed.`, date: new Date(apt.updated_at), icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />, link: `/staff/sessions` });
 } else if (apt.status === "Rescheduled") {
 events.push({ id: `apt-rescheduled-${apt.id}`, type: "appointment", title: "Appointment Rescheduled", description: `${apt.title ?? "Session"} was rescheduled to ${apt.scheduled_start ? new Date(apt.scheduled_start).toLocaleDateString() : "TBD"}`, date: new Date(apt.updated_at), icon: <RefreshCw size={16} className="text-amber-400" />, link: `/staff/sessions` });
 } else if (apt.status === "Cancelled") {
 events.push({ id: `apt-cancelled-${apt.id}`, type: "appointment", title: "Appointment Cancelled", description: `${apt.title ?? "Session"} was cancelled.`, date: new Date(apt.updated_at), icon: <XCircle size={16} className="text-destructive" />, link: `/staff/sessions` });
 } else if (apt.status === "Completed") {
 events.push({ id: `apt-completed-${apt.id}`, type: "appointment", title: "Session Completed", description: `${apt.title ?? "Session"} was marked complete.`, date: new Date(apt.updated_at), icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />, link: `/staff/sessions` });
 } else if (apt.status === "No Show") {
 events.push({ id: `apt-noshow-${apt.id}`, type: "appointment", title: "No Show", description: `${apt.title ?? "Session"} — member did not attend.`, date: new Date(apt.updated_at), icon: <Clock size={16} className="text-muted-foreground" />, link: `/staff/sessions` });
 }
 }
 } catch { /* skip */ }
 }

 // ── 4. Protocol items ────────────────────────
 for (const item of protocolItems ?? []) {
 try {
 events.push({
 id: `protocol-${item.id}`,
 type: "protocol",
 title: "Protocol Item Assigned",
 description: `"${item.title ?? "New item"}" was added to this member's protocol.`,
 date: new Date(item.created_at),
 icon: <ListChecks size={16} className="text-purple-400" />,
 link: `/staff/clients/${id}/protocol`,
 });
 } catch { /* skip */ }
 }

 // ── 5. Biological age records ────────────────
 for (const rec of bioRecords ?? []) {
 try {
 events.push({
 id: `bioage-${rec.id}`,
 type: "bioage",
 title: "Biological Age Calculated",
 description: rec.biological_age != null
 ? `Bio Age: ${rec.biological_age} yrs — Longevity Score: ${rec.longevity_score ?? "—"}`
 : "A new biological age calculation was completed.",
 date: new Date(rec.calculated_at ?? rec.created_at),
 icon: <Dna size={16} className="text-[var(--vx-jade)]" />,
 link: `/staff/clients/${id}`,
 });
 } catch { /* skip */ }
 }

 // ── 6. Care team assignments ─────────────────
 for (const assignment of careTeam ?? []) {
 try {
 const staffArr = assignment.staff as { full_name?: string }[] | null;
 const staffName = staffArr?.[0]?.full_name ?? "A clinician";
 events.push({
 id: `team-${assignment.id}`,
 type: "team",
 title: "Care Team Updated",
 description: `${staffName} was assigned as ${assignment.role}.`,
 date: new Date(assignment.created_at),
 icon: <Users size={16} className="text-blue-400" />,
 });
 } catch { /* skip */ }
 }

 // ── 7. Documents ─────────────────────────────
 for (const doc of documents ?? []) {
 try {
 events.push({
 id: `doc-${doc.id}`,
 type: "document",
 title: "Document Uploaded",
 description: `"${doc.title}" (${doc.category})`,
 date: new Date(doc.created_at),
 icon: <FileText size={16} className="text-muted-foreground" />,
 link: `/staff/clients/${id}/labs`,
 });
 } catch { /* skip */ }
 }

 // ── 8. Orders ────────────────────────────────
 for (const order of orders ?? []) {
 try {
 const amount = order.amount_total != null ? `$${(order.amount_total / 100).toFixed(2)}` : "";
 events.push({
 id: `order-${order.id}`,
 type: "order",
 title: "Supplement Order Placed",
 description: `Order placed${amount ? ` for ${amount}` : ""}.`,
 date: new Date(order.created_at),
 icon: <Package size={16} className="text-amber-400" />,
 });
 } catch { /* skip */ }
 }

 // ── 9. Supplement subscriptions ──────────────
 for (const sub of subs ?? []) {
 try {
 if (sub.status === "active") {
 events.push({ id: `sub-start-${sub.id}`, type: "subscription", title: "Subscription Started", description: `Subscription for "${sub.product_name ?? "supplement"}" was activated.`, date: new Date(sub.created_at), icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" /> });
 } else if (sub.status === "cancelled") {
 events.push({ id: `sub-cancel-${sub.id}`, type: "subscription", title: "Subscription Cancelled", description: `Subscription for "${sub.product_name ?? "supplement"}" was cancelled.`, date: new Date(sub.created_at), icon: <XCircle size={16} className="text-destructive" /> });
 }
 } catch { /* skip */ }
 }

 // ── 10. Protocol Completions ─────────────────
 for (const comp of protocolCompletions ?? []) {
 try {
 const itemData = comp.item as any;
 const itemTitle = Array.isArray(itemData) ? itemData[0]?.title : itemData?.title;
 events.push({
 id: `protocol-comp-${comp.id}`,
 type: "protocol",
 title: "Protocol Item Completed",
 description: `"${itemTitle ?? "Item"}" was marked as completed.`,
 date: new Date(comp.completed_at),
 icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />,
 link: `/staff/clients/${id}/protocol`,
 });
 } catch { /* skip */ }
 }

 // ── 11. Messages / Notifications ──────────────
 for (const notif of notifications ?? []) {
 try {
 if (notif.type?.includes("message")) {
 events.push({
 id: `notif-${notif.id}`,
 type: "message",
 title: "Message Received",
 description: notif.message ?? notif.title ?? "New message received.",
 date: new Date(notif.created_at),
 icon: <MessageSquare size={16} className="text-blue-400" />,
 link: `/staff/clients/${id}/messages`,
 });
 }
 } catch { /* skip */ }
 }

 // ── 12. Audit Logs (Protocol updated, Lab reviewed) ──
 for (const log of auditLogs ?? []) {
 try {
 if (log.action === "Protocol updated") {
 events.push({
 id: `audit-${log.id}`,
 type: "protocol",
 title: "Protocol Updated",
 description: "Protocol was updated.",
 date: new Date(log.created_at),
 icon: <ListChecks size={16} className="text-purple-400" />,
 link: `/staff/clients/${id}/protocol`,
 });
 } else if (log.action === "Lab reviewed") {
 events.push({
 id: `audit-${log.id}`,
 type: "lab",
 title: "Lab Reviewed",
 description: "Lab results were reviewed by the care team.",
 date: new Date(log.created_at),
 icon: <FlaskConical size={16} className="text-amber-400" />,
 link: `/staff/clients/${id}/labs`,
 });
 }
 } catch { /* skip */ }
 }

 // ── 13. Account creation ─────────────────────
 if (profile.created_at) {
 events.push({
 id: "account-created",
 type: "system",
 title: "Account Created",
 description: "Member completed signup flow.",
 date: new Date(profile.created_at),
 icon: <CheckCircle2 size={16} className="text-[var(--vx-jade)]" />,
 });
 }

 // ── Deduplicate & sort newest first ──────────
 const seen = new Set<string>();
 const unique = events
 .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
 .sort((a, b) => b.date.getTime() - a.date.getTime());

 return (
 <div className="mx-auto max-w-5xl px-6 py-10" data-testid="staff-client-timeline">
 <h1 className="font-display text-4xl font-medium">{profile.full_name}</h1>
 <ClientTabs id={id} />

 <div className="mt-8 max-w-3xl">
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-display text-xl">Activity Timeline</h2>
 <span className="text-xs text-muted-foreground">{unique.length} events</span>
 </div>

 {unique.length === 0 ? (
 <p className="text-sm text-muted-foreground">No timeline events found.</p>
 ) : (
 <div className="relative border-l border-border pl-6 space-y-6">
 {unique.map((e) => (
 <div key={e.id} className="relative">
 <div className="absolute -left-[35px] bg-card p-1 rounded-full border border-border flex items-center justify-center w-[26px] h-[26px]">
 {e.icon}
 </div>
 <div className="vx-card p-4">
 <div className="flex justify-between items-start gap-4 mb-1">
 <h3 className="font-medium text-sm">{e.title}</h3>
 <time dateTime={e.date.toISOString()} className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
 {e.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
 {" · "}
 {e.date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
 </time>
 </div>
 <p className="text-sm text-muted-foreground">{e.description}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}

