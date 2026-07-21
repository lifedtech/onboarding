const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..'); // frontend/src/
const componentsDir = path.join(srcDir, 'components');

// Helper to recursively get all files
function getAllFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ext));
    } else {
      if (file.endsWith(ext)) results.push(filePath);
    }
  });
  return results;
}

const allJsxFiles = getAllFiles(srcDir, '.jsx');

// Replace imports in all JSX files
allJsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match any import from something ending with Icons or Icons.jsx
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]*Icons(?:\.jsx)?['"]/g;
  
  if (importRegex.test(content)) {
    const newContent = content.replace(importRegex, `import { $1 } from 'lucide-react'`);
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log('Reverted', file);
    }
  }
});
