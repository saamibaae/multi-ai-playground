#!/usr/bin/env node

// Firebase configuration validation script
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Firebase Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create a .env.local file with your Firebase configuration.');
  process.exit(1);
}

// Read and parse .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

// Handle UTF-16 encoding and BOM
if (envContent.charCodeAt(0) === 0xFEFF) {
  envContent = envContent.slice(1); // Remove BOM
}

// Convert UTF-16 to UTF-8 if needed
if (envContent.includes('\x00')) {
  // This is likely UTF-16, convert to UTF-8
  const buffer = fs.readFileSync(envPath);
  envContent = buffer.toString('utf16le');
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1); // Remove BOM
  }
}

const envVars = {};

envContent.split('\n').forEach((line) => {
  // Skip empty lines and comments
  if (line.trim() === '' || line.trim().startsWith('#')) {
    return;
  }

  const equalIndex = line.indexOf('=');
  if (equalIndex > 0) {
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    // Remove quotes if present and carriage returns
    const cleanValue = value.replace(/^["']|["']$/g, '').replace(/\r/g, '');
    envVars[key] = cleanValue;
  }
});

// Required Firebase environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

let allValid = true;
const missingVars = [];

console.log('📋 Checking environment variables:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars.push(varName);
    allValid = false;
  }
});

console.log('\n📊 Validation Results:');

if (allValid) {
  console.log('✅ All Firebase environment variables are set!');
  console.log('🚀 You can now run: npm run dev');
} else {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📖 Please refer to FIREBASE_SETUP.md for setup instructions.');
  process.exit(1);
}

// Additional validation checks
console.log('\n🔧 Additional checks:');

// Check if API key looks valid (starts with AIza)
const apiKey = envVars['NEXT_PUBLIC_FIREBASE_API_KEY'];
if (apiKey && !apiKey.startsWith('AIza')) {
  console.log('⚠️  Warning: API key format looks unusual. Make sure it\'s correct.');
}

// Check if project ID matches auth domain
const projectId = envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
const authDomain = envVars['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'];
if (projectId && authDomain && !authDomain.includes(projectId)) {
  console.log('⚠️  Warning: Auth domain doesn\'t seem to match project ID.');
}

console.log('\n✨ Validation complete!');
