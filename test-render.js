#!/usr/bin/env node

// Test script for Render deployment
// Replace YOUR_RENDER_URL with your actual Render URL

const RENDER_URL = 'https://teztin.onrender.com';

async function testRenderDeployment() {
    console.log('🔍 Testing Render Deployment');
    console.log('============================');
    
    // Test 1: Check if website loads
    console.log('\n1️⃣ Testing website accessibility...');
    try {
        const response = await fetch(RENDER_URL);
        if (response.ok) {
            console.log('✅ Website is accessible');
        } else {
            console.log('❌ Website returned status:', response.status);
        }
    } catch (error) {
        console.log('❌ Website not accessible:', error.message);
    }
    
    // Test 2: Check health endpoint
    console.log('\n2️⃣ Testing health endpoint...');
    try {
        const response = await fetch(`${RENDER_URL}/health`);
        const data = await response.json();
        console.log('Health check response:', data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    // Test 3: Test form submission
    console.log('\n3️⃣ Testing form submission...');
    try {
        const response = await fetch(`${RENDER_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Render Test User',
                email: 'render-test@example.com',
                company: 'Render Test Company',
                description: 'Testing form submission on Render'
            })
        });
        
        const data = await response.json();
        console.log('Form submission response:', data);
        
        if (response.ok && data.success) {
            console.log('✅ Form submission successful!');
        } else {
            console.log('❌ Form submission failed');
        }
        
    } catch (error) {
        console.log('❌ Form submission error:', error.message);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('• Website: Check above');
    console.log('• Backend: Check above');
    console.log('• Form submission: Check above');
    console.log('\n💡 If all tests pass, your form should work!');
}

testRenderDeployment().catch(console.error); 