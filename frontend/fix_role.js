const fs = require('fs');

let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/staff/dashboard/page.tsx', 'utf8');
content = content.replace(/Lead Coach/g, 'Health Coach');
fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/staff/dashboard/page.tsx', content);

console.log("Fixed role in staff dashboard");
