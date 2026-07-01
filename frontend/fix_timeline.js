const fs = require('fs');

let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/staff/clients/[id]/timeline/page.tsx', 'utf8');

content = content.replace(/admin\.from\("staff_access_logs"\)\.select\("\*"\)/g, 'admin.from("staff_access_logs").select("*, staff:profiles!staff_id(full_name)")');
content = content.replace(/description: \`Staff member \(\$\{String\(log\.staff_id\)\.substring\(0, 6\)\}[^`]+\`/g, 'description: `${log.staff?.full_name || "A staff member"} accessed ${log.resource_type ?? "record"}`');

fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/staff/clients/[id]/timeline/page.tsx', content);

console.log("Updated timeline logs");
