const fs = require('fs');
const { execSync } = require('child_process');

const pages = execSync('find app -name page.tsx').toString().split('\n').filter(Boolean);
const validRoutes = pages.map(p => {
  let route = p.replace(/^app/, '').replace(/\/\(public\)\//, '/').replace(/\/page\.tsx$/, '');
  if (route === '') route = '/';
  return route.replace(/\[.*?\]/g, '.*');
});

const grepOutput = execSync('grep -rn "href=" app/ components/ | grep -v node_modules || true').toString().split('\n').filter(Boolean);

const links = new Set();
grepOutput.forEach(line => {
  const match = line.match(/href=["']([^"'>]+)["']/);
  if (match) {
    let link = match[1].split('?')[0].split('#')[0];
    if (link.startsWith('/')) links.add(link);
  }
});

const brokenLinks = [];
links.forEach(link => {
  let isValid = false;
  for (const routeRegex of validRoutes) {
    const regex = new RegExp('^' + routeRegex + '$');
    if (regex.test(link)) {
      isValid = true;
      break;
    }
  }
  if (!isValid) brokenLinks.push(link);
});

console.log("Broken Links Found:", brokenLinks);
