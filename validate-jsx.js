// Validate JSX syntax in Checkout.jsx
import fs from 'fs';

const content = fs.readFileSync('d:/Textile/Ahalya Tex/AHALYA-TEXILE-main/frontend/src/pages/Checkout.jsx', 'utf8');

// Find all opening and closing tags
const lines = content.split('\n');
const errors = [];

let inJSX = false;
let fragmentDepth = 0;
let divDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Count fragments
  const openFrags = (line.match(/<>/g) || []).length;
  const closeFrags = (line.match(/<\/>/g) || []).length;
  fragmentDepth += openFrags - closeFrags;
  
  // Count divs
  const openDivs = (line.match(/<div[^>]*>/g) || []).length;
  const closeDivs = (line.match(/<\/div>/g) || []).length;
  divDepth += openDivs - closeDivs;
  
  // Check for issues around line 1016
  if (lineNum >= 1010 && lineNum <= 1020) {
    console.log(`Line ${lineNum}: ${line.trim()}`);
    console.log(`  Fragment depth: ${fragmentDepth}, Div depth: ${divDepth}`);
  }
  
  // Check for unmatched fragments
  if (fragmentDepth < 0) {
    errors.push(`Line ${lineNum}: Too many closing fragments`);
  }
  if (fragmentDepth > 0) {
    errors.push(`Line ${lineNum}: Unclosed fragment`);
  }
}

console.log('JSX Validation Results:');
console.log('Errors found:', errors.length);
if (errors.length > 0) {
  console.log(errors);
} else {
  console.log('No obvious JSX syntax errors found');
}
