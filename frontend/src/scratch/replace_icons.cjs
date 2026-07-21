const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..'); // frontend/src/
const componentsDir = path.join(srcDir, 'components');
const assetsDir = path.join(srcDir, 'assets');

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
const allSvgFiles = getAllFiles(assetsDir, '.svg');

// Manual mapping of Lucide names to SVG filenames (without .svg)
const nameMap = {
  'Camera': 'Camera',
  'Check': 'Check',
  'ChevronLeft': 'Left Chevron',
  'Plus': 'Add',
  'Clock': 'Time',
  'BookOpen': 'Book',
  'X': 'Remove', // or Delete
  'Tag': 'Tag',
  'User': 'User',
  'CalendarDays': 'Calendar',
  'UserPlus': 'Add User',
  'Mail': 'Mail',
  'Lock': 'Lock',
  'AlertCircle': 'Exclamation',
  'Activity': 'Graph',
  'ArrowRight': 'Right',
  'Calendar': 'Calendar',
  'MapPin': 'Location',
  'PhoneCall': 'Call',
  'FileText': 'File',
  'AlertTriangle': 'Exclamation 2',
  'Shield': 'Security',
  'Play': 'Play',
  'Users': 'User 2',
  'Sparkles': 'Sparks',
  'Zap': 'Lightning',
  'TrendingUp': 'Graph 2',
  'Target': 'Target',
  'BarChart2': 'Graph',
  'Volume2': 'Volume High',
  'VolumeX': 'Mute',
  'Megaphone': 'Megaphone',
  'DollarSign': 'Bill',
  'Search': 'Search',
  'ChevronRight': 'Right Chevron',
  'Heart': 'Heart',
  'Minimize2': 'Shrink',
  'Send': 'Send',
  'Pin': 'Pin',
  'Trash2': 'Bin',
  'Palette': 'Color Palette',
  'CheckSquareIcon': 'Check 2',
  'Copy': 'Copy',
  'Book': 'Books',
  'Save': 'Save',
  'CalendarIcon': 'Calendar',
  'PenTool': 'Pen Tool',
  'ChevronDown': 'Down Chevron',
  'MessageSquare': 'Chat',
  'ChevronUp': 'Up Chevron',
};

// Find matching SVGs
const mappedSvgs = {};
const unmappedLucide = new Set();
let allImports = new Set();

allJsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim()); 
    imports.forEach(imp => {
      if (!imp) return;
      
      let lucideName = imp;
      let aliasName = imp;
      if (imp.includes(' as ')) {
        const parts = imp.split(' as ');
        lucideName = parts[0].trim();
        aliasName = parts[1].trim();
      }
      
      allImports.add(lucideName);
      
      const mappedName = nameMap[lucideName] || nameMap[aliasName];
      let svgPath = null;
      if (mappedName) {
        svgPath = allSvgFiles.find(p => path.basename(p).toLowerCase() === mappedName.toLowerCase() + '.svg');
      }
      
      if (svgPath) {
        mappedSvgs[lucideName] = svgPath;
      } else {
        unmappedLucide.add(lucideName);
      }
    });
  }
});

// Generate Icons.jsx
let iconsJsxContent = `// Auto-generated icon mapping\n\n`;

// Add direct SVG imports
Object.entries(mappedSvgs).forEach(([lucideName, svgPath]) => {
  let relativePath = path.relative(componentsDir, svgPath).replace(/\\/g, '/');
  iconsJsxContent += `export { default as ${lucideName} } from '${relativePath}?react';\n`;
});

// Add unmapped from lucide-react
if (unmappedLucide.size > 0) {
  iconsJsxContent += `\nexport {\n`;
  Array.from(unmappedLucide).forEach(lucideName => {
    iconsJsxContent += `  ${lucideName},\n`;
  });
  iconsJsxContent += `} from 'lucide-react';\n`;
}

fs.writeFileSync(path.join(componentsDir, 'Icons.jsx'), iconsJsxContent);
console.log('Created Icons.jsx');

// Replace imports in all JSX files
allJsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('lucide-react')) {
    // Relative path to Icons.jsx
    let relativeToIcons = path.relative(path.dirname(file), path.join(componentsDir, 'Icons.jsx')).replace(/\\/g, '/');
    if (!relativeToIcons.startsWith('.')) {
      relativeToIcons = './' + relativeToIcons;
    }
    // Remove .jsx
    relativeToIcons = relativeToIcons.replace('.jsx', '');

    const newContent = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, `import { $1 } from '${relativeToIcons}'`);
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log('Updated', file);
    }
  }
});
