const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const crypto = require('crypto');

// In-memory store for temporary downloads (Nuclear Fix for browser filename issues)
const tempFiles = new Map();

// Get ID cards (Admin gets all, Student gets only theirs)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT I.*, S.first_name, S.last_name, S.photo_url, S.dob, S.address, D.name AS department_name
            FROM ID_CARD I
            JOIN STUDENT S ON I.student_id = S.student_id
            LEFT JOIN DEPARTMENT D ON S.dept_id = D.dept_id
        `;
        const params = [];
        if (req.user.role === 'student') {
            query += ` WHERE I.student_id = ?`;
            params.push(req.user.id);
        }
        query += ` ORDER BY I.created_at DESC`;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Generate an ID card
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { student_id } = req.body;
        const issueDate = new Date();
        const expirationDate = new Date();
        expirationDate.setFullYear(issueDate.getFullYear() + 4);

        const issueDateStr = issueDate.toISOString().split('T')[0];
        const expirationDateStr = expirationDate.toISOString().split('T')[0];

        const query = `
            INSERT INTO ID_CARD (student_id, issue_date, expiration_date, status) 
            VALUES (?, ?, ?, 'Active')
        `;
        const [result] = await db.query(query, [student_id, issueDateStr, expirationDateStr]);
        res.status(201).json({ card_id: result.insertId, message: 'ID Card generated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Update ID card status
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const query = 'UPDATE ID_CARD SET status = ? WHERE card_id = ?';
        const [result] = await db.query(query, [status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'ID card not found' });
        res.json({ message: 'ID Card updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DOWNLOAD PROXY ROUTES (The "Nuclear Option" fix for GUID filenames)

// 1. Upload the generated file temporarily
router.post('/proxy-upload', verifyToken, async (req, res) => {
    try {
        const { fileName, fileType, base64Data } = req.body;
        if (!fileName || !base64Data) return res.status(400).json({ error: 'Missing data' });

        const key = Date.now().toString() + Math.random().toString(36).substring(2);
        const buffer = Buffer.from(base64Data, 'base64');
        
        tempFiles.set(key, { fileName, fileType, buffer });

        // Auto-cleanup after 2 minutes
        setTimeout(() => tempFiles.delete(key), 120000);

        res.json({ key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Browser-native download with official headers
router.get('/proxy-download/:key', async (req, res) => {
    const file = tempFiles.get(req.params.key);
    if (!file) return res.status(404).send('Download link expired. Please try again.');

    res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(file.buffer);
    
    // Optional: cleanup immediately after first download
    tempFiles.delete(req.params.key);
});

module.exports = router;
