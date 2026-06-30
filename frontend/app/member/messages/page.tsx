"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const supabase = createClient();
type Msg = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };

export default function MessagesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [assignedCoachId, setAssignedCoachId] = useState<string | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  async function loadAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);

      // Fetch care team assignments to find partners
      const { data: assignments } = await supabase
        .from("care_team_assignments")
        .select("staff_id, member_id")
        .or(`member_id.eq.${user.id},staff_id.eq.${user.id}`);
      
      // We keep assignedCoachId for backwards compatibility but we'll use partnerIds primarily
      setAssignedCoachId(assignments?.[0]?.staff_id || null);

      // Fetch all messages involving user
      const { data: allMsgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at");
      
      const msgs = allMsgs || [];
      setMessages(msgs);

      // Find all partner IDs
      const partnerIds = new Set<string>();
      if (assignments) {
        assignments.forEach((a) => {
          if (a.staff_id !== user.id) partnerIds.add(a.staff_id);
          if (a.member_id !== user.id) partnerIds.add(a.member_id);
        });
      }
      msgs.forEach((m) => {
        if (m.sender_id !== user.id) partnerIds.add(m.sender_id);
        if (m.receiver_id !== user.id) partnerIds.add(m.receiver_id);
      });

      if (partnerIds.size > 0) {
        // Fetch profiles of all these partners
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, role, email")
          .in("id", Array.from(partnerIds));
        
        const loadedPartners = profiles || [];
        setPartners(loadedPartners);

        // Default to opening assigned coach thread on load (or first, preserving current selection)
        setSelectedPartner((current: any) => {
          if (current) {
            const updated = loadedPartners.find((p) => p.id === current.id);
            return updated || current;
          }
          if (assignments && assignments.length > 0) {
            const firstPartnerId = assignments[0].staff_id === user.id ? assignments[0].member_id : assignments[0].staff_id;
            return loadedPartners.find((p) => p.id === firstPartnerId) || loadedPartners[0] || null;
          }
          return loadedPartners[0] || null;
        });
      }
    } catch (e) {
      console.warn("Failed to load message conversations:", e);
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

    return {
      ...p,
      lastMessageContent: lastMsg ? lastMsg.content : "No messages yet",
      unreadCount,
    };
  });

  const selectedThreadMessages = selectedPartner
    ? messages.filter(
        (m) =>
          (m.sender_id === me && m.receiver_id === selectedPartner.id) ||
          (m.sender_id === selectedPartner.id && m.receiver_id === me)
      )
    : [];

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl gap-6 px-6 py-6" data-testid="member-messages-page">
      {/* Left panel: thread list */}
      <div className="w-80 shrink-0 border-r border-border pr-4 flex flex-col h-full overflow-y-auto">
        <h2 className="font-display text-xl mb-4">Conversations</h2>
        <div className="space-y-1.5 flex-1">
          {enrichedPartners.map((p) => {
            const isActive = selectedPartner?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPartner(p)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
                  isActive ? "bg-muted border border-border" : "hover:bg-muted/50 border border-transparent"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--vx-ink)] text-sm font-semibold text-white">
                  {getInitials(p.full_name || p.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-sm truncate">{p.full_name || "Staff"}</p>
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
          {enrichedPartners.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </div>

      {/* Right panel: current thread */}
      <div className="flex-1 flex flex-col h-full">
        {selectedPartner ? (
          <>
            <div className="border-b border-border pb-4 flex justify-between items-center">
              <div>
                <h1 className="font-display text-2xl">{selectedPartner.full_name || "Staff"}</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{selectedPartner.role}</p>
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
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
