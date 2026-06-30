const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://frontend-six-mauve-37.vercel.app';

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
      results.errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    results.errors.push(error.message);
  });

  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(BASE_URL)) {
      results.networkFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  async function checkPage(url, name) {
    console.log(`Testing ${name} (${url})...`);
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (response.status() >= 400) {
      results.networkFailures.push(`${response.status()} ${url}`);
    } else {
      results.successes.push(name);
    }
  }

  // Check public pages
  await checkPage(`${BASE_URL}/`, 'Home');
  await checkPage(`${BASE_URL}/supplements`, 'Store');
  await checkPage(`${BASE_URL}/supplements/omega-3-concentrate`, 'Product Detail');

  // Login as Staff
  console.log("Logging in as Staff...");
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', 'dr.vance@vitalityx.com');
  await page.fill('input[name="password"]', 'CoachDemo2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  await checkPage(`${BASE_URL}/staff/dashboard`, 'Staff Dashboard');
  await checkPage(`${BASE_URL}/staff/clients`, 'Staff Clients');
  await checkPage(`${BASE_URL}/staff/care-team`, 'Staff Care Team');
  await checkPage(`${BASE_URL}/staff/messages`, 'Staff Messages');
  await checkPage(`${BASE_URL}/staff/notifications`, 'Staff Notifications');

  console.log("Audit complete.");
  console.log("Successes:", results.successes.length);
  console.log("Errors:", results.errors.length);
  console.log("Network Failures:", results.networkFailures.length);
  
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));

  await browser.close();
})();
