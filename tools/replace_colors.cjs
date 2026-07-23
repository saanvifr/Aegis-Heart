const fs = require('fs');
const path = require('path');

const replacements = {
  '#00F5FF': '#FF5A00',
  '#040712': '#000000',
  '#FF1744': '#FF3B30',
  '#8B5CF6': '#F2F2F2',
  '#00FF95': '#32D74B',
  '#030A16': '#000000',
  '#0C0214': '#000000',
  '#FFC107': '#FF9F0A'
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [oldColor, newColor] of Object.entries(replacements)) {
    const regex = new RegExp(oldColor, 'gi');
    content = content.replace(regex, newColor);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nCompleted! Modified ${changedFiles} files.`);
