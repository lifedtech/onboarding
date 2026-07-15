const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We will remove borders that are commonly used for cards and tables
      const original = content;
      content = content.replace(/ border border-slate-200\/60/g, '');
      content = content.replace(/ border-slate-200\/60/g, '');
      content = content.replace(/ border border-slate-200/g, '');
      content = content.replace(/ border-slate-200/g, '');
      content = content.replace(/ border-b border-slate-100/g, '');
      content = content.replace(/ border border-slate-100/g, '');
      
      // Note: we preserve 'border' keyword if it's dynamic like border-emerald-400 etc, but the above removes the explicit slate borders
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir('e:\\lifed-1kiro - Copy\\frontend\\src\\components\\dashboard');
