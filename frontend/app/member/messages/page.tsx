"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { useUser } from "@/components/portal/user-provider";

const supabase = createClient();
type Msg = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };

export default function MessagesPage() {
 const { user, profile } = useUser();
 const [me, setMe] = useState<string>(user.id);
 const [myRole, setMyRole] = useState<string>(profile.role);
 const [assignments, setAssignments] = useState<any[]>([]);
 const [assignedCoachId, setAssignedCoachId] = useState<string | null>(null);
 const [partners, setPartners] = useState<any[]>([]);
 const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
 const [messages, setMessages] = useState<Msg[]>([]);
 const [text, setText] = useState("");
 const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(false);
 const endRef = useRef<HTMLDivElement>(null);

 async function loadAll() {
 try {
 // Fetch care team assignments to find partners
 const { data: assignmentsData, error: assignmentsError } = await supabase
 .from("care_team_assignments")
 .select("staff_id, member_id, role")
 .or(`member_id.eq.${user.id},staff_id.eq.${user.id}`);
 if (assignmentsError) console.warn("Error loading assignments:", assignmentsError);
 
 let loadedAssignments = assignmentsData || [];

 if (profile.role === "Member" && loadedAssignments.length === 0) {
 try {
 const res = await fetch("/api/care-team/auto-assign", { method: "POST" });
 const resData = await res.json();
 if (resData.success) {
 const { data: reassignments } = await supabase
 .from("care_team_assignments")
 .select("staff_id, member_id, role")
 .or(`member_id.eq.${user.id},staff_id.eq.${user.id}`);
 if (reassignments) {
 loadedAssignments = reassignments;
 }
 }
 } catch (fetchErr) {
 console.warn("Failed to auto-assign care team:", fetchErr);
 }
 }
 
 setAssignments(loadedAssignments);
 
 // We keep assignedCoachId for backwards compatibility but we'll use partnerIds primarily
 setAssignedCoachId(loadedAssignments?.[0]?.staff_id || null);

 // Fetch all messages involving user
 const { data: allMsgs, error: msgsError } = await supabase
 .from("messages")
 .select("*")
 .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
 .order("created_at");
 if (msgsError) console.warn("Error loading messages:", msgsError);
 
 const msgs = allMsgs || [];
 setMessages(msgs);

 // Find all partner IDs
 const partnerIds = new Set<string>();
 if (loadedAssignments) {
 loadedAssignments.forEach((a) => {
 if (a.staff_id !== user.id) partnerIds.add(a.staff_id);
 if (a.member_id !== user.id) partnerIds.add(a.member_id);
 });
 }
 msgs.forEach((m) => {
 if (m.sender_id !== user.id) partnerIds.add(m.sender_id);
 if (m.receiver_id !== user.id) partnerIds.add(m.receiver_id);
 });

 if (partnerIds.size > 0) {
 // Fetch profiles of all these partners including staff profiles (for photos)
 const { data: profiles } = await supabase
 .from("profiles")
 .select(`
 id, full_name, role, email, health_goal,
 staff_profiles(profile_photo)
 `)
 .in("id", Array.from(partnerIds));
 
 const loadedPartners = profiles || [];
 setPartners(loadedPartners);

 // Default to opening first active thread on load if active threads exist
 // Otherwise, keep selectedPartner as null so they see the contacts cards grid!
 setSelectedPartner((current: any) => {
 if (current) {
 const updated = loadedPartners.find((p) => p.id === current.id);
 return updated || current;
 }
 
 const activePartnerIds = new Set(msgs.map(m => m.sender_id === user.id ? m.receiver_id : m.sender_id));
 if (activePartnerIds.size > 0) {
 const firstActivePartner = loadedPartners.find(p => activePartnerIds.has(p.id));
 return firstActivePartner || null;
 }
 return null;
 });
 }
 } catch (e) {
 console.warn("Failed to load message conversations:", e);
 setError(true);
 } finally {
 setIsLoading(false);
 }
 }

 useEffect(() => {
 const saved = localStorage.getItem("vx_last_read_timestamps");
 if (saved) {
 try {
 setLastReadTimestamps(JSON.parse(saved));
 } catch (e) {
 console.warn(e);
 }
 }
 }, []);

 useEffect(() => {
 loadAll();

 const channel = supabase.channel("messages-all")
 .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
 const m = payload.new as Msg;
 setMe((currentMe) => {
 if (!currentMe) return currentMe;
 if (m.sender_id === currentMe || m.receiver_id === currentMe) {
 setMessages((prev) => {
 if (prev.find((x) => x.id === m.id)) return prev;
 return [...prev, m];
 });
 loadAll();
 }
 return currentMe;
 });
 })
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, []);

 useEffect(() => {
 if (selectedPartner) {
 const nowStr = new Date().toISOString();
 setLastReadTimestamps((prev) => {
 const next = { ...prev, [selectedPartner.id]: nowStr };
 localStorage.setItem("vx_last_read_timestamps", JSON.stringify(next));
 return next;
 });
 }
 }, [selectedPartner, messages]);

 useEffect(() => {
 endRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, selectedPartner]);

 async function send() {
 if (!text.trim() || !me || !selectedPartner) return;
 const { error, data } = await supabase.from("messages").insert({
 sender_id: me,
 receiver_id: selectedPartner.id,
 content: text.trim()
 }).select().single();
 if (error) return toast.error(error.message);
 setText("");
 if (data) {
 setMessages((prev) => prev.find((x) => x.id === data.id) ? prev : [...prev, data as Msg]);
 }
 }

 // Map partners with details
 const enrichedPartners = partners.map((p) => {
 const thread = messages.filter(
 (m) =>
 (m.sender_id === me && m.receiver_id === p.id) ||
 (m.sender_id === p.id && m.receiver_id === me)
 );
 const lastMsg = thread[thread.length - 1];
 const lastRead = lastReadTimestamps[p.id] || "1970-01-01T00:00:00.000Z";
 const unreadCount = thread.filter(
 (m) =>
 m.sender_id === p.id &&
 new Date(m.created_at) > new Date(lastRead)
 ).length;

 const careTeamRole = assignments?.find(
 (a: any) => a.staff_id === p.id || a.member_id === p.id
 )?.role;

 return {
 ...p,
 displayRole: careTeamRole || p.role,
 lastMessageContent: lastMsg ? lastMsg.content : "No messages yet",
 unreadCount,
 hasMessages: thread.length > 0
 };
 });

 const [search, setSearch] = useState("");

 const activePartners = enrichedPartners.filter(p => p.hasMessages);
 const inactivePartners = enrichedPartners.filter(p => !p.hasMessages);

 const filteredActivePartners = activePartners.filter(p => 
 !search || (p.full_name || "").toLowerCase().includes(search.toLowerCase())
 );

 const selectedThreadMessages = selectedPartner
 ? messages.filter(
 (m) =>
 (m.sender_id === me && m.receiver_id === selectedPartner.id) ||
 (m.sender_id === selectedPartner.id && m.receiver_id === me)
 )
 : [];

 return (
 <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl md:gap-6 px-4 md:px-6 py-4 md:py-6" data-testid="member-messages-page">
 {/* Left panel: thread list */}
 <div className={`${selectedPartner ? "hidden md:flex" : "flex"} w-full md:w-1/3 md:border-r border-border md:pr-6 flex-col`}>
 <div className="flex items-center gap-2 mb-4">
 <MessageSquare className="text-[var(--vx-jade)]" size={24} />
 <h1 className="font-display text-2xl font-medium">Messages</h1>
 </div>
 
 <div className="relative mb-4">
 <input 
 type="text"
 placeholder="Search conversations..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="vx-input w-full text-sm h-9 pl-9"
 />
 <div className="absolute left-3 top-1/2 -translate-y-1/2">
 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto space-y-2 pr-2">
 {isLoading ? (
 <div className="space-y-3">
 <div className="h-16 w-full bg-muted rounded-xl animate-pulse"></div>
 <div className="h-16 w-full bg-muted rounded-xl animate-pulse"></div>
 </div>
 ) : error ? (
 <div className="p-6 text-center text-destructive">
 <p className="text-sm">Failed to load conversations.</p>
 <button onClick={() => { setError(false); setIsLoading(true); loadAll(); }} className="btn btn-outline text-xs mt-2">Try again</button>
 </div>
 ) : filteredActivePartners.map((p) => {
 const isSelected = selectedPartner?.id === p.id;
 return (
 <button
 key={p.id}
 onClick={() => setSelectedPartner(p)}
 className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
 isSelected ? "bg-muted border border-border" : "hover:bg-muted/50 border border-transparent"
 }`}
 >
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
 {getInitials(p.full_name || p.email)}
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex justify-between items-baseline">
 <p className="font-medium text-sm truncate">{p.full_name || "Staff"}</p>
 <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.displayRole}</span>
 </div>
 <p className="text-xs text-muted-foreground truncate mt-0.5">{p.lastMessageContent}</p>
 </div>
 {p.unreadCount > 0 && (
 <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white shrink-0">
 {p.unreadCount}
 </span>
 )}
 </button>
 );
 })}
 {!isLoading && !error && activePartners.length > 0 && filteredActivePartners.length === 0 && (
 <p className="text-sm text-muted-foreground text-center py-6">No matching conversations.</p>
 )}
 {!isLoading && !error && activePartners.length === 0 && (
 <p className="text-sm text-muted-foreground text-center py-6">No conversations yet.</p>
 )}
 </div>
 </div>

 {/* Right panel: current thread */}
 <div className={`${selectedPartner ? "flex" : "hidden md:flex"} flex-1 flex-col h-full`}>
 {selectedPartner ? (
 <>
 <div className="border-b border-border pb-4 flex justify-between items-center">
 <div className="flex items-center gap-3">
 <button 
 onClick={() => setSelectedPartner(null)} 
 className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mr-2 bg-muted/40 hover:bg-muted/80 px-2.5 py-1 rounded-lg transition"
 >
 <ChevronLeft size={14} /> Back
 </button>
 <div>
 <h1 className="font-display text-2xl">{selectedPartner.full_name || "Staff"}</h1>
 <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{selectedPartner.displayRole}</p>
 </div>
 </div>
 </div>
 {/* Messages list */}
 <div className="flex-1 overflow-y-auto py-4 space-y-2" data-testid="messages-list">
 {selectedThreadMessages.length === 0 ? (
 <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hi 👋</p>
 ) : (
 selectedThreadMessages.map((m) => {
 const isMe = m.sender_id === me;
 return (
 <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
 <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-[var(--vx-ink)] text-white" : "vx-card"}`}>
 {m.content}
 </div>
 </div>
 );
 })
 )}
 <div ref={endRef} />
 </div>
 {/* Input box */}
 <div className="flex gap-2 border-t border-border pt-4">
 <input
 data-testid="message-input"
 value={text}
 onChange={(e) => setText(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && send()}
 placeholder="Type a message…"
 className="vx-input flex-1"
 />
 <button data-testid="message-send" onClick={send} className="btn btn-primary">Send</button>
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col h-full justify-center">
 {activePartners.length === 0 ? (
 // Full contacts grid for new users
 <div className="max-w-3xl mx-auto w-full px-4 py-8 animate-in fade-in zoom-in-95 duration-350">
 <div className="text-center mb-8">
 <div className="w-16 h-16 bg-gradient-to-tr from-[var(--vx-sapphire)]/25 to-[var(--vx-jade)]/25 rounded-full blur-xl mx-auto -mb-12 opacity-60" />
 <MessageSquare className="w-10 h-10 text-[var(--vx-jade)] mx-auto mb-3" />
 <h2 className="font-display text-2xl font-medium tracking-tight">
 {myRole === "Member" ? "Your Care Team" : "Your Clients"}
 </h2>
 <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
 {myRole === "Member" 
 ? "Start a direct secure conversation with your assigned longevity specialists."
 : "Initiate direct messaging with your assigned members to guide their protocol."}
 </p>
 </div>
 
 {inactivePartners.length === 0 ? (
 <div className="text-center p-8 bg-card rounded-2xl border border-border">
 <p className="text-sm text-muted-foreground">
 {myRole === "Member"
 ? "No care team specialists assigned yet. Please contact support."
 : "No clients assigned to your care team yet."}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
 {inactivePartners.map((p) => {
 const photo = p.staff_profiles?.[0]?.profile_photo;
 return (
 <div key={p.id} className="vx-card p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:border-[var(--vx-jade)]/40" data-testid={`contact-card-${p.id}`}>
 {/* Avatar */}
 <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-muted relative shadow-sm shrink-0 border border-border">
 {photo ? (
 <img src={photo} alt={p.full_name} className="object-cover w-full h-full" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-xl font-semibold bg-[var(--vx-jade)]/10 text-[var(--vx-jade)]">
 {getInitials(p.full_name || p.email)}
 </div>
 )}
 </div>
 <h3 className="font-display text-lg font-medium truncate w-full">{p.full_name}</h3>
 <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1 font-medium">{p.displayRole}</p>
 {myRole === "Member" && p.email && (
 <p className="text-xs text-muted-foreground/60 truncate w-full mt-0.5">{p.email}</p>
 )}
 {myRole !== "Member" && p.health_goal && (
 <p className="text-xs text-[var(--vx-sapphire)] truncate w-full mt-2 bg-[var(--vx-sapphire)]/5 px-3 py-1 rounded-full font-medium">{p.health_goal}</p>
 )}
 <button 
 onClick={() => setSelectedPartner(p)}
 className="btn btn-primary w-full mt-5 text-sm"
 data-testid={`start-chat-${p.id}`}
 >
 Start Conversation
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 ) : (
 // Default prompt + smaller new conversation grid for existing users
 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-200">
 <MessageSquare className="w-12 h-12 text-muted-foreground mb-3 opacity-60" />
 <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
 {inactivePartners.length > 0 && (
 <div className="mt-8 w-full max-w-2xl text-left">
 <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Start a New Conversation</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {inactivePartners.map((p) => (
 <div key={p.id} className="vx-card p-4 flex items-center justify-between gap-4 hover:border-[var(--vx-jade)]/40 transition-colors">
 <div className="flex items-center gap-3 overflow-hidden">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
 {getInitials(p.full_name || p.email)}
 </span>
 <div className="min-w-0 flex-1">
 <p className="font-medium text-sm truncate">{p.full_name}</p>
 <p className="text-xs text-muted-foreground truncate uppercase tracking-wider">{p.displayRole}</p>
 </div>
 </div>
 <button 
 onClick={() => setSelectedPartner(p)}
 className="btn btn-primary px-3 text-xs shrink-0"
 data-testid={`start-chat-${p.id}`}
 >
 Message
 </button>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
