const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.cursor',
  'data',
  '.next'
]);

const IGNORE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf', '.zip', '.tar', '.gz'
]);

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (IGNORE_DIRS.has(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (IGNORE_EXTS.has(ext)) continue;
      callback(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replacements
    content = content.replace(/agilo\.ing/g, 'agilo.tech');
    content = content.replace(/docs\.agilo\.ing/g, 'agilo.tech/docs');
    content = content.replace(/agilo\.com/g, 'agilo.tech');
    content = content.replace(/agilo\.ai/g, 'agilo.tech');
    content = content.replace(/agilo\.com/g, 'agilo.tech');

    content = content.replace(/@agilo/g, '@agilo');
    content = content.replace(/agilo/g, 'agilo');
    
    content = content.replace(/Agilo/g, 'Agilo');
    content = content.replace(/agilo/g, 'agilo');
    content = content.replace(/AGILO/g, 'AGILO');
    
    content = content.replace(/Agilo/g, 'Agilo');
    content = content.replace(/agilo/g, 'agilo');
    content = content.replace(/AGILO/g, 'AGILO');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}

walkDir('.', processFile);
console.log('Done replacing.');
