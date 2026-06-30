const { chromium } = require('playwright');
const fs = require('fs');

// Allow overriding base URL for local or staging environments (defaults to production Vercel)
const BASE_URL = process.env.E2E_BASE_URL || 'https://frontend-six-mauve-37.vercel.app';

(async () => {
  console.log(`Starting E2E audit on ${BASE_URL}`);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    errors: [],
    networkFailures: [],
    successes: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out aborted fetch errors that happen naturally during page transitions/redirections
      if (!text.includes('Failed to fetch')) {
        results.errors.push(text);
      }
    }
  });

  page.on('pageerror', error => {
    if (!error.message.includes('Failed to fetch')) {
      results.errors.push(error.message);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(BASE_URL)) {
      results.networkFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  async function checkPage(url, name) {
    console.log(`Testing ${name} (${url})...`);
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (response && response.status() >= 400) {
      results.networkFailures.push(`${response.status()} ${url}`);
    } else {
      results.successes.push(name);
    }
  }

  try {
    // Check public pages
    await checkPage(`${BASE_URL}/`, 'Home');
    await checkPage(`${BASE_URL}/supplements`, 'Store');
    await checkPage(`${BASE_URL}/supplements/omega-3-concentrate`, 'Product Detail');

    // Login as Staff (Uses seeded credentials or staging equivalent)
    console.log("Logging in as Staff...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-email"]');
    
    const isLocal = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');
    const staffEmail = isLocal ? 'demo.staff@vitalityx.ai' : 'dr.vance@vitalityx.com';
    const staffPwd = isLocal ? 'Demo@12345' : 'CoachDemo2026!';

    await page.fill('[data-testid="login-email"]', staffEmail);
    await page.fill('[data-testid="login-password"]', staffPwd);
    await page.click('[data-testid="login-submit"]');
    
    // Wait for staff dashboard
    console.log("Waiting for Staff Dashboard...");
    await page.waitForURL(`${BASE_URL}/staff/dashboard`, { timeout: 15000 });
    
    await checkPage(`${BASE_URL}/staff/dashboard`, 'Staff Dashboard');
    await checkPage(`${BASE_URL}/staff/clients`, 'Staff Clients');
    await checkPage(`${BASE_URL}/staff/care-team`, 'Staff Care Team');
    await checkPage(`${BASE_URL}/staff/messages`, 'Staff Messages');
    await checkPage(`${BASE_URL}/staff/notifications`, 'Staff Notifications');

    // Log out staff using the sidebar signout button
    console.log("Logging out Staff...");
    await page.click('[data-testid="sidebar-signout"]');
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 15000 });

    // Login as Member
    console.log("Logging in as Member...");
    const memberEmail = isLocal ? 'demo.member@vitalityx.ai' : 'demo.member@vitalityx.ai'; // same for both
    const memberPwd = isLocal ? 'Demo@12345' : 'Demo@12345'; // same for both

    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', memberEmail);
    await page.fill('[data-testid="login-password"]', memberPwd);
    await page.click('[data-testid="login-submit"]');

    // Wait for member dashboard
    console.log("Waiting for Member Dashboard...");
    await page.waitForURL(`${BASE_URL}/member/dashboard`, { timeout: 15000 });

    await checkPage(`${BASE_URL}/member/dashboard`, 'Member Dashboard');
    await checkPage(`${BASE_URL}/member/data`, 'Member Data');
    await checkPage(`${BASE_URL}/member/documents`, 'Member Documents');
    await checkPage(`${BASE_URL}/member/protocol`, 'Member Protocol');
    await checkPage(`${BASE_URL}/member/messages`, 'Member Messages');
    await checkPage(`${BASE_URL}/member/notifications`, 'Member Notifications');

    // Log out Member using the sidebar signout button
    console.log("Logging out Member...");
    await page.click('[data-testid="sidebar-signout"]');
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 15000 });

    console.log("Audit complete.");
    console.log("Successes:", results.successes.length, results.successes);
    console.log("Errors:", results.errors.length, results.errors);
    console.log("Network Failures:", results.networkFailures.length, results.networkFailures);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
    await browser.close();
  }
})();
