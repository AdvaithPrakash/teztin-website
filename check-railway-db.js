#!/usr/bin/env node

const https = require('https');

async function checkRailwayHealth() {
    const url = 'https://web-production-05312.up.railway.app/api/health';
    
    console.log('Checking Railway backend health...');
    console.log('URL:', url);
    
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Backend is responding');
                    console.log('Status:', response.status);
                    console.log('Database:', response.database);
                    console.log('Timestamp:', response.timestamp);
                    
                    if (response.status === 'healthy' && response.database === 'connected') {
                        console.log('\n🎉 Everything is working!');
                        console.log('The form should work now.');
                    } else {
                        console.log('\n⚠️  Database connection issue detected');
                        console.log('You need to add PostgreSQL to Railway');
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.error('❌ Failed to parse response:', error);
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
    });
}

checkRailwayHealth().catch(console.error); 