const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');
const crypto = require('crypto');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  console.error("Run this script using: node --env-file=.env.local test_new_user_messages.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function randStr() {
  return crypto.randomBytes(4).toString('hex');
}

const TEST_PASSWORD = "Test@123456";

(async () => {
  const suffix = randStr();
  const memberEmail = `test.member.${suffix}@vitalityx.ai`;
  const staffEmail = `test.staff.${suffix}@vitalityx.ai`;
  const memberName = `Test Member ${suffix}`;
  const staffName = `Test Coach ${suffix}`;

  console.log(`Creating test users...`);
  console.log(`- Member: ${memberEmail}`);
  console.log(`- Staff: ${staffEmail}`);

  // 1. Create Staff (Coach) User
  const { data: staffData, error: staffError } = await supabase.auth.admin.createUser({
    email: staffEmail,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: staffName, role: 'Coach' }
  });
  if (staffError) {
    console.error("Failed to create staff auth:", staffError);
    process.exit(1);
  }
  const staffUser = staffData.user;

  const { error: p1Error } = await supabase.from('profiles').upsert({
    id: staffUser.id,
    full_name: staffName,
    role: 'Coach',
    email: staffEmail
  });
  if (p1Error) {
    console.error("Failed to insert staff profile:", p1Error);
    process.exit(1);
  }

  // Also insert into staff_profiles to ensure joins work cleanly
  const { error: spError } = await supabase.from('staff_profiles').upsert({
    id: staffUser.id,
    specialization: 'E2E Testing Specialized Coach',
    accepts_messages: true,
    booking_enabled: true
  });
  if (spError) {
    console.error("Failed to insert staff details:", spError);
    process.exit(1);
  }

  // Insert consent for staff to avoid terms flow blocker
  const { error: consentStaffError } = await supabase.from('consent_records').upsert({
    id: crypto.randomUUID(),
    user_id: staffUser.id,
    consent_version: '1.0',
    consent_text: 'I agree to the terms...',
    ip_address: '127.0.0.1',
    user_agent: 'E2E Test Script',
    accepted_at: new Date().toISOString()
  });
  if (consentStaffError) {
    console.error("Failed to insert staff consent:", consentStaffError);
    process.exit(1);
  }

  // 2. Create Member User
  const { data: memberData, error: memberError } = await supabase.auth.admin.createUser({
    email: memberEmail,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: memberName, role: 'Member' }
  });
  if (memberError) {
    console.error("Failed to create member auth:", memberError);
    process.exit(1);
  }
  const memberUser = memberData.user;

  const { error: p2Error } = await supabase.from('profiles').upsert({
    id: memberUser.id,
    full_name: memberName,
    role: 'Member',
    email: memberEmail,
    health_goal: 'Test Longevity'
  });
  if (p2Error) {
    console.error("Failed to insert member profile:", p2Error);
    process.exit(1);
  }

  // Insert consent and client records for member to avoid terms flow blocker
  const { error: consentMemberError } = await supabase.from('consent_records').upsert({
    id: crypto.randomUUID(),
    user_id: memberUser.id,
    consent_version: '1.0',
    consent_text: 'I agree to the terms...',
    ip_address: '127.0.0.1',
    user_agent: 'E2E Test Script',
    accepted_at: new Date().toISOString()
  });
  if (consentMemberError) {
    console.error("Failed to insert member consent:", consentMemberError);
    process.exit(1);
  }

  const { error: clientRecordError } = await supabase.from('client_records').upsert({
    member_id: memberUser.id,
    assigned_coach_id: staffUser.id,
    consented: true,
    consented_at: new Date().toISOString(),
    consent_version: '1.0',
    intake: { goals: "Test Longevity", conditions: [] }
  });
  if (clientRecordError) {
    console.error("Failed to insert member client record:", clientRecordError);
    process.exit(1);
  }

  // 3. Assign Staff Coach to Member Care Team
  const assignmentId = crypto.randomUUID();
  const { error: assignmentError } = await supabase.from('care_team_assignments').insert({
    id: assignmentId,
    member_id: memberUser.id,
    staff_id: staffUser.id,
    role: 'Health Coach',
    is_primary: true
  });
  if (assignmentError) {
    console.error("Failed to assign care team:", assignmentError);
    process.exit(1);
  }

  console.log("✅ Database test users and assignments successfully created!");

  // Start Playwright E2E verification
  console.log(`Launching Playwright...`);
  const browser = await chromium.launch({ headless: true });
  
  let currentContext = null;
  let page = null;

  async function initFreshPage() {
    if (currentContext) {
      await currentContext.close();
    }
    currentContext = await browser.newContext();
    page = await currentContext.newPage();
    
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.log(`Browser Page Error: ${err.message}`);
    });

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
        console.log(`>> Request: ${request.method()} ${url}`);
      }
    });

    page.on('requestfailed', request => {
      const url = request.url();
      if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
        console.log(`❌ Request Failed: ${url} - ${request.failure()?.errorText}`);
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
        console.log(`<< Response: ${response.status()} ${url}`);
      }
    });
    return page;
  }

  try {
    // === STEP 1: Log in as new Member and check first-conversation UI ===
    page = await initFreshPage();
    console.log(`[Step 1] Logging in as fresh Member: ${memberEmail}`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', memberEmail);
    await page.fill('[data-testid="login-password"]', TEST_PASSWORD);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(`${BASE_URL}/member/dashboard`, { timeout: 15000 });
    console.log("- Member logged in successfully!");

    // Navigate to Messages page
    console.log("- Navigating to Member Messages...");
    await page.click('[data-testid="sidebar-messages"]');
    await page.waitForURL(`${BASE_URL}/member/messages`, { timeout: 15000 });

    // Verify contact cards exist and conversation list says "No conversations yet"
    console.log("- Checking for Care Team contact cards grid...");
    const sidebarText = await page.locator('.w-80').innerText();
    if (!sidebarText.includes("No conversations yet.")) {
      throw new Error("Sidebar did not display 'No conversations yet.' for a fresh member!");
    }

    const cardLocator = page.locator(`[data-testid="contact-card-${staffUser.id}"]`);
    await cardLocator.waitFor({ state: 'visible', timeout: 5000 });
    const cardText = await cardLocator.innerText();
    console.log(`- Found Contact Card text:\n${cardText}`);
    if (!cardText.toLowerCase().includes(staffName.toLowerCase()) || !cardText.toLowerCase().includes("health coach")) {
      throw new Error("Contact card does not display the coach name or correct care team role!");
    }

    // Click "Start Conversation" on the card
    console.log("- Clicking 'Start Conversation'...");
    await page.click(`[data-testid="start-chat-${staffUser.id}"]`);

    // Verify the empty chat thread opens
    console.log("- Verifying empty chat thread panel...");
    await page.waitForSelector('[data-testid="message-input"]');
    const chatPanelText = await page.locator('[data-testid="messages-list"]').innerText();
    if (!chatPanelText.includes("No messages yet. Say hi 👋")) {
      throw new Error("Empty chat thread did not show fallback welcome text!");
    }

    // Send first message
    const uniqueMessage = `Hello Coach! This is E2E test message ${suffix}`;
    console.log(`- Sending first message: "${uniqueMessage}"`);
    await page.fill('[data-testid="message-input"]', uniqueMessage);
    await page.click('[data-testid="message-send"]');

    // Verify message appears in chat
    const firstMsgBubble = page.locator('.max-w-\\[75\\%\\]', { hasText: uniqueMessage });
    await firstMsgBubble.waitFor({ state: 'visible', timeout: 5000 });
    console.log("- Message successfully rendered in chat list!");

    // Log out member
    console.log("- Logging out Member...");
    await page.click('[data-testid="sidebar-signout"]');
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 15000 });


    // === STEP 2: Log in as Staff Coach and verify message delivery & realtime update ===
    page = await initFreshPage();
    console.log(`[Step 2] Logging in as fresh Staff Coach: ${staffEmail}`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', staffEmail);
    await page.fill('[data-testid="login-password"]', TEST_PASSWORD);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(`${BASE_URL}/staff/dashboard`, { timeout: 15000 });
    console.log("- Staff Coach logged in successfully!");

    // Navigate to Staff Messages page
    console.log("- Navigating to Staff Messages...");
    await page.click('[data-testid="sidebar-staff-messages"]');
    await page.waitForURL(`${BASE_URL}/staff/messages`, { timeout: 15000 });

    // Verify conversation list shows active thread with the fresh Member
    console.log("- Checking for active thread with Member in sidebar...");
    const activeThreadLoc = page.locator('.w-80', { hasText: memberName });
    await activeThreadLoc.waitFor({ state: 'visible', timeout: 10000 });
    console.log("- Active thread with member is visible in sidebar!");

    // Click on the conversation to select it
    await page.click(`button:has-text("${memberName}")`);

    // Verify the member's message is displayed in the chat window
    console.log("- Verifying message content matches...");
    await page.waitForSelector('[data-testid="messages-list"]');
    const staffChatText = await page.locator('[data-testid="messages-list"]').innerText();
    if (!staffChatText.includes(uniqueMessage)) {
      throw new Error("Fresh member message was not delivered to the staff interface!");
    }

    // Reply to the message
    const replyMessage = `Welcome to VitalityX! Realtime reply test ${suffix}`;
    console.log(`- Sending coach reply: "${replyMessage}"`);
    await page.fill('[data-testid="message-input"]', replyMessage);
    await page.click('[data-testid="message-send"]');

    // Verify reply appears in chat list
    const replyBubble = page.locator('.max-w-\\[75\\%\\]', { hasText: replyMessage });
    await replyBubble.waitFor({ state: 'visible', timeout: 5000 });
    console.log("- Coach reply successfully rendered!");

    // Log out staff
    console.log("- Logging out Staff Coach...");
    await page.click('[data-testid="sidebar-signout"]');
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 15000 });


    // === STEP 3: Reopen member account to verify conversation persistence & reopening ===
    page = await initFreshPage();
    console.log(`[Step 3] Re-logging in as Member: ${memberEmail} to verify persistence`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', memberEmail);
    await page.fill('[data-testid="login-password"]', TEST_PASSWORD);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL(`${BASE_URL}/member/dashboard`, { timeout: 15000 });

    console.log("- Navigating to Member Messages...");
    await page.click('[data-testid="sidebar-messages"]');
    await page.waitForURL(`${BASE_URL}/member/messages`, { timeout: 15000 });

    // Since a conversation now exists, the contact card grid should NOT be shown on load
    console.log("- Checking that contact cards grid is hidden on load and active thread is selected...");
    const memberActiveThreadLoc = page.locator('.w-80', { hasText: staffName });
    await memberActiveThreadLoc.waitFor({ state: 'visible', timeout: 10000 });
    console.log("- Active thread with staff is visible in sidebar!");

    // Wait for the message list to show the coach's reply
    await page.waitForSelector('[data-testid="messages-list"]');
    const memberChatText = await page.locator('[data-testid="messages-list"]').innerText();
    if (!memberChatText.includes(replyMessage)) {
      throw new Error("Coach's reply did not persist or load on reopening the member thread!");
    }
    console.log("- Verification of conversation reopening, message delivery, and thread persistence is successful!");

    // Log out member
    console.log("- Logging out Member...");
    await page.click('[data-testid="sidebar-signout"]');
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 15000 });

    console.log("🎉 ALL E2E CHAT TESTS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ E2E Verification failed:", err);
    try {
      if (page) {
        const html = await page.content();
        console.log("Page HTML content at failure:", html.slice(0, 2000));
        await page.screenshot({ path: 'failure_screenshot.png' });
        console.log("Saved failure screenshot to failure_screenshot.png");
      }
    } catch (diagErr) {
      console.error("Failed to dump diagnostics:", diagErr);
    }
    process.exit(1);
  } finally {
    // Cleanup database test entries
    console.log("Cleaning up database test entries...");
    try {
      await supabase.from('care_team_assignments').delete().eq('id', assignmentId);
      await supabase.from('messages').delete().eq('sender_id', memberUser.id).eq('receiver_id', staffUser.id);
      await supabase.from('messages').delete().eq('sender_id', staffUser.id).eq('receiver_id', memberUser.id);
      await supabase.from('client_records').delete().eq('member_id', memberUser.id);
      await supabase.from('consent_records').delete().eq('user_id', memberUser.id);
      await supabase.from('consent_records').delete().eq('user_id', staffUser.id);
      await supabase.from('staff_profiles').delete().eq('id', staffUser.id);
      await supabase.from('profiles').delete().eq('id', memberUser.id);
      await supabase.from('profiles').delete().eq('id', staffUser.id);
      if (memberUser) await supabase.auth.admin.deleteUser(memberUser.id);
      if (staffUser) await supabase.auth.admin.deleteUser(staffUser.id);
      console.log("✅ Cleanup done!");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
    await browser.close();
  }
})();
