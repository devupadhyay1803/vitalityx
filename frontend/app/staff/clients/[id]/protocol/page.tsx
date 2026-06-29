"use client";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ClientTabs } from "@/components/staff/client-tabs";
import { logClientAudit } from "@/lib/audit-client";

const supabase = createClient();

export default function ProtocolBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, mutate } = useSWR(`builder-${id}`, async () => {
    const { data } = await supabase.from("protocol_items").select("*").eq("member_id", id).order("created_at");
    return data || [];
  });
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");

  async function add() {
    if (!title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("protocol_items").insert({ member_id: id, title, why_text: why, created_by: user!.id });
    if (error) return toast.error(error.message);
    
    await logClientAudit("Protocol created", {
      targetUserId: id,
      resourceType: "protocol",
      metadata: { title }
    });

    setTitle(""); setWhy(""); mutate();
  }
  async function remove(itemId: string) {
    const { error } = await supabase.from("protocol_items").update({ active: false }).eq("id", itemId);
    if (error) return toast.error(error.message);
    
    await logClientAudit("Protocol updated", {
      targetUserId: id,
      resourceType: "protocol",
      resourceId: itemId,
      metadata: { status: "removed" }
    });

    mutate();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10" data-testid="staff-protocol-builder">
      <h1 className="font-display text-4xl font-medium">Protocol builder</h1>

      <ClientTabs id={id} />
      <div className="mt-6 vx-card p-5 space-y-3">
        <input data-testid="builder-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item title (e.g. Zone 2 cardio 45 min, 3×/week)" className="vx-input" />
        <textarea data-testid="builder-why" value={why} onChange={(e) => setWhy(e.target.value)} rows={3} placeholder="Why this is in the plan…" className="vx-input" />
        <button data-testid="builder-add" onClick={add} className="btn btn-primary">Add item</button>
      </div>
      <ul className="mt-6 space-y-2">
        {(data || []).filter((i: any) => i.active).map((it: any) => (
          <li key={it.id} className="vx-card flex items-center justify-between p-4">
            <div><p className="font-medium">{it.title}</p>{it.why_text && <p className="mt-1 text-xs text-muted-foreground">{it.why_text}</p>}</div>
            <button data-testid={`builder-remove-${it.id}`} onClick={() => remove(it.id)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
