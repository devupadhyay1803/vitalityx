const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const coachPwd = env.match(/DEMO_COACH_PASSWORD=(.*)/)?.[1] || "CoachDemo2026!";
const coachEmail = env.match(/DEMO_COACH_EMAIL=(.*)/)?.[1] || "dr.vance@vitalityx.com";

const supabase = createClient(url, key);

async function test() {
  const { data: auth, error: err1 } = await supabase.auth.signInWithPassword({
    email: coachEmail,
    password: coachPwd
  });
  if (err1) { console.error("Auth error", err1); return; }
  console.log("Logged in as", auth.user.email);

  const { data: profiles, error: err2 } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles ? profiles.length : 0, err2);
  
  const { data: clients, error: err3 } = await supabase.from("client_records").select("member_id, assigned_coach_id, profiles!client_records_member_id_fkey(id, full_name)");
  console.log("Clients count:", clients ? clients.length : 0, JSON.stringify(clients), err3);
}

test();
