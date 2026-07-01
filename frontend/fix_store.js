const fs = require('fs');
let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/(public)/supplements/page.tsx', 'utf8');

content = content.replace(/className="mt-4 text-lg text-muted-foreground"/g, 'className="mt-4 text-lg text-muted-foreground break-words whitespace-normal text-wrap"');

fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/(public)/supplements/page.tsx', content);

console.log("Updated store hero subtitle");
