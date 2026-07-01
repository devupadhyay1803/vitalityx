const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/dashboard/page.tsx', 'utf8');

// Fix Longevity Score
content = content.replace(/latestBio\?\.longevity_score != null \? \`\$\{latestBio\.longevity_score\}\` : "—"/g, 'latestBio?.longevity_score != null && String(latestBio.longevity_score) !== "null" ? `${latestBio.longevity_score}` : "—"');
content = content.replace(/latestBio\.longevity_score != null \? latestBio\.longevity_score : "—"/g, 'latestBio.longevity_score != null && String(latestBio.longevity_score) !== "null" ? latestBio.longevity_score : "—"');

// Fix Metabolic Score
content = content.replace(/latestBio\.metabolic_score != null \? \`\$\{latestBio\.metabolic_score\}\/100\` : "—"/g, 'latestBio.metabolic_score != null && String(latestBio.metabolic_score) !== "null" ? `${latestBio.metabolic_score}/100` : "—"');

// Fix Inflammation Score
content = content.replace(/latestBio\.inflammation_score != null \? \`\$\{latestBio\.inflammation_score\}\/100\` : "—"/g, 'latestBio.inflammation_score != null && String(latestBio.inflammation_score) !== "null" ? `${latestBio.inflammation_score}/100` : "—"');

// Fix Confidence Score
content = content.replace(/latestBio\.confidence_score != null \? \`\$\{latestBio\.confidence_score\}%\` : "—"/g, 'latestBio.confidence_score != null && String(latestBio.confidence_score) !== "null" ? `${latestBio.confidence_score}%` : "—"');

fs.writeFileSync('/Users/devupadhyay/vitalityx/frontend/app/member/dashboard/page.tsx', content);

console.log("Updated null checks in dashboard");
