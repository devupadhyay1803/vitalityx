"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export default function ProtocolPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, mutate } = useSWR("protocol-full", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [{ data: items }, { data: comps }] = await Promise.all([
      supabase.from("protocol_items").select("*").eq("member_id", user.id).eq("active", true).order("created_at"),
      supabase.from("protocol_completions").select("item_id, completed_at").eq("member_id", user.id).gte("completed_at", new Date(new Date().toDateString()).toISOString()),
    ]);
    return { userId: user.id, items: items || [], doneToday: new Set((comps || []).map((c: any) => c.item_id)) };
  });
  if (!data) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;

  async function toggle(id: string) {
    if (!data) return;
    if (data.doneToday.has(id)) {
      await supabase.from("protocol_completions").delete().eq("item_id", id).eq("member_id", data.userId)
        .gte("completed_at", new Date(new Date().toDateString()).toISOString());
    } else {
      const { error } = await supabase.from("protocol_completions").insert({ item_id: id, member_id: data.userId });
      if (error) toast.error(error.message);
    }
    mutate();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="member-protocol-page">
      <h1 className="font-display text-4xl font-medium">Protocol</h1>
      <p className="mt-2 text-muted-foreground">Tap to mark complete. Tap the chevron to read the reasoning.</p>
      {data.items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Your coach hasn&apos;t published items yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {data.items.map((it: any) => {
            const done = data.doneToday.has(it.id);
            const open = openId === it.id;
            return (
              <li key={it.id} className="vx-card">
                <div className="flex items-center gap-3 p-4">
                  <button data-testid={`protocol-check-${it.id}`} onClick={() => toggle(it.id)}>
                    {done ? <CheckCircle2 size={20} className="text-[var(--vx-jade)]" /> : <Circle size={20} className="text-muted-foreground" />}
                  </button>
                  <span className={`flex-1 ${done ? "line-through opacity-60" : ""}`}>{it.title}</span>
                  <button onClick={() => setOpenId(open ? null : it.id)} className="rounded-full p-1 hover:bg-muted">
                    <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {open && <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{it.why_text || "No reasoning provided yet."}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
