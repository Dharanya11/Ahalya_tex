// Script to fix Checkout.jsx JSX syntax
import fs from 'fs';

const filePath = 'd:/Textile/Ahalya Tex/AHALYA-TEXILE-main/frontend/src/pages/Checkout.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and fix common JSX issues
console.log('Analyzing Checkout.jsx for JSX issues...');

// Check for unclosed fragments
const openFrags = content.match(/<>/g) || [];
const closeFrags = content.match(/<\/>/g) || [];

console.log(`Opening fragments: ${openFrags.length}`);
console.log(`Closing fragments: ${closeFrags.length}`);

if (openFrags.length !== closeFrags.length) {
  console.log('Fragment mismatch detected!');
  
  // Find the last unclosed fragment and add closing
  const lines = content.split('\n');
  let fragmentBalance = 0;
  let errorLine = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openCount = (line.match(/<>/g) || []).length;
    const closeCount = (line.match(/<\/>/g) || []).length;
    fragmentBalance += openCount - closeCount;
    
    if (fragmentBalance > 0 && i >= 1010 && i <= 1020) {
      console.log(`Potential issue around line ${i + 1}: ${line.trim()}`);
      errorLine = i;
    }
  }
  
  if (errorLine !== -1) {
    console.log(`Attempting to fix around line ${errorLine + 1}`);
    
    // Look for the specific pattern causing the issue
    for (let i = Math.max(0, errorLine - 5); i < Math.min(lines.length, errorLine + 10); i++) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
    }
  }
} else {
  console.log('Fragments are balanced, checking for other issues...');
}

// Check for other common JSX issues
const issues = [];

// Check for missing closing divs
const openDivs = content.match(/<div[^>]*>/g) || [];
const closeDivs = content.match(/<\/div>/g) || [];

console.log(`Opening divs: ${openDivs.length}`);
console.log(`Closing divs: ${closeDivs.length}`);

if (openDivs.length !== closeDivs.length) {
  issues.push('Div tag mismatch');
}

// Check for unclosed parentheses
const openParens = content.match(/\(/g) || [];
const closeParens = content.match(/\)/g) || [];

console.log(`Opening parentheses: ${openParens.length}`);
console.log(`Closing parentheses: ${closeParens.length}`);

if (openParens.length !== closeParens.length) {
  issues.push('Parentheses mismatch');
}

console.log('Issues found:', issues);

if (issues.length > 0) {
  console.log('JSX syntax issues detected. Manual review needed.');
} else {
  console.log('No obvious syntax issues found.');
}
