const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Teztin backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Test contact endpoint
app.post('/api/contact', (req, res) => {
    console.log('Contact form submitted:', req.body);
    res.json({ 
        success: true, 
        message: 'Contact received (test mode)',
        data: req.body
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Minimal backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database URL: ${process.env.PG_URL ? 'Set' : 'Not set'}`);
}); 