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
      
      // Buttons
      // If there's `btn ` with `text-destructive`, make it `btn-danger`
      content = content.replace(/btn-[a-z]+ text-destructive hover:bg-destructive\/10/g, 'btn-danger');
      content = content.replace(/btn-ghost text-destructive hover:bg-destructive\/10/g, 'btn-danger');
      
      // Clean up inconsistent paddings on btn
      content = content.replace(/(className="[^"]*btn[^"]*)( px-[0-9]+| py-[0-9.]+)/g, (match, p1, p2) => p1);
      
      if (content !== orig) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
