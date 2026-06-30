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
  auth: { autoRefreshToken: false, persistSession: false }
});

function uuid(str) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const DEMO_PASSWORD = "Demo@12345";
const MEMBER = { email: "demo.member@vitalityx.ai", full_name: "Sarah Johnson", role: "Member" };
const STAFF_COACH = { email: "demo.staff@vitalityx.ai", full_name: "Admin Demo", role: "Coach" };
const STAFF_PHYS = { email: "demo.physician@vitalityx.ai", full_name: "Dr. Elena Vance", role: "Coach" };
const STAFF_NUTRI = { email: "demo.nutritionist@vitalityx.ai", full_name: "Marcus Chen", role: "Coach" };

async function ensureUser(userDef) {
  let { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  
  let user = users.find(u => u.email === userDef.email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userDef.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: userDef.full_name, role: userDef.role }
    });
    if (error) throw error;
    user = data.user;
    console.log(`✅ Created auth user: ${userDef.email}`);
  } else {
    await supabase.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD });
    console.log(`✅ Auth user exists (password synced): ${userDef.email}`);
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: userDef.full_name,
    role: userDef.role,
    email: userDef.email,
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  });
  if (profileError) throw profileError;

  return user;
}

async function seed() {
  console.log("🌱 Starting Comprehensive Demo Seeder...");
  try {
    const member = await ensureUser(MEMBER);
    const coach = await ensureUser(STAFF_COACH);
    const physician = await ensureUser(STAFF_PHYS);
    const nutritionist = await ensureUser(STAFF_NUTRI);

    console.log(`👤 Member ID: ${member.id}`);
    console.log(`👨‍⚕️ Coach ID: ${coach.id}`);

    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000);

    console.log("🧹 Cleaning up old demo data for Member to prevent duplicate key violations...");
    await supabase.from('care_team_assignments').delete().eq('member_id', member.id);
    await supabase.from('client_records').delete().eq('member_id', member.id);
    await supabase.from('consent_records').delete().eq('user_id', member.id);
    await supabase.from('daily_checkins').delete().eq('member_id', member.id);
    await supabase.from('biological_age_records').delete().eq('member_id', member.id);
    await supabase.from('biomarkers').delete().eq('member_id', member.id);
    await supabase.from('genetic_traits').delete().eq('member_id', member.id);
    await supabase.from('documents').delete().eq('member_id', member.id);
    await supabase.from('appointments').delete().eq('member_id', member.id);
    await supabase.from('supplement_subscriptions').delete().eq('member_id', member.id);
    await supabase.from('orders').delete().eq('member_id', member.id);
    await supabase.from('notifications').delete().eq('user_id', member.id);
    await supabase.from('protocol_items').delete().eq('member_id', member.id);
    await supabase.from('protocol_completions').delete().eq('member_id', member.id);
    await supabase.from('messages').delete().or(`sender_id.eq.${member.id},receiver_id.eq.${member.id}`);
    await supabase.from('audit_logs').delete().or(`actor_id.eq.${member.id},target_user_id.eq.${member.id}`);

    // --- Care Team & Client Records ---
    const { error: ctError } = await supabase.from('care_team_assignments').upsert([
      { id: uuid(`ct-coach-${member.id}`), member_id: member.id, staff_id: coach.id, role: 'Health Coach', is_primary: true, created_at: daysAgo(90).toISOString() },
      { id: uuid(`ct-phys-${member.id}`), member_id: member.id, staff_id: physician.id, role: 'Physician', is_primary: false, created_at: daysAgo(90).toISOString() },
      { id: uuid(`ct-nutr-${member.id}`), member_id: member.id, staff_id: nutritionist.id, role: 'Nutritionist', is_primary: false, created_at: daysAgo(85).toISOString() }
    ]);
    if (ctError) throw ctError;
    
    await supabase.from('client_records').upsert({
      member_id: member.id,
      assigned_coach_id: coach.id,
      consented: true,
      consented_at: daysAgo(90).toISOString(),
      consent_version: '1.0',
      intake: { goals: "Longevity and peak performance", conditions: ["None"] }
    }, { onConflict: 'member_id' });
    
    console.log("✅ Seeded Care Team & Client Records");

    // --- Consent Records ---
    await supabase.from('consent_records').upsert([{
      id: uuid(`consent-${member.id}`),
      user_id: member.id,
      consent_version: '1.0',
      consent_text: 'I agree to the terms...',
      ip_address: '192.168.1.1',
      user_agent: 'Seeder',
      accepted_at: daysAgo(90).toISOString()
    }]);

    // --- Check-ins (8 entries) ---
    const checkins = Array.from({length: 8}).map((_, i) => ({
      id: uuid(`checkin-${i}-${member.id}`),
      member_id: member.id,
      sleep_score: 6 + Math.floor(Math.random() * 4),
      energy_score: 6 + Math.floor(Math.random() * 4),
      mood_score: 6 + Math.floor(Math.random() * 4),
      checked_in_at: daysAgo(i + 1).toISOString()
    }));
    const { error: ciError } = await supabase.from('daily_checkins').upsert(checkins);
    if (ciError) throw ciError;
    console.log("✅ Seeded 8 Check-ins");

    // --- Biological Age (5 entries) ---
    const bioAges = [
      { d: 150, bio: 42.8, chron: 42.0 },
      { d: 120, bio: 42.1, chron: 42.1 },
      { d: 90, bio: 41.6, chron: 42.2 },
      { d: 60, bio: 40.8, chron: 42.3 },
      { d: 30, bio: 39.9, chron: 42.4 }
    ].map((b, i) => ({
      id: uuid(`bioage-${i}-${member.id}`),
      member_id: member.id,
      chronological_age: b.chron,
      biological_age: b.bio,
      calculation_version: '1.0',
      calculated_at: daysAgo(b.d).toISOString(),
      created_at: daysAgo(b.d).toISOString()
    }));
    const { error: baError } = await supabase.from('biological_age_records').upsert(bioAges);
    if (baError) throw baError;
    console.log("✅ Seeded 5 Biological Age Entries");

    // --- Biomarkers & Genetics ---
    const biomarkers = [
      { id: uuid(`bio-1-${member.id}`), name: "ApoB", value: 85, unit: "mg/dL", min: 50, max: 90, stat: "optimal", d: 85 },
      { id: uuid(`bio-2-${member.id}`), name: "hs-CRP", value: 1.2, unit: "mg/L", min: 0, max: 1.0, stat: "borderline", d: 85 },
      { id: uuid(`bio-3-${member.id}`), name: "Vitamin D3", value: 38, unit: "ng/mL", min: 50, max: 80, stat: "borderline", d: 75 },
      { id: uuid(`bio-4-${member.id}`), name: "HbA1c", value: 5.1, unit: "%", min: 4.0, max: 5.6, stat: "optimal", d: 85 }
    ].map(b => ({
      id: b.id, member_id: member.id, name: b.name, value: b.value, unit: b.unit, target_min: b.min, target_max: b.max, status: b.stat, tested_at: daysAgo(b.d).toISOString()
    }));
    await supabase.from('biomarkers').upsert(biomarkers);
    
    const genetics = [
      { id: uuid(`gen-1-${member.id}`), trait_name: "MTHFR Mutation", variant: "C677T Heterozygous", plain_language_summary: "Slightly reduced folate metabolism efficiency. Methylated B-vitamins recommended.", impact: "neutral" },
      { id: uuid(`gen-2-${member.id}`), trait_name: "APOE Status", variant: "e3/e3", plain_language_summary: "Average Alzheimer's risk. Standard cardiovascular guidelines apply.", impact: "positive" },
      { id: uuid(`gen-3-${member.id}`), trait_name: "Caffeine Metabolism (CYP1A2)", variant: "Slow Metabolizer", plain_language_summary: "Caffeine clears slowly from your system. Avoid caffeine after 12 PM to protect deep sleep.", impact: "risk" }
    ].map(g => ({ ...g, member_id: member.id }));
    await supabase.from('genetic_traits').upsert(genetics);
    console.log("✅ Seeded Biomarkers & Genetic Traits");

    // --- Documents (6 entries) ---
    const docs = [
      { t: 'Blood Panel - Comprehensive', cat: 'Lab Report', d: 85, u: physician.id },
      { t: 'CBC and Metabolic Panel', cat: 'Lab Report', d: 80, u: physician.id },
      { t: 'Vitamin D Screen', cat: 'Lab Report', d: 75, u: physician.id },
      { t: 'Genetic Analysis Report', cat: 'Genetics Report', d: 90, u: member.id },
      { t: 'Dexa Scan Body Comp', cat: 'Other', d: 40, u: member.id },
      { t: 'Longevity Treatment Plan', cat: 'Protocol', d: 20, u: coach.id }
    ].map((d, i) => ({
      id: uuid(`doc-${i}-${member.id}`),
      member_id: member.id,
      title: d.t,
      file_name: d.t.toLowerCase().replace(/ /g, '_') + '.pdf',
      storage_path: `${member.id}/demo_doc_${i}.pdf`,
      mime_type: 'application/pdf',
      file_size: 102400 + Math.floor(Math.random() * 900000),
      category: d.cat,
      uploaded_by: d.u,
      created_at: daysAgo(d.d).toISOString(),
      updated_at: daysAgo(d.d).toISOString()
    }));
    const { error: docError } = await supabase.from('documents').upsert(docs);
    if (docError) throw docError;
    console.log("✅ Seeded 6 Documents");

    // --- Appointments (6 entries) ---
    const appts = [
      { id: '1', t: 'Kickoff', type: 'Onboarding', stat: 'Completed', d: 90, staff: coach.id },
      { id: '2', t: 'Month 1 Review', type: 'Check-in', stat: 'Completed', d: 60, staff: coach.id },
      { id: '3', t: 'Q1 Labs Review', type: 'Lab Review', stat: 'Completed', d: 30, staff: physician.id },
      { id: '4', t: 'Follow-up', type: 'Check-in', stat: 'Cancelled', d: 15, staff: coach.id },
      { id: '5', t: 'Month 3 Review', type: 'Check-in', stat: 'Rescheduled', d: -5, staff: coach.id },
      { id: '6', t: 'Dietary Plan', type: 'Nutrition', stat: 'Scheduled', d: -7, staff: nutritionist.id }
    ].map(a => ({
      id: uuid(`appt-${a.id}-${member.id}`),
      member_id: member.id,
      staff_id: a.staff,
      title: a.t,
      session_type: a.type,
      scheduled_start: daysAgo(a.d).toISOString(),
      scheduled_end: new Date(daysAgo(a.d).getTime() + 45 * 60000).toISOString(),
      status: a.stat,
      meeting_link: `https://meet.google.com/demo-${a.id}`
    }));
    await supabase.from('appointments').upsert(appts);
    console.log("✅ Seeded 6 Appointments");

    // --- Billing: Subscriptions & Orders ---
    await supabase.from('supplement_subscriptions').upsert([
      { id: uuid(`sub-1-${member.id}`), member_id: member.id, stripe_subscription_id: 'sub_demo1', product_name: 'Complete Longevity Tier', status: 'active', created_at: daysAgo(90).toISOString() },
      { id: uuid(`sub-2-${member.id}`), member_id: member.id, stripe_subscription_id: 'sub_demo2', product_name: 'Omega-3 Concentrate', status: 'active', created_at: daysAgo(60).toISOString() }
    ]);
    
    const orders = [
      { id: uuid(`ord-1-${member.id}`), amt: 45000, days: 90 },
      { id: uuid(`ord-2-${member.id}`), amt: 45000, days: 60 },
      { id: uuid(`ord-3-${member.id}`), amt: 45000, days: 30 },
      { id: uuid(`ord-4-${member.id}`), amt: 45000, days: 5 }
    ].map((o, i) => ({
      id: o.id,
      member_id: member.id,
      stripe_session_id: `cs_test_demo_${i}`,
      amount_total: o.amt,
      currency: 'usd',
      status: 'complete',
      created_at: daysAgo(o.days).toISOString(),
      items: [{ name: 'Longevity Tier' }]
    }));
    await supabase.from('orders').upsert(orders);
    console.log("✅ Seeded 2 Subscriptions & 4 Orders");

    // --- Notifications (12 entries) ---
    const notifs = [
      { t: 'Lab report uploaded', d: 85, type: 'document' },
      { t: 'Appointment confirmed', d: 88, type: 'appointment' },
      { t: 'New Coach Message', d: 80, type: 'message' },
      { t: 'Supplement shipped', d: 75, type: 'success' },
      { t: 'Protocol updated', d: 70, type: 'protocol' },
      { t: 'Invoice available', d: 60, type: 'billing' },
      { t: 'Biological age improved', d: 30, type: 'success' },
      { t: 'Document shared', d: 40, type: 'document' },
      { t: 'New Physician Message', d: 20, type: 'message' },
      { t: 'Appointment rescheduled', d: 15, type: 'appointment' },
      { t: 'Check-in reminder', d: 2, type: 'reminder' },
      { t: 'New Lab Results', d: 1, type: 'lab' }
    ].map((n, i) => ({
      id: uuid(`notif-${i}-${member.id}`),
      user_id: member.id,
      title: n.t,
      message: `You have a new ${n.type} update.`,
      type: n.type,
      category: 'system',
      is_read: i > 2,
      created_at: daysAgo(n.d).toISOString()
    }));
    await supabase.from('notifications').upsert(notifs);
    console.log("✅ Seeded 12 Notifications");

    // --- Protocol ---
    const protoItems = [
      { id: uuid(`pi-1-${member.id}`), t: "Morning Sunlight", d: 90 },
      { id: uuid(`pi-2-${member.id}`), t: "Zone 2 Cardio (45m)", d: 90 },
      { id: uuid(`pi-3-${member.id}`), t: "NAD+ Precursor", d: 80 }
    ].map(p => ({
      id: p.id,
      member_id: member.id,
      title: p.t,
      why_text: "Essential for circadian rhythm and cellular energy.",
      created_by: coach.id,
      active: true,
      created_at: daysAgo(p.d).toISOString()
    }));
    await supabase.from('protocol_items').upsert(protoItems);
    
    // Completions for today and yesterday
    const completions = [];
    protoItems.forEach(p => {
      completions.push({ id: uuid(`pc-tdy-${p.id}`), member_id: member.id, item_id: p.id, completed_at: now.toISOString() });
      completions.push({ id: uuid(`pc-yst-${p.id}`), member_id: member.id, item_id: p.id, completed_at: daysAgo(1).toISOString() });
    });
    await supabase.from('protocol_completions').upsert(completions);
    console.log("✅ Seeded Protocol Progress");

    // --- Messages (30-50 messages) ---
    const msgData = [
      { day: 90, s: member.id, r: coach.id, t: "Hi, I just finished onboarding. Looking forward to getting started!" },
      { day: 90, s: coach.id, r: member.id, t: "Welcome Sarah! Great to have you. I've sent you the intake forms." },
      { day: 88, s: member.id, r: coach.id, t: "Intake forms completed. What's next?" },
      { day: 88, s: coach.id, r: member.id, t: "Thanks. Our physician, Dr. Vance, will review them and order labs." },
      { day: 87, s: physician.id, r: member.id, t: "Hello Sarah, I've ordered a comprehensive blood panel and Dexa scan for you. You should receive the kits soon." },
      { day: 86, s: member.id, r: physician.id, t: "Thank you Dr. Vance, I will look out for them." },
      { day: 80, s: member.id, r: coach.id, t: "I've mailed my lab kits back yesterday." },
      { day: 80, s: coach.id, r: member.id, t: "Perfect! They usually take about 5 days to process. We'll notify you when results are in." },
      { day: 75, s: physician.id, r: member.id, t: "Sarah, your labs are back. Overall great, but your Vitamin D is slightly low. I've added a supplement to your protocol." },
      { day: 75, s: member.id, r: physician.id, t: "Got it. Will start the Vitamin D tomorrow." },
      { day: 70, s: nutritionist.id, r: member.id, t: "Hi Sarah, I'm Marcus, your nutritionist. Based on your labs, I suggest increasing protein intake to 120g/day." },
      { day: 69, s: member.id, r: nutritionist.id, t: "Hi Marcus, what protein sources do you recommend?" },
      { day: 69, s: nutritionist.id, r: member.id, t: "Lean chicken, wild-caught salmon, and a high-quality whey isolate post-workout." },
      { day: 60, s: coach.id, r: member.id, t: "Just checking in, how is the new diet and supplement protocol feeling?" },
      { day: 59, s: member.id, r: coach.id, t: "Feeling a bit more energetic actually! Sleep has improved too." },
      { day: 50, s: coach.id, r: member.id, t: "That's fantastic. Keep up the morning sunlight exposure, it helps with sleep." },
      { day: 40, s: physician.id, r: member.id, t: "Sarah, I've reviewed your Dexa scan. Body fat is at a healthy 22%. Lean mass looks great." },
      { day: 39, s: member.id, r: physician.id, t: "That's reassuring to hear!" },
      { day: 30, s: coach.id, r: member.id, t: "Time for your Q1 biological age reassessment. Your kit is on the way." },
      { day: 20, s: physician.id, r: member.id, t: "Excellent news! Your biological age dropped to 39.9. The protocol is working." },
      { day: 19, s: member.id, r: physician.id, t: "Wow! I'm thrilled. Thank you both so much." },
      { day: 15, s: coach.id, r: member.id, t: "Let's schedule a follow-up to tweak the protocol for Q2." },
      { day: 15, s: member.id, r: coach.id, t: "Can we do next Thursday?" },
      { day: 14, s: coach.id, r: member.id, t: "Thursday works. I'll send an invite." },
      { day: 10, s: nutritionist.id, r: member.id, t: "Sarah, make sure you're staying hydrated with the new workout intensity." },
      { day: 9, s: member.id, r: nutritionist.id, t: "I'm aiming for 3 liters a day." },
      { day: 5, s: coach.id, r: member.id, t: "Don't forget to log your daily check-ins this week!" },
      { day: 4, s: member.id, r: coach.id, t: "Just logged them. Everything is going well." },
      { day: 2, s: coach.id, r: member.id, t: "Awesome, keep it up." },
      { day: 1, s: coach.id, r: member.id, t: "Your next supplement box just shipped." },
      { day: 0.1, s: member.id, r: coach.id, t: "Thanks! Will keep an eye out." },
      { day: 0, s: coach.id, r: member.id, t: "Have a great weekend!" } // Unread by member
    ];

    const messages = msgData.map((m, i) => ({
      id: uuid(`msg-${i}-${member.id}`),
      sender_id: m.s,
      receiver_id: m.r,
      content: m.t,
      created_at: hoursAgo(m.day * 24).toISOString() // using hours to ensure sequence
    }));
    await supabase.from('messages').upsert(messages);
    console.log(`✅ Seeded ${messages.length} Messages`);

    // --- Audit Logs (8-10 entries) ---
    const logs = [
      { a: 'Login', r: 'Member', u: member.id },
      { a: 'Consent signed', r: 'Member', u: member.id },
      { a: 'Document viewed', r: 'Member', u: member.id },
      { a: 'Document uploaded', r: 'Coach', u: coach.id },
      { a: 'Appointment booked', r: 'Member', u: member.id },
      { a: 'Appointment rescheduled', r: 'Coach', u: coach.id },
      { a: 'Profile updated', r: 'Member', u: member.id },
      { a: 'Notification sent', r: 'System', u: coach.id },
      { a: 'Login', r: 'Coach', u: coach.id }
    ].map((l, i) => ({
      id: uuid(`audit-log-${i}-${member.id}`),
      actor_id: l.u,
      actor_role: l.r,
      action: l.a,
      target_user_id: member.id,
      created_at: daysAgo(Math.floor(Math.random() * 30)).toISOString()
    }));
    const { error: alError } = await supabase.from('audit_logs').upsert(logs);
    if (alError) throw alError;
    console.log("✅ Seeded Audit Logs");

    console.log("🎉 Demo Seeding Complete!");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
}

seed();
