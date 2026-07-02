"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, MessageSquare, Plus, UsersIcon } from "lucide-react";
import { useUser } from "@/components/portal/user-provider";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { ModernEmptyState } from "@/components/dashboard/ModernEmptyState";

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
      setAssignedCoachId(loadedAssignments?.[0]?.staff_id || null);

      const { data: allMsgs, error: msgsError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at");
      if (msgsError) console.warn("Error loading messages:", msgsError);
      
      const msgs = allMsgs || [];
      setMessages(msgs);

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
        const { data: profiles } = await supabase
          .from("profiles")
          .select(`
            id, full_name, role, email, health_goal,
            staff_profiles(profile_photo)
          `)
          .in("id", Array.from(partnerIds));
        
        const loadedPartners = profiles || [];
        setPartners(loadedPartners);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get("highlight");
    if (!highlightId || messages.length === 0 || partners.length === 0) return;

    const targetMessage = messages.find(m => m.id === highlightId);
    if (targetMessage) {
      const partnerId = targetMessage.sender_id === me ? targetMessage.receiver_id : targetMessage.sender_id;
      const partner = partners.find(p => p.id === partnerId);
      if (partner && (!selectedPartner || selectedPartner.id !== partner.id)) {
        setSelectedPartner(partner);
      }
      
      setTimeout(() => {
        const msgEl = document.getElementById(highlightId);
        if (msgEl) {
          msgEl.scrollIntoView({ behavior: "smooth", block: "center" });
          msgEl.classList.add("highlight-flash");
          setTimeout(() => msgEl.classList.remove("highlight-flash"), 3000);
          
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }, 500);
    }
  }, [messages, partners, me, selectedPartner]);

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
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl md:gap-8 px-4 md:px-6 py-4 md:py-8" data-testid="member-messages-page">
      <div className={`${selectedPartner ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col h-full bg-card rounded-[32px] border border-border shadow-sm p-4 overflow-hidden`}>
        <div className="flex items-center gap-3 mb-6 px-2 pt-2">
          <div className="w-10 h-10 rounded-full bg-[var(--vx-jade)]/10 flex items-center justify-center">
            <MessageSquare className="text-[var(--vx-jade)]" size={20} />
          </div>
          <h1 className="font-display text-2xl font-medium tracking-tight">Messages</h1>
        </div>
        
        <div className="relative mb-6">
          <input 
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[var(--vx-jade)] transition-shadow"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 w-full bg-muted/50 rounded-2xl animate-pulse"></div>
              <div className="h-20 w-full bg-muted/50 rounded-2xl animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive bg-destructive/5 rounded-2xl">
              <p className="text-sm font-medium">Failed to load conversations.</p>
              <button onClick={() => { setError(false); setIsLoading(true); loadAll(); }} className="btn btn-outline text-xs mt-3">Try again</button>
            </div>
          ) : filteredActivePartners.map((p) => {
            const isSelected = selectedPartner?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPartner(p)}
                className={`w-full flex items-start gap-3 rounded-2xl p-3 text-left transition-all ${
                  isSelected ? "bg-[var(--vx-jade)]/10" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative shrink-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 text-sm font-bold text-[var(--vx-ink)] border border-border/50">
                    {getInitials(p.full_name || p.email)}
                  </span>
                  {p.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-card">
                      {p.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`font-medium text-sm truncate ${isSelected ? 'text-[var(--vx-ink)]' : 'text-foreground'}`}>{p.full_name || "Staff"}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{p.displayRole}</p>
                  <p className={`text-xs truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{p.lastMessageContent}</p>
                </div>
              </button>
            );
          })}
          {!isLoading && !error && activePartners.length > 0 && filteredActivePartners.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No matching conversations.</p>
          )}
          {!isLoading && !error && activePartners.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet.</p>
          )}
        </div>
      </div>

      <div className={`${selectedPartner ? "flex" : "hidden md:flex"} flex-1 flex-col h-full bg-card rounded-[32px] border border-border shadow-sm overflow-hidden`}>
        {selectedPartner ? (
          <>
            <div className="border-b border-border/50 px-6 py-4 flex justify-between items-center bg-muted/10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedPartner(null)} 
                  className="md:hidden flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 rounded-full transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 text-xs font-bold text-[var(--vx-ink)] border border-border/50">
                    {getInitials(selectedPartner.full_name || selectedPartner.email)}
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-medium tracking-tight">{selectedPartner.full_name || "Staff"}</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{selectedPartner.displayRole}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/5 custom-scrollbar" data-testid="messages-list">
              {selectedThreadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[var(--vx-jade)]/10 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-[var(--vx-jade)]" />
                  </div>
                  <p className="text-muted-foreground">Start the conversation</p>
                  <p className="text-xs text-muted-foreground mt-1">Your messages are secure and encrypted.</p>
                </div>
              ) : (
                selectedThreadMessages.map((m, index) => {
                  const isMe = m.sender_id === me;
                  const prevMessage = index > 0 ? selectedThreadMessages[index - 1] : null;
                  const showAvatar = !prevMessage || prevMessage.sender_id !== m.sender_id;
                  
                  return (
                    <div key={m.id} id={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                      <div className={`flex gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="w-8 shrink-0 flex flex-col justify-end">
                          {showAvatar && !isMe && (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 text-[10px] font-bold text-[var(--vx-ink)]">
                              {getInitials(selectedPartner.full_name || selectedPartner.email)}
                            </span>
                          )}
                        </div>
                        <div className={`px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${
                          isMe 
                            ? "bg-[var(--vx-ink)] text-white rounded-2xl rounded-br-sm" 
                            : "bg-card border border-border text-foreground rounded-2xl rounded-bl-sm"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
            <div className="p-4 border-t border-border/50 bg-card">
              <div className="flex items-end gap-2 bg-muted/30 border border-border/50 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-[var(--vx-jade)] focus-within:border-transparent transition-all">
                <textarea
                  data-testid="message-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus:outline-none resize-none px-4 py-3 text-[15px] max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button 
                  data-testid="message-send" 
                  onClick={send} 
                  disabled={!text.trim()}
                  className="btn btn-primary rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full justify-center">
            {activePartners.length === 0 ? (
              <div className="w-full h-full overflow-y-auto p-8 animate-in fade-in duration-300">
                <div className="text-center mb-10 max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--vx-sapphire)]/20 to-[var(--vx-jade)]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/5">
                    <MessageSquare className="w-8 h-8 text-[var(--vx-jade)]" />
                  </div>
                  <h2 className="font-display text-3xl font-medium tracking-tight mb-3">
                    {myRole === "Member" ? "Your Care Team" : "Your Clients"}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {myRole === "Member" 
                      ? "Start a direct secure conversation with your assigned longevity specialists."
                      : "Initiate direct messaging with your assigned members to guide their protocol."}
                  </p>
                </div>
                
                {inactivePartners.length === 0 ? (
                  <ModernEmptyState
                    icon={<UsersIcon size={32} />}
                    title="No contacts available"
                    description={myRole === "Member" ? "No care team specialists assigned yet. Please contact support." : "No clients assigned to your care team yet."}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pb-10">
                    {inactivePartners.map((p) => {
                      const photo = p.staff_profiles?.[0]?.profile_photo;
                      return (
                        <PremiumCard interactive key={p.id} className="flex flex-col items-center text-center p-8 group">
                          <div className="w-20 h-20 rounded-full overflow-hidden mb-5 bg-muted relative shadow-sm shrink-0 border border-border group-hover:border-[var(--vx-jade)] transition-colors">
                            {photo ? (
                              <img src={photo} alt={p.full_name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 text-[var(--vx-ink)]">
                                {getInitials(p.full_name || p.email)}
                              </div>
                            )}
                          </div>
                          <h3 className="font-display text-xl font-medium truncate w-full group-hover:text-[var(--vx-jade)] transition-colors">{p.full_name}</h3>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2 font-semibold">{p.displayRole}</p>
                          
                          {myRole === "Member" && p.email && (
                            <p className="text-sm text-muted-foreground truncate w-full mt-1">{p.email}</p>
                          )}
                          {myRole !== "Member" && p.health_goal && (
                            <div className="mt-4 px-4 py-1.5 bg-muted/50 rounded-full border border-border/50">
                              <p className="text-xs text-foreground truncate w-full font-medium">{p.health_goal}</p>
                            </div>
                          )}
                          <div className="mt-auto pt-6 w-full">
                            <button 
                              onClick={() => setSelectedPartner(p)}
                              className="btn w-full justify-center bg-[var(--vx-ink)] text-white hover:bg-[var(--vx-ink)]/90"
                              data-testid={`start-chat-${p.id}`}
                            >
                              Start Conversation
                            </button>
                          </div>
                        </PremiumCard>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="font-display text-2xl font-medium tracking-tight mb-2">Your Messages</h3>
                <p className="text-muted-foreground">Select a conversation from the sidebar to start messaging</p>
                
                {inactivePartners.length > 0 && (
                  <div className="mt-12 w-full max-w-2xl text-left bg-muted/30 p-8 rounded-[32px] border border-border/50">
                    <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Plus size={16} className="text-[var(--vx-jade)]" />
                      Start a New Conversation
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {inactivePartners.map((p) => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedPartner(p)}
                          className="bg-card p-4 flex items-center gap-4 rounded-2xl border border-border shadow-sm hover:border-[var(--vx-jade)] hover:shadow-md transition-all text-left"
                          data-testid={`start-chat-${p.id}`}
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--vx-jade)]/20 to-[var(--vx-ink)]/20 text-sm font-bold text-[var(--vx-ink)]">
                            {getInitials(p.full_name || p.email)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-[15px] truncate text-foreground">{p.full_name}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground truncate uppercase tracking-widest mt-0.5">{p.displayRole}</p>
                          </div>
                        </button>
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
