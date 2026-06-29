"use client";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();
type Msg = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };

export default function ClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = React.use(params);
  const [me, setMe] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any | null>(null);
  const [assignedCoachId, setAssignedCoachId] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMe(user.id);

    // Fetch client profile
    const { data: clientP } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", memberId)
      .single();
    setClientProfile(clientP);

    // Fetch assigned coach
    const { data: cr } = await supabase
      .from("client_records")
      .select("assigned_coach_id")
      .eq("member_id", memberId)
      .single();
    const coachId = cr?.assigned_coach_id || null;
    setAssignedCoachId(coachId);

    // Fetch all messages involving the client
    const { data: allMsgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${memberId},receiver_id.eq.${memberId}`)
      .order("created_at");
    
    const msgs = allMsgs || [];
    setMessages(msgs);

    // Identify all staff partners who have messaged client or are assigned to client
    const partnerIds = new Set<string>();
    if (coachId) partnerIds.add(coachId);
    partnerIds.add(user.id); // Always include current logged-in staff member
    msgs.forEach((m) => {
      if (m.sender_id !== memberId) partnerIds.add(m.sender_id);
      if (m.receiver_id !== memberId) partnerIds.add(m.receiver_id);
    });

    if (partnerIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role, email")
        .in("id", Array.from(partnerIds));
      
      const loadedPartners = profiles || [];
      setPartners(loadedPartners);

      // Default to opening assigned coach thread on load (or first, preserving selection)
      setSelectedPartner((current: any) => {
        if (current) {
          const updated = loadedPartners.find((p) => p.id === current.id);
          return updated || current;
        }
        if (coachId) {
          return loadedPartners.find((p) => p.id === coachId) || loadedPartners[0] || null;
        }
        return loadedPartners.find((p) => p.id === user.id) || loadedPartners[0] || null;
      });
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(`vx_staff_${memberId}_last_read_timestamps`);
    if (saved) {
      try {
        setLastReadTimestamps(JSON.parse(saved));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [memberId]);

  useEffect(() => {
    loadAll();

    const channel = supabase.channel(`messages-staff-${memberId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        if (m.sender_id === memberId || m.receiver_id === memberId) {
          setMessages((prev) => {
            if (prev.find((x) => x.id === m.id)) return prev;
            return [...prev, m];
          });
          loadAll();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberId]);

  useEffect(() => {
    if (selectedPartner) {
      const nowStr = new Date().toISOString();
      setLastReadTimestamps((prev) => {
        const next = { ...prev, [selectedPartner.id]: nowStr };
        localStorage.setItem(`vx_staff_${memberId}_last_read_timestamps`, JSON.stringify(next));
        return next;
      });
    }
  }, [selectedPartner, messages, memberId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPartner]);

  async function send() {
    if (!text.trim() || !me || !selectedPartner || selectedPartner.id !== me) return;
    const { error, data } = await supabase.from("messages").insert({
      sender_id: me,
      receiver_id: memberId,
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
        (m.sender_id === memberId && m.receiver_id === p.id) ||
        (m.sender_id === p.id && m.receiver_id === memberId)
    );
    const lastMsg = thread[thread.length - 1];
    const lastRead = lastReadTimestamps[p.id] || "1970-01-01T00:00:00.000Z";
    const unreadCount = thread.filter(
      (m) =>
        m.sender_id === memberId &&
        new Date(m.created_at) > new Date(lastRead)
    ).length;

    return {
      ...p,
      lastMessageContent: lastMsg ? lastMsg.content : "No messages yet",
      unreadCount,
    };
  });

  const selectedThreadMessages = selectedPartner
    ? messages.filter(
        (m) =>
          (m.sender_id === memberId && m.receiver_id === selectedPartner.id) ||
          (m.sender_id === selectedPartner.id && m.receiver_id === memberId)
      )
    : [];

  const isMyThread = selectedPartner?.id === me;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl gap-6 px-6 py-6" data-testid="staff-client-messages-page">
      {/* Left panel: thread list */}
      <div className="w-80 shrink-0 border-r border-border pr-4 flex flex-col h-full overflow-y-auto">
        <div className="mb-4">
          <h2 className="font-display text-xl">Client Threads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">for {clientProfile?.full_name || "Client"}</p>
        </div>
        <div className="space-y-1.5 flex-1">
          {enrichedPartners.map((p) => {
            const isActive = selectedPartner?.id === p.id;
            const isSelf = p.id === me;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPartner(p)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition border ${
                  isActive ? "bg-muted border-border" : "hover:bg-muted/50 border-transparent"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
                  {getInitials(p.full_name || p.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-sm truncate">
                      {p.full_name || "Staff"} {isSelf && "(You)"}
                    </p>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.role}</span>
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
        </div>
      </div>

      {/* Right panel: current thread */}
      <div className="flex-1 flex flex-col h-full">
        {selectedPartner ? (
          <>
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <div>
                <h1 className="font-display text-2xl">
                  {selectedPartner.full_name || "Staff"} {isMyThread && "(You)"}
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                  Thread with {clientProfile?.full_name || "Client"}
                </p>
              </div>
            </div>
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2" data-testid="messages-list">
              {selectedThreadMessages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hi 👋</p>
              ) : (
                selectedThreadMessages.map((m) => {
                  const isMe = m.sender_id === me;
                  const isClient = m.sender_id === memberId;
                  const senderName = isClient
                    ? clientProfile?.full_name || "Client"
                    : selectedPartner.full_name || "Staff";
                  
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-muted-foreground px-2 mb-0.5">
                        {isMe ? "You" : senderName}
                      </span>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-[var(--vx-ink)] text-white" : "bg-card border border-border"}`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
            {/* Input box */}
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {isMyThread ? (
                <div className="flex gap-2">
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
              ) : (
                <div className="text-center py-2 px-3 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground">
                  Viewing history between client and {selectedPartner.full_name}. Switch to your own thread to message this client.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation thread to start viewing
          </div>
        )}
      </div>
    </div>
  );
}
