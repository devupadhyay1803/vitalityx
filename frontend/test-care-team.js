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
  
  const { data: members, error } = await supabase
    .from("profiles")
    .select(`
      id, full_name, email,
      care_team_assignments!care_team_assignments_member_id_fkey(
        id, role, is_primary,
        staff:profiles!care_team_assignments_staff_id_fkey(id, full_name)
      )
    `)
    .eq("role", "Member");
  console.log("Care team members error:", error);
  console.log("Care team members count:", members ? members.length : 0);
  if (members) console.log(JSON.stringify(members[0]));
}
test();
