#!/usr/bin/env node

const https = require('https');

// Replace this URL with your new Railway project URL
const NEW_RAILWAY_URL = process.argv[2] || 'https://your-new-railway-url.up.railway.app';

async function checkNewRailwayProject() {
    console.log('Checking new Railway project...');
    console.log('URL:', NEW_RAILWAY_URL);
    
    // Test root endpoint
    console.log('\n1. Testing root endpoint...');
    try {
        const response = await fetch(NEW_RAILWAY_URL);
        const data = await response.json();
        console.log('✅ Root endpoint working:', data);
    } catch (error) {
        console.log('❌ Root endpoint failed:', error.message);
    }
    
    // Test health endpoint
    console.log('\n2. Testing health endpoint...');
    try {
        const response = await fetch(`${NEW_RAILWAY_URL}/health`);
        const data = await response.json();
        console.log('✅ Health endpoint working:', data);
    } catch (error) {
        console.log('❌ Health endpoint failed:', error.message);
    }
    
    // Test form submission
    console.log('\n3. Testing form submission...');
    try {
        const response = await fetch(`${NEW_RAILWAY_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                company: 'Test Company',
                description: 'Test submission'
            })
        });
        const data = await response.json();
        console.log('✅ Form submission working:', data);
    } catch (error) {
        console.log('❌ Form submission failed:', error.message);
    }
}

checkNewRailwayProject().catch(console.error); 