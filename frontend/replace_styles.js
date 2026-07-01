const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let orig = content;
      
      // Cards
      // match `bg-card border border-border` and replace with `vx-card`
      content = content.replace(/bg-card border border-border/g, 'vx-card');
      content = content.replace(/border border-border bg-card/g, 'vx-card');
      
      // Clean up redundant rounding if vx-card is present
      content = content.replace(/vx-card[^"}]*(rounded-(lg|xl|2xl|3xl))/g, (match, p1) => {
        return match.replace(p1, '');
      });
      content = content.replace(/(rounded-(lg|xl|2xl|3xl))([^"}]*vx-card)/g, (match, p1, p2, p3) => {
        return match.replace(p1, '');
      });
      // Clean up extra spaces
      content = content.replace(/ +/g, ' ');
      
      // Buttons
      // If there's `btn ` with `text-destructive`, make it `btn-danger` maybe?
      
      if (content !== orig) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
