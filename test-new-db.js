#!/usr/bin/env node

const { Pool } = require('pg');

async function testNewDatabase() {
    console.log('Testing new PostgreSQL connection...');
    
    const connectionString = 'postgresql://postgres:lVPaNNavuQMGpgoRPpVltdwYeyobsCdO@switchyard.proxy.rlwy.net:19055/railway';
    
    const pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        // Test connection
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Database connected successfully!');
        console.log('Current time:', result.rows[0].current_time);
        console.log('Database version:', result.rows[0].db_version.split(' ')[0]);
        
        // Test table creation
        console.log('\nTesting table creation...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Table creation test passed!');
        
        // Test insert
        console.log('\nTesting data insertion...');
        const insertResult = await pool.query(`
            INSERT INTO contacts (name, email, company, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ['Test User', 'test@example.com', 'Test Company', 'This is a test submission']);
        console.log('✅ Data insertion test passed! ID:', insertResult.rows[0].id);
        
        // Test select
        const selectResult = await pool.query('SELECT COUNT(*) as count FROM contacts');
        console.log('✅ Data selection test passed! Total records:', selectResult.rows[0].count);
        
        await pool.end();
        console.log('\n🎉 New database connection works perfectly!');
        console.log('The form should work once Railway is configured with this URL.');
        
    } catch (error) {
        console.error('\n❌ Database connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        
        if (pool) {
            await pool.end();
        }
        process.exit(1);
    }
}

testNewDatabase().catch(console.error); 