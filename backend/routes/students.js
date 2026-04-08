const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Admin only: Get all students
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT S.*, D.name AS department_name 
            FROM STUDENT S 
            LEFT JOIN DEPARTMENT D ON S.dept_id = D.dept_id
            ORDER BY S.student_id DESC
        `;
        const [rows] = await db.query(query);
        const studentsWithAge = rows.map(s => {
            const ageDifMs = Date.now() - new Date(s.dob).getTime();
            s.age = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
            return s;
        });
        res.json(studentsWithAge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Create a student with photo upload
router.post('/', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
    try {
        const { first_name, last_name, dob, email, phone, address, dept_id } = req.body;
        // If a file was uploaded, construct public URL path, else fallback to null or empty
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

        const query = `
            INSERT INTO STUDENT (first_name, last_name, dob, email, phone, address, dept_id, photo_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [first_name, last_name, dob, email, phone, address, dept_id, photo_url]);
        res.status(201).json({ student_id: result.insertId, message: 'Student created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a student (Admin can update anyone, Student can update themselves)
router.put('/:id', verifyToken, upload.single('photo'), async (req, res) => {
    try {
        const studentId = req.params.id;

        // Security: If not admin, must be updating themselves
        if (req.user.role !== 'admin' && req.user.id != studentId) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        const { first_name, last_name, dob, email, phone, address, dept_id } = req.body;
        let query = 'UPDATE STUDENT SET first_name=?, last_name=?, dob=?, email=?, phone=?, address=?, dept_id=?';
        const params = [first_name, last_name, dob, email, phone, address, dept_id];

        if (req.file) {
            query += ', photo_url=?';
            params.push(`/uploads/${req.file.filename}`);
        }

        query += ' WHERE student_id=?';
        params.push(studentId);

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });

        res.json({ message: 'Profile updated successfully! Please wait for Admin to issue your ID Card.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Delete a student
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM STUDENT WHERE student_id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
