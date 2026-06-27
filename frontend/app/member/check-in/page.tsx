"use client";
import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const supabase = createClient();

export default function CheckInPage() {
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(7);
  const { data, mutate } = useSWR("checkins", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { data } = await supabase.from("daily_checkins").select("*").eq("member_id", user.id).gte("checked_in_at", since).order("checked_in_at");
    return data || [];
  });

  async function submit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("daily_checkins").insert({ member_id: user.id, sleep_score: sleep, energy_score: energy, mood_score: mood });
    if (error) return toast.error(error.message);
    toast.success("Check-in recorded");
    mutate();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10" data-testid="member-checkin-page">
      <h1 className="font-display text-4xl font-medium">Daily check-in</h1>
      <p className="mt-2 text-muted-foreground">30 seconds. We use this to tune your protocol.</p>
      <div className="mt-8 space-y-7 vx-card p-6">
        <Slider label="Sleep" value={sleep} onChange={setSleep} testId="checkin-sleep" />
        <Slider label="Energy" value={energy} onChange={setEnergy} testId="checkin-energy" />
        <Slider label="Mood" value={mood} onChange={setMood} testId="checkin-mood" />
        <button data-testid="checkin-submit" onClick={submit} className="btn btn-primary w-full">Submit check-in</button>
      </div>

      <h2 className="mt-10 font-display text-xl">Last 7 days</h2>
      {!data || data.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No check-ins yet this week.</p> : (
        <div className="mt-3 h-40 vx-card p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="checked_in_at" hide />
              <Tooltip />
              <Line type="monotone" dataKey="sleep_score" stroke="oklch(0.78 0.16 160)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energy_score" stroke="oklch(0.82 0.16 80)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mood_score" stroke="oklch(0.72 0.18 25)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, testId }: { label: string; value: number; onChange: (v: number) => void; testId: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <span className="text-sm">{label}</span>
        <span className="font-mono text-sm">{value}/10</span>
      </div>
      <input data-testid={testId} type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--vx-jade)]" />
    </div>
  );
}
