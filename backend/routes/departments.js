const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all departments (Accessible to everyone logged in)
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM DEPARTMENT');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a department
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query('INSERT INTO DEPARTMENT (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ dept_id: result.insertId, name, description });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
