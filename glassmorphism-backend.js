const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'teztin_contacts',
    user: process.env.DB_USER || 'advaith',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create contacts table if it doesn't exist
async function createContactsTable() {
    try {
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
        console.log('Contacts table ready');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

// API Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, company, description } = req.body;
        
        // Validate required fields
        if (!name || !email || !description) {
            return res.status(400).json({ 
                error: 'Name, email, and description are required' 
            });
        }
        
        // Insert into database
        const result = await pool.query(`
            INSERT INTO contacts (name, email, company, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id, created_at
        `, [name, email, company || null, description]);
        
        console.log('Contact saved to database:', {
            id: result.rows[0].id,
            name,
            email,
            company,
            created_at: result.rows[0].created_at
        });
        
        res.json({ 
            success: true, 
            message: 'Contact saved successfully',
            id: result.rows[0].id
        });
        
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ 
            error: 'Failed to save contact' 
        });
    }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM contacts 
            ORDER BY created_at DESC
        `);
        
        res.json({ contacts: result.rows });
        
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ 
            error: 'Failed to fetch contacts' 
        });
    }
});

// Export contacts as JSON
app.get('/api/contacts/export/json', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM contacts 
            ORDER BY created_at DESC
        `);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="teztin-contacts-${new Date().toISOString().split('T')[0]}.json"`);
        res.json({ 
            export_date: new Date().toISOString(),
            total_contacts: result.rows.length,
            contacts: result.rows 
        });
        
    } catch (error) {
        console.error('Error exporting contacts:', error);
        res.status(500).json({ 
            error: 'Failed to export contacts' 
        });
    }
});

// Export contacts as CSV
app.get('/api/contacts/export/csv', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM contacts 
            ORDER BY created_at DESC
        `);
        
        const csvHeader = 'Name,Email,Company,Description,Created At\n';
        const csvRows = result.rows.map(contact => {
            const name = `"${contact.name.replace(/"/g, '""')}"`;
            const email = `"${contact.email}"`;
            const company = contact.company ? `"${contact.company.replace(/"/g, '""')}"` : '';
            const description = `"${contact.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            const createdAt = `"${contact.created_at}"`;
            
            return `${name},${email},${company},${description},${createdAt}`;
        }).join('\n');
        
        const csvContent = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="teztin-contacts-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting contacts:', error);
        res.status(500).json({ 
            error: 'Failed to export contacts' 
        });
    }
});

// Dashboard route - HTML interface
app.get('/dashboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM contacts 
            ORDER BY created_at DESC
        `);
        
        const contacts = result.rows;
        const totalContacts = contacts.length;
        const recentContacts = contacts.slice(0, 5);
        
        // Calculate analytics
        const contactsWithCompany = contacts.filter(c => c.company).length;
        const contactsWithoutCompany = totalContacts - contactsWithCompany;
        const today = new Date().toDateString();
        const todayContacts = contacts.filter(c => new Date(c.created_at).toDateString() === today).length;
        const thisWeekContacts = contacts.filter(c => {
            const contactDate = new Date(c.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return contactDate >= weekAgo;
        }).length;
        
        // Get unique companies
        const companies = [...new Set(contacts.filter(c => c.company).map(c => c.company))];
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teztin - Contact Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #7f8c8d;
            font-size: 1.1rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 1rem;
        }
        
        .controls-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            align-items: end;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
        }
        
        .control-group label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .control-group input, .control-group select {
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .control-group input:focus, .control-group select:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .btn-secondary {
            background: #95a5a6;
        }
        
        .btn-secondary:hover {
            background: #7f8c8d;
        }
        
        .contacts-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
            color: #2c3e50;
            font-size: 1.8rem;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        .contact-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
            transition: all 0.3s ease;
        }
        
        .contact-card:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .contact-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .contact-name {
            font-size: 1.3rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .contact-date {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .contact-email {
            color: #3498db;
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .contact-company {
            color: #27ae60;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .contact-description {
            color: #555;
            line-height: 1.6;
            background: #fff;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .no-contacts {
            text-align: center;
            color: #7f8c8d;
            font-size: 1.2rem;
            padding: 40px;
        }
        
        .analytics-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .analytics-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #e74c3c;
        }
        
        .analytics-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .company-list {
            list-style: none;
            padding: 0;
        }
        
        .company-item {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .company-item:last-child {
            border-bottom: none;
        }
        
        .api-info {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #e74c3c;
        }
        
        .api-info h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .api-endpoint {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Monaco', 'Menlo', monospace;
            margin: 5px 0;
        }
        
        .hidden {
            display: none;
        }
        
        .highlight {
            background: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Teztin Contact Dashboard</h1>
            <p>Comprehensive view of all "I'm Interested" form submissions with advanced analytics</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalContacts}</div>
                <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${todayContacts}</div>
                <div class="stat-label">Today's Submissions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${thisWeekContacts}</div>
                <div class="stat-label">This Week</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${contactsWithCompany}</div>
                <div class="stat-label">With Company Info</div>
            </div>
        </div>
        
        <div class="controls-section">
            <h2 class="section-title">Search & Filter Controls</h2>
            <div class="controls-grid">
                <div class="control-group">
                    <label for="searchInput">Search by name, email, or description:</label>
                    <input type="text" id="searchInput" placeholder="Type to search...">
                </div>
                <div class="control-group">
                    <label for="companyFilter">Filter by company:</label>
                    <select id="companyFilter">
                        <option value="">All companies</option>
                        ${companies.map(company => `<option value="${company}">${company}</option>`).join('')}
                    </select>
                </div>
                <div class="control-group">
                    <label for="dateFilter">Filter by date:</label>
                    <select id="dateFilter">
                        <option value="">All time</option>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                    </select>
                </div>
                <div class="control-group">
                    <button class="btn" onclick="applyFilters()">Apply Filters</button>
                    <button class="btn btn-secondary" onclick="clearFilters()" style="margin-top: 10px;">Clear All</button>
                </div>
            </div>
        </div>
        
        <div class="analytics-section">
            <h2 class="section-title">Analytics & Insights</h2>
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="analytics-title">Companies Represented</div>
                    <p>${companies.length} unique companies have submitted inquiries</p>
                    <ul class="company-list">
                        ${companies.slice(0, 5).map(company => `<li class="company-item">• ${company}</li>`).join('')}
                        ${companies.length > 5 ? `<li class="company-item">... and ${companies.length - 5} more</li>` : ''}
                    </ul>
                </div>
                <div class="analytics-card">
                    <div class="analytics-title">Submission Trends</div>
                    <p><strong>Today:</strong> ${todayContacts} submissions</p>
                    <p><strong>This Week:</strong> ${thisWeekContacts} submissions</p>
                    <p><strong>With Company:</strong> ${contactsWithCompany} (${Math.round(contactsWithCompany/totalContacts*100)}%)</p>
                    <p><strong>Without Company:</strong> ${contactsWithoutCompany} (${Math.round(contactsWithoutCompany/totalContacts*100)}%)</p>
                </div>
            </div>
        </div>
        
        <div class="contacts-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 class="section-title">Contact Submissions</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="exportData('json')">Export JSON</button>
                    <button class="btn btn-secondary" onclick="exportData('csv')">Export CSV</button>
                    <button class="btn" onclick="location.reload()">Refresh</button>
                </div>
            </div>
            
            <div id="contactsList">
                            ${contacts.length === 0 ? 
                '<div class="no-contacts">No contacts submitted yet. Submit a form to see data here!</div>' :
                    contacts.map(contact => `
                        <div class="contact-card" data-name="${contact.name.toLowerCase()}" data-email="${contact.email.toLowerCase()}" data-company="${(contact.company || '').toLowerCase()}" data-description="${contact.description.toLowerCase()}" data-date="${contact.created_at}">
                            <div class="contact-header">
                                <div class="contact-name">${contact.name}</div>
                                <div class="contact-date">${new Date(contact.created_at).toLocaleString()}</div>
                            </div>
                            <div class="contact-email">Email: ${contact.email}</div>
                            ${contact.company ? `<div class="contact-company">Company: ${contact.company}</div>` : '<div style="color: #95a5a6; font-style: italic;">No company provided</div>'}
                            <div class="contact-description">
                                <strong>Project Description:</strong><br>
                                ${contact.description}
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
        
        <div class="api-info">
            <h3>API Endpoints</h3>
            <p><strong>View all contacts:</strong></p>
            <div class="api-endpoint">GET http://localhost:3001/api/contacts</div>
            <p><strong>Export as JSON:</strong></p>
            <div class="api-endpoint">GET http://localhost:3001/api/contacts/export/json</div>
            <p><strong>Export as CSV:</strong></p>
            <div class="api-endpoint">GET http://localhost:3001/api/contacts/export/csv</div>
            <p><strong>Health check:</strong></p>
            <div class="api-endpoint">GET http://localhost:3001/api/health</div>
            <p><strong>Submit new contact:</strong></p>
            <div class="api-endpoint">POST http://localhost:3001/api/contact</div>
        </div>
    </div>
    
    <script>
        // Filter functionality
        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const companyFilter = document.getElementById('companyFilter').value.toLowerCase();
            const dateFilter = document.getElementById('dateFilter').value;
            
            const contactCards = document.querySelectorAll('.contact-card');
            
            contactCards.forEach(card => {
                let show = true;
                
                // Search filter
                if (searchTerm) {
                    const name = card.dataset.name;
                    const email = card.dataset.email;
                    const description = card.dataset.description;
                    const company = card.dataset.company;
                    
                    if (!name.includes(searchTerm) && !email.includes(searchTerm) && !description.includes(searchTerm) && !company.includes(searchTerm)) {
                        show = false;
                    }
                }
                
                // Company filter
                if (companyFilter && card.dataset.company !== companyFilter) {
                    show = false;
                }
                
                // Date filter
                if (dateFilter) {
                    const contactDate = new Date(card.dataset.date);
                    const now = new Date();
                    
                    switch(dateFilter) {
                        case 'today':
                            if (contactDate.toDateString() !== now.toDateString()) {
                                show = false;
                            }
                            break;
                        case 'week':
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            if (contactDate < weekAgo) {
                                show = false;
                            }
                            break;
                        case 'month':
                            const monthAgo = new Date();
                            monthAgo.setMonth(monthAgo.getMonth() - 1);
                            if (contactDate < monthAgo) {
                                show = false;
                            }
                            break;
                    }
                }
                
                card.style.display = show ? 'block' : 'none';
            });
            
            // Update count
            const visibleCards = document.querySelectorAll('.contact-card[style="display: block"], .contact-card:not([style])');
            updateFilterCount(visibleCards.length);
        }
        
        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('companyFilter').value = '';
            document.getElementById('dateFilter').value = '';
            
            const contactCards = document.querySelectorAll('.contact-card');
            contactCards.forEach(card => {
                card.style.display = 'block';
            });
            
            updateFilterCount(contactCards.length);
        }
        
        function updateFilterCount(count) {
            const title = document.querySelector('.section-title');
            const originalText = title.textContent;
            const baseText = originalText.replace(/ \(\d+ found\)/, '');
            title.textContent = baseText + ' (' + count + ' found)';
        }
        
        // Real-time search
        document.getElementById('searchInput').addEventListener('input', applyFilters);
        document.getElementById('companyFilter').addEventListener('change', applyFilters);
        document.getElementById('dateFilter').addEventListener('change', applyFilters);
        
        // Initialize count
        const totalCards = document.querySelectorAll('.contact-card').length;
        updateFilterCount(totalCards);
        
        // Export functionality
        function exportData(format) {
            const url = format === 'json' 
                ? 'http://localhost:3001/api/contacts/export/json'
                : 'http://localhost:3001/api/contacts/export/csv';
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'teztin-contacts-' + new Date().toISOString().split('T')[0] + '.' + format;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>
        `;
        
        res.send(html);
        
    } catch (error) {
        console.error('Error generating dashboard:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Teztin backend running on port ${PORT}`);
    createContactsTable();
}); 