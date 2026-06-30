const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  console.error("Run this script using: node --env-file=.env.local scripts/seed-demo.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to generate deterministic UUIDs
function uuid(str) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const DEMO_PASSWORD = "Demo@12345";
const MEMBER = {
  email: "demo.member@vitalityx.ai",
  full_name: "Sarah Johnson",
  role: "Member"
};

const STAFF = {
  email: "demo.staff@vitalityx.ai",
  full_name: "Admin Demo",
  role: "Coach"
};

async function ensureUser(userDef) {
  let { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  let user = users.find(u => u.email === userDef.email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userDef.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: userDef.full_name }
    });
    if (error) throw error;
    user = data.user;
    console.log(`✅ Created auth user: ${userDef.email}`);
  } else {
    // Ensure password is correct
    await supabase.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
    console.log(`✅ Auth user exists (password synced): ${userDef.email}`);
  }

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: userDef.full_name,
    role: userDef.role,
    email: userDef.email,
    created_at: new Date().toISOString()
  });
  if (profileError) throw profileError;

  return user;
}

async function seed() {
  console.log("🌱 Starting Demo Seeder...");
  
  try {
    const member = await ensureUser(MEMBER);
    const staff = await ensureUser(STAFF);

    console.log(`👤 Member ID: ${member.id}`);
    console.log(`👨‍⚕️ Staff ID: ${staff.id}`);

    // --- Care Team & Client Records ---
    const assignmentId = uuid(`care-team-${member.id}-${staff.id}`);
    await supabase.from('care_team_assignments').upsert({
      id: assignmentId,
      member_id: member.id,
      staff_id: staff.id,
      role: 'Lead Coach',
      assigned_at: new Date().toISOString()
    });
    
    // Update the auto-generated client_record to assign the coach
    await supabase.from('client_records').update({
      assigned_coach_id: staff.id,
      consented: true,
      consented_at: new Date().toISOString(),
      consent_version: '1.0'
    }).eq('member_id', member.id);
    
    console.log("✅ Seeded Care Team & Client Records");

    // --- Appointments ---
    const now = new Date();
    // Start of today so it appears on "Today's sessions"
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0); 
    const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    await supabase.from('appointments').upsert([
      {
        id: uuid(`appt-past-${member.id}`),
        member_id: member.id,
        staff_id: staff.id,
        title: "Onboarding Session",
        session_type: "Onboarding",
        scheduled_start: pastDate.toISOString(),
        scheduled_end: new Date(pastDate.getTime() + 45 * 60000).toISOString(),
        status: 'Completed',
        meeting_link: 'https://meet.google.com/demo-appt-1'
      },
      {
        id: uuid(`appt-today-${member.id}`),
        member_id: member.id,
        staff_id: staff.id,
        title: "Weekly Check-in",
        session_type: "Check-in",
        scheduled_start: today.toISOString(),
        scheduled_end: new Date(today.getTime() + 30 * 60000).toISOString(),
        status: 'Confirmed',
        meeting_link: 'https://meet.google.com/demo-appt-today'
      },
      {
        id: uuid(`appt-future-${member.id}`),
        member_id: member.id,
        staff_id: staff.id,
        title: "Follow-up",
        session_type: "Check-in",
        scheduled_start: futureDate.toISOString(),
        scheduled_end: new Date(futureDate.getTime() + 30 * 60000).toISOString(),
        status: 'Scheduled',
        meeting_link: 'https://meet.google.com/demo-appt-2'
      }
    ]);
    console.log("✅ Seeded Appointments");

    // --- Documents ---
    await supabase.from('documents').upsert([
      {
        id: uuid(`doc-1-${member.id}`),
        member_id: member.id,
        title: 'Initial Intake Form',
        file_path: 'demo/intake.pdf',
        file_type: 'pdf',
        size_bytes: 102400,
        category: 'Intake',
        uploaded_at: pastDate.toISOString()
      },
      {
        id: uuid(`doc-2-${member.id}`),
        member_id: member.id,
        title: 'Lab Results - Q1',
        file_path: 'demo/labs.pdf',
        file_type: 'pdf',
        size_bytes: 204800,
        category: 'Lab Result',
        uploaded_at: new Date().toISOString()
      }
    ]);
    console.log("✅ Seeded Documents");

    // --- Biological Age ---
    await supabase.from('biological_age_records').upsert([
      {
        id: uuid(`bio-age-1-${member.id}`),
        member_id: member.id,
        chronological_age: 42.0,
        biological_age: 38.5,
        blood_age: 39.0,
        dna_age: 38.0,
        recorded_at: pastDate.toISOString()
      },
      {
        id: uuid(`bio-age-2-${member.id}`),
        member_id: member.id,
        chronological_age: 42.1,
        biological_age: 37.0, // Improved!
        blood_age: 37.5,
        dna_age: 36.5,
        recorded_at: new Date().toISOString()
      }
    ]);
    console.log("✅ Seeded Biological Age History");

    // --- Notifications ---
    await supabase.from('notifications').upsert([
      {
        id: uuid(`notif-1-${member.id}`),
        user_id: member.id,
        title: 'New Lab Results',
        message: 'Your Q1 lab results have been processed.',
        type: 'lab_result',
        read: false,
        created_at: new Date().toISOString()
      }
    ]);
    console.log("✅ Seeded Notifications");

    // --- Audit Logs ---
    await supabase.from('audit_logs').upsert([
      {
        id: uuid(`audit-1-${member.id}`),
        actor_id: member.id,
        actor_role: 'Member',
        action: 'Login',
        target_user_id: member.id,
        timestamp: new Date().toISOString()
      }
    ]);
    console.log("✅ Seeded Audit Logs");

    // --- Consent ---
    await supabase.from('consent_records').upsert([
      {
        id: uuid(`consent-1-${member.id}`),
        user_id: member.id,
        policy_version: '1.0',
        consented_at: pastDate.toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'Demo Seeder'
      }
    ]);
    console.log("✅ Seeded Consent Records");

    console.log("🎉 Demo Seeding Complete!");

  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
}

seed();
