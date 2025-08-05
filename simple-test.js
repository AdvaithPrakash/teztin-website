const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.json({ 
        message: 'Teztin server is running!',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Simple test server running on port ${PORT}`);
}); 