const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Simple backend is running!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.post('/api/contact', (req, res) => {
    console.log('Form submitted:', req.body);
    res.json({ success: true, message: 'Contact received' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Simple backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 