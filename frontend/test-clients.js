const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const coachPwd = env.match(/DEMO_COACH_PASSWORD=(.*)/)?.[1] || "CoachDemo2026!";
const coachEmail = env.match(/DEMO_COACH_EMAIL=(.*)/)?.[1] || "dr.vance@vitalityx.com";

const supabase = createClient(url, key);

async function test() {
  const { data: auth } = await supabase.auth.signInWithPassword({ email: coachEmail, password: coachPwd });
  const user = auth.user;
  
  const { data: cr, error } = await supabase
      .from("client_records").select("member_id, assigned_coach_id, created_at, profiles!client_records_member_id_fkey(id, full_name, email, health_goal)")
      .eq("assigned_coach_id", user.id);
  console.log("Clients error:", error);
  console.log("Clients count:", cr ? cr.length : 0);
  if (cr) console.log(JSON.stringify(cr));
}
test();
