"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();
type Msg = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string };

export default function MessagesPage() {
  const [me, setMe] = useState<string | null>(null);
  const [peer, setPeer] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user.id);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const role = profile?.role || "Member";

      let peerId: string | null = null, peerName = "";
      if (role === "Member") {
        const { data: cr } = await supabase.from("client_records").select("assigned_coach_id").eq("member_id", user.id).single();
        peerId = cr?.assigned_coach_id || null;
      } else {
        const { data: cr } = await supabase.from("client_records").select("member_id").eq("assigned_coach_id", user.id).limit(1).single();
        peerId = cr?.member_id || null;
      }
      if (peerId) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("id", peerId).single();
        peerName = p?.full_name || "Unknown";
        setPeer({ id: peerId, name: peerName });
        const { data: msgs } = await supabase.from("messages").select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
          .order("created_at");
        setMessages(msgs || []);
      }
    })();
  }, []);

  useEffect(() => {
    if (!me || !peer) return;
    const channel = supabase.channel("messages-room")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        if ((m.sender_id === me && m.receiver_id === peer.id) || (m.sender_id === peer.id && m.receiver_id === me)) {
          setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [me, peer]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!text.trim() || !me || !peer) return;
    const { error, data } = await supabase.from("messages").insert({ sender_id: me, receiver_id: peer.id, content: text.trim() }).select().single();
    if (error) return toast.error(error.message);
    setText("");
    if (data) setMessages((prev) => prev.find((x) => x.id === data.id) ? prev : [...prev, data as Msg]);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-3xl flex-col px-6 py-6" data-testid="member-messages-page">
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl">Messages</h1>
        <p className="text-sm text-muted-foreground">{peer ? `with ${peer.name}` : "Awaiting coach assignment"}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-4" data-testid="messages-list">
        {messages.length === 0 ? <p className="text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p> :
          messages.map((m) => (
            <div key={m.id} className={`mb-2 flex ${m.sender_id === me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender_id === me ? "bg-[var(--vx-ink)] text-white" : "bg-card border border-border"}`}>
                {m.content}
              </div>
            </div>
          ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 border-t border-border pt-4">
        <input data-testid="message-input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="vx-input flex-1" />
        <button data-testid="message-send" onClick={send} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
}
