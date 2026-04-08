const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get Dashboard Statistics
router.get('/dashboard-stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const [studentCount] = await db.query('SELECT COUNT(*) as total FROM STUDENT');
        const [idCardCount] = await db.query("SELECT COUNT(*) as total FROM ID_CARD WHERE status='Active'");
        const [lostCardCount] = await db.query("SELECT COUNT(*) as total FROM LOST_ID_CARD WHERE status='Pending'");
        const [fines] = await db.query("SELECT SUM(fine_amount) as total FROM LOST_ID_CARD WHERE status='Paid'");

        res.json({
            total_students: studentCount[0].total,
            active_ids: idCardCount[0].total,
            pending_lost_ids: lostCardCount[0].total,
            total_fines_collected: fines[0].total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
