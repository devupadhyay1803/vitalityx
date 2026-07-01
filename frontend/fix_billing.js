const fs = require('fs');

let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/billing/page.tsx', 'utf8');

content = content.replace(/<p className="mt-2 text-lg">\$450 \/ month<\/p>/g, '{sub.price_cents ? <p className="mt-2 text-lg">${(sub.price_cents / 100).toFixed(2)} / month</p> : null}');

fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/billing/page.tsx', content);

console.log("Updated billing page");
