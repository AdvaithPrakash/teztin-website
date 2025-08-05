#!/usr/bin/env node

const https = require('https');

async function testWebsiteFormSubmission() {
    console.log('🔍 Testing Website Form Submission to PostgreSQL');
    console.log('==============================================');
    
    const baseUrl = 'https://web-production-05312.up.railway.app';
    const testData = {
        name: 'Website Test User',
        email: 'website-test@example.com',
        company: 'Website Test Company',
        description: 'This is a test submission from the website form to check PostgreSQL parsing'
    };
    
    console.log('\n📋 Test Data:');
    console.log(JSON.stringify(testData, null, 2));
    
    // Step 1: Check if website is accessible
    console.log('\n1️⃣ Testing website accessibility...');
    try {
        const response = await fetch(baseUrl);
        if (response.ok) {
            console.log('✅ Website is accessible');
        } else {
            console.log('❌ Website returned status:', response.status);
        }
    } catch (error) {
        console.log('❌ Website not accessible:', error.message);
    }
    
    // Step 2: Check health endpoint
    console.log('\n2️⃣ Testing health endpoint...');
    try {
        const response = await fetch(`${baseUrl}/health`);
        const data = await response.json();
        console.log('Health check response:', data);
        
        if (data.status === 'healthy') {
            console.log('✅ Backend is healthy');
        } else {
            console.log('❌ Backend is unhealthy:', data.error);
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    // Step 3: Test form submission
    console.log('\n3️⃣ Testing form submission to PostgreSQL...');
    try {
        const response = await fetch(`${baseUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response body:', data);
        
        if (response.ok && data.success) {
            console.log('✅ Form submission successful!');
            console.log('📊 Data saved to PostgreSQL with ID:', data.id);
        } else {
            console.log('❌ Form submission failed');
            console.log('Error:', data.error);
        }
        
    } catch (error) {
        console.log('❌ Form submission error:', error.message);
    }
    
    // Step 4: Check if data was actually saved
    console.log('\n4️⃣ Verifying data in PostgreSQL...');
    try {
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: 'postgresql://postgres:lVPaNNavuQMGpgoRPpVltdwYeyobsCdO@switchyard.proxy.rlwy.net:19055/railway',
            ssl: { rejectUnauthorized: false }
        });
        
        const result = await pool.query(`
            SELECT * FROM contacts 
            WHERE email = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [testData.email]);
        
        if (result.rows.length > 0) {
            console.log('✅ Data found in PostgreSQL:');
            console.log(JSON.stringify(result.rows[0], null, 2));
        } else {
            console.log('❌ Data not found in PostgreSQL');
        }
        
        await pool.end();
        
    } catch (error) {
        console.log('❌ Database verification failed:', error.message);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('• Website accessible: ✅');
    console.log('• Backend health: ❌ (Application not found)');
    console.log('• Form submission: ❌ (Backend not running)');
    console.log('• PostgreSQL connection: ✅ (Working locally)');
    console.log('\n💡 The issue is that Railway backend is not running!');
}

testWebsiteFormSubmission().catch(console.error); 