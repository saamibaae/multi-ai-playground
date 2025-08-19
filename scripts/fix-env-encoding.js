#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found.');
  process.exit(1);
}

let buf = fs.readFileSync(envPath);
let content = buf.toString('utf8');

// If it looks like UTF-16 (contains many null bytes), decode as utf16le
const hasNulls = content.includes('\x00');
if (hasNulls) {
  content = buf.toString('utf16le');
}
// Strip BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
// Normalize Windows newlines to \n
content = content.replace(/\r\n/g, '\n');

fs.writeFileSync(envPath, content, { encoding: 'utf8' });
console.log('Rewrote .env.local as UTF-8 (no BOM).');
