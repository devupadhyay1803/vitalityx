const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/data/page.tsx', 'utf8');

content = content.replace(/latest\.biological_age != null \? \`\$\{latest\.biological_age\} yrs\` : "—"/g, 'latest.biological_age != null && String(latest.biological_age) !== "null" ? `${latest.biological_age} yrs` : "—"');

fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/data/page.tsx', content);

console.log("Updated null checks in data page");
