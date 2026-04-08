const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// High-capacity body parser for large ID card images (MUST BE FIRST)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

// Disable caching to force browser to get latest files during development
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/students', require('./routes/students'));
app.use('/api/idcards', require('./routes/idcards'));
app.use('/api/lostcards', require('./routes/lostcards'));
app.use('/api/admin', require('./routes/admin'));

// Fallback to index.html for UI (excluding /api paths if they result in 404)
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) return res.status(404).send('Not found');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
