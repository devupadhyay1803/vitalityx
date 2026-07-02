"use client";
import useSWR from "swr";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

import { useHighlight } from "@/hooks/use-highlight";

import { TimelineItem } from "@/components/ui/TimelineItem";
import { PremiumCard } from "@/components/ui/PremiumCard";

export default function ProtocolPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useState<Set<string> | null>(null);
  const { data, error, isLoading, mutate } = useSWR("protocol-full", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { userId: "", items: [], doneToday: new Set<string>() };
    const [{ data: items, error: err1 }, { data: comps, error: err2 }] = await Promise.all([
      supabase.from("protocol_items").select("*").eq("member_id", user.id).eq("active", true).order("created_at"),
      supabase.from("protocol_completions").select("item_id, completed_at").eq("member_id", user.id).gte("completed_at", new Date(new Date().toDateString()).toISOString()),
    ]);
    if (err1) throw err1;
    if (err2) throw err2;
    return { userId: user.id, items: items || [], doneToday: new Set<string>((comps || []).map((c: any) => c.item_id)) };
  });

  useHighlight(data?.items.map((i: any) => i.id) || []);

  if (isLoading) return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2"></div>
      <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8"></div>
      <div className="space-y-3">
        <div className="h-16 bg-muted/50 rounded-xl animate-pulse"></div>
        <div className="h-16 bg-muted/50 rounded-xl animate-pulse"></div>
        <div className="h-16 bg-muted/50 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-center">
      <p className="text-destructive font-medium">Failed to load protocol.</p>
      <button onClick={() => mutate()} className="mt-4 btn btn-outline text-xs">Try again</button>
    </div>
  );

  if (!data || !data.userId) return null;

  const activeDoneToday = optimisticDone || data.doneToday;
  const totalItems = data.items.length;
  const completedItems = activeDoneToday.size;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  async function toggle(id: string) {
    if (!data) return;
    
    const newDoneToday = new Set(activeDoneToday);
    const isDone = newDoneToday.has(id);
    if (isDone) {
      newDoneToday.delete(id);
    } else {
      newDoneToday.add(id);
    }
    
    setOptimisticDone(newDoneToday);

    try {
      if (isDone) {
        const { error } = await supabase.from("protocol_completions").delete().eq("item_id", id).eq("member_id", data.userId)
          .gte("completed_at", new Date(new Date().toDateString()).toISOString());
        if (error) throw error;
      } else {
        const { error } = await supabase.from("protocol_completions").insert({ item_id: id, member_id: data.userId });
        if (error) throw error;
      }
      mutate({ ...data, doneToday: newDoneToday }, false); // Update SWR cache silently
    } catch (err: any) {
      toast.error(err.message || "Failed to update protocol");
      setOptimisticDone(data.doneToday); // Revert to source of truth
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="member-protocol-page">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight">Today's Protocol</h1>
          <p className="mt-2 text-muted-foreground text-lg">Follow your personalized daily plan.</p>
        </div>
        
        {totalItems > 0 && (
          <div className="flex items-center gap-4 bg-muted/50 px-4 py-3 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Progress</span>
              <span className="font-display text-xl">{completedItems} / {totalItems}</span>
            </div>
            <div className="relative h-12 w-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle className="text-muted stroke-current" strokeWidth="4" cx="24" cy="24" r="20" fill="transparent"></circle>
                <circle className="text-[var(--vx-jade)] stroke-current transition-all duration-500 ease-in-out" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * progressPercent) / 100} strokeLinecap="round" cx="24" cy="24" r="20" fill="transparent"></circle>
              </svg>
              <span className="absolute text-xs font-medium">{progressPercent}%</span>
            </div>
          </div>
        )}
      </div>

      {data.items.length === 0 ? (
        <PremiumCard className="text-center py-16 bg-muted/20 border-dashed">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-display text-xl mb-2">No Protocol Items</h3>
          <p className="text-muted-foreground">Your coach hasn't published any items for your daily protocol yet.</p>
        </PremiumCard>
      ) : (
        <div className="mt-8 ml-2 space-y-0 relative">
          {data.items.map((it: any, index: number) => {
            const done = activeDoneToday.has(it.id);
            const open = openId === it.id;
            const isLast = index === data.items.length - 1;
            
            return (
              <TimelineItem 
                key={it.id} 
                icon={done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                onIconClick={() => toggle(it.id)}
                isActive={done}
                isLast={isLast}
                title={
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(it.id)} className={`hover:text-[var(--vx-jade)] transition-colors ${done ? 'line-through opacity-70' : ''}`}>
                      {it.title}
                    </button>
                    <button onClick={() => setOpenId(open ? null : it.id)} className="p-1 rounded-full hover:bg-muted ml-auto sm:ml-2 text-muted-foreground">
                      <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                }
                description={
                  open && (
                    <div className="mt-2 p-4 bg-muted/30 rounded-xl border border-border/50 text-foreground">
                      <strong className="block mb-1 text-xs uppercase tracking-wider text-muted-foreground">The Why</strong>
                      {it.why_text || "No reasoning provided yet."}
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
