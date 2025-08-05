#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
    console.log('Testing database connection...');
    console.log('Environment variables:');
    console.log('- PG_URL:', process.env.PG_URL ? 'Set' : 'Not set');
    console.log('- DB_HOST:', process.env.DB_HOST || 'Not set');
    console.log('- DB_NAME:', process.env.DB_NAME || 'Not set');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'Not set');
    
    let pool;
    
    try {
        if (process.env.PG_URL) {
            console.log('\nTrying Railway PostgreSQL connection...');
            pool = new Pool({
                connectionString: process.env.PG_URL,
                ssl: { rejectUnauthorized: false }
            });
        } else {
            console.log('\nTrying local PostgreSQL connection...');
            pool = new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'teztin_contacts',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '',
                ssl: false
            });
        }
        
        // Test connection
        const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Database connected successfully!');
        console.log('Current time:', result.rows[0].current_time);
        console.log('Database version:', result.rows[0].db_version.split(' ')[0]);
        
        // Test table creation
        console.log('\nTesting table creation...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_contacts (
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
            INSERT INTO test_contacts (name, email, company, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ['Test User', 'test@example.com', 'Test Company', 'This is a test submission']);
        console.log('✅ Data insertion test passed! ID:', insertResult.rows[0].id);
        
        // Test select
        const selectResult = await pool.query('SELECT COUNT(*) as count FROM test_contacts');
        console.log('✅ Data selection test passed! Total records:', selectResult.rows[0].count);
        
        await pool.end();
        console.log('\n🎉 All database tests passed!');
        
    } catch (error) {
        console.error('\n❌ Database connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 This usually means:');
            console.log('- PostgreSQL is not running locally');
            console.log('- Wrong host/port configuration');
            console.log('- Firewall blocking the connection');
        } else if (error.code === 'ENOTFOUND') {
            console.log('\n💡 This usually means:');
            console.log('- Invalid hostname');
            console.log('- Network connectivity issues');
        } else if (error.code === '28P01') {
            console.log('\n💡 This usually means:');
            console.log('- Wrong username/password');
            console.log('- User does not exist');
        } else if (error.code === '3D000') {
            console.log('\n💡 This usually means:');
            console.log('- Database does not exist');
            console.log('- Wrong database name');
        }
        
        if (pool) {
            await pool.end();
        }
        process.exit(1);
    }
}

testDatabaseConnection(); 