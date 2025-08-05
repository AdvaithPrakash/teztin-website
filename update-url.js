#!/usr/bin/env node

// Script to update the API URL in the HTML file
const fs = require('fs');
const path = require('path');

const newDomain = process.argv[2];

if (!newDomain) {
    console.log('Usage: node update-url.js <new-domain>');
    console.log('Example: node update-url.js https://teztin.com');
    process.exit(1);
}

// Remove trailing slash if present
const cleanDomain = newDomain.replace(/\/$/, '');

// Read the HTML file
const htmlPath = path.join(__dirname, 'glassmorphism.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Update the API URL
const oldUrl = 'https://web-production-05312.up.railway.app';
const newUrl = cleanDomain;

htmlContent = htmlContent.replace(new RegExp(oldUrl, 'g'), newUrl);

// Write back to file
fs.writeFileSync(htmlPath, htmlContent);

console.log(`✅ Updated API URL from ${oldUrl} to ${newUrl}`);
console.log('📝 Don\'t forget to commit and push the changes:');
console.log('   git add . && git commit -m "Update API URL" && git push origin main'); 