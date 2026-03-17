// Simple JSX syntax checker
import fs from 'fs';

const content = fs.readFileSync('d:/Textile/Ahalya Tex/AHALYA-TEXILE-main/frontend/src/pages/Checkout.jsx', 'utf8');

// Count opening and closing tags
const openFrags = (content.match(/<>/g) || []).length;
const closeFrags = (content.match(/<\/>/g) || []).length;

console.log('Opening fragments <>', openFrags);
console.log('Closing fragments </>', closeFrags);
console.log('Balance:', openFrags - closeFrags);

if (openFrags !== closeFrags) {
  console.error('JSX fragment mismatch detected!');
} else {
  console.log('JSX fragments are balanced');
}
