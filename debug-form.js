#!/usr/bin/env node

const https = require('https');

async function testFormSubmission() {
    const url = 'https://web-production-05312.up.railway.app/api/contact';
    const testData = {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Company',
        description: 'This is a test submission to debug the form'
    };
    
    console.log('Testing form submission...');
    console.log('URL:', url);
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const postData = JSON.stringify(testData);
    
    const options = {
        hostname: 'web-production-05312.up.railway.app',
        port: 443,
        path: '/api/contact',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            console.log('Response Status:', res.statusCode);
            console.log('Response Headers:', res.headers);
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    console.log('Response Body:', data);
                    const response = JSON.parse(data);
                    console.log('Parsed Response:', response);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Form submission successful!');
                    } else {
                        console.log('❌ Form submission failed');
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.error('❌ Failed to parse response:', error);
                    console.log('Raw response:', data);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request failed:', error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            console.error('❌ Request timed out');
            req.destroy();
            reject(new Error('Request timed out'));
        });
        
        req.write(postData);
        req.end();
    });
}

testFormSubmission().catch(console.error); 