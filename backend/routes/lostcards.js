const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get lost ID reports (Admin sees all, Student sees theirs)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT L.*, I.student_id, S.first_name, S.last_name 
            FROM LOST_ID_CARD L
            JOIN ID_CARD I ON L.card_id = I.card_id
            JOIN STUDENT S ON I.student_id = S.student_id
        `;
        const params = [];
        if (req.user.role === 'student') {
            query += ` WHERE I.student_id = ?`;
            params.push(req.user.id);
        }
        query += ` ORDER BY L.report_date DESC`;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Report a lost ID card
router.post('/', verifyToken, async (req, res) => {
    try {
        const { card_id } = req.body;
        
        // If student, check if card belongs to them
        if (req.user.role === 'student') {
            const [cards] = await db.query('SELECT student_id FROM ID_CARD WHERE card_id = ?', [card_id]);
            if (cards.length === 0 || cards[0].student_id !== req.user.id) {
                return res.status(403).json({ error: 'You do not own this card' });
            }
        }
        
        const reportDateStr = new Date().toISOString().split('T')[0];
        
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            const insertQuery = `
                INSERT INTO LOST_ID_CARD (card_id, report_date, fine_amount, status) 
                VALUES (?, ?, 50.00, 'Pending')
            `;
            await connection.query(insertQuery, [card_id, reportDateStr]);
            
            const updateQuery = `UPDATE ID_CARD SET status = 'Lost' WHERE card_id = ?`;
            await connection.query(updateQuery, [card_id]);
            
            await connection.commit();
            res.status(201).json({ message: 'Lost ID card reported successfully. Fine applied.' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Pay fine
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const query = 'UPDATE LOST_ID_CARD SET status = ? WHERE lost_id = ?';
        const [result] = await db.query(query, [status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Lost ID Report not found' });
        res.json({ message: 'Lost ID payment status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
