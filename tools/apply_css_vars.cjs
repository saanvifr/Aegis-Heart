const fs = require('fs');
const path = require('path');

const replacements = {
  // Hex to CSS Vars
  '#FF5A00': 'var(--accent-cyan)',
  '#FF3B30': 'var(--danger-rose)',
  '#F2F2F2': 'var(--purple-glow)',
  '#32D74B': 'var(--green-healthy)',
  '#FF9F0A': 'var(--warning-amber)',
  
  // Specific Utility Class Fixes for Light/Dark
  'bg-[#000000]': 'bg-[color:var(--bg-dark)]',
  'text-white': 'text-[color:var(--text-main)]',
  'text-gray-400': 'text-[color:var(--text-muted)]',
  'text-gray-300': 'text-[color:var(--text-muted)]',
  'text-gray-500': 'text-[color:var(--text-muted)]',
  
  // Backgrounds and Borders
  'bg-white/5': 'bg-[color:var(--glass-border)]',
  'bg-white/10': 'bg-[color:var(--glass-border)]',
  'border-white/10': 'border-[color:var(--glass-border)]',
  'border-white/5': 'border-[color:var(--glass-border)]',
  'bg-black/40': 'bg-[color:var(--glass-border)]',
  'bg-black/50': 'bg-[color:var(--glass-border)]',
  'bg-black/60': 'bg-[color:var(--glass-border)]',

  // Inline tooltips
  'backgroundColor: \'#000000\'': 'backgroundColor: \'var(--bg-dark)\'',
  'color: \'#fff\'': 'color: \'var(--text-main)\'',
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
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
  
  for (const [oldValue, newValue] of Object.entries(replacements)) {
    // Escape brackets for Regex
    const escapedOld = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOld, 'g');
    content = content.replace(regex, newValue);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nCompleted! Modified ${changedFiles} files.`);
