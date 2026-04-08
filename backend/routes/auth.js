const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
    const { username_or_email, password, role } = req.body;
    console.log(`[LOGIN ATTEMPT] Role: ${role}, User: ${username_or_email}, Pass: ${password}`);
    try {
        if (!role) {
            console.log('[LOGIN FAILED] Role is missing.');
            return res.status(400).json({ error: 'Role is missing! Please completely refresh your browser (Ctrl+Shift+R).' });
        }
        if (role === 'admin') {
            const [admins] = await db.query('SELECT * FROM ADMIN WHERE username = ?', [username_or_email]);
            if (admins.length > 0) {
                const admin = admins[0];
                if (password === admin.password_hash || (require('bcryptjs').compareSync(password, admin.password_hash))) {
                    console.log(`[LOGIN SUCCESS] Admin: ${username_or_email}`);
                    const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, SECRET_KEY, { expiresIn: '8h' });
                    return res.json({ token, role: 'admin', message: 'Logged in as Admin' });
                }
            }
        }
        else if (role === 'student') {
            // Check if student exists by email or first_name
            const [students] = await db.query('SELECT * FROM STUDENT WHERE email = ? OR first_name = ?', [username_or_email, username_or_email]);

            if (students.length > 0) {
                const student = students[0];

                // If they are logging in for the FIRST time
                if (!student.password_hash || student.password_hash === 'student123') {
                    // "student can login without register so keep it simple"
                    // Bind the newly provided password to this student!
                    await db.query('UPDATE STUDENT SET password_hash = ? WHERE student_id = ?', [password, student.student_id]);
                    const token = jwt.sign({ id: student.student_id, role: 'student' }, SECRET_KEY, { expiresIn: '8h' });
                    console.log(`[LOGIN SUCCESS - FIRST TIME] Student bound to password: ${password}`);
                    return res.json({ token, role: 'student', student_id: student.student_id, dob: student.dob, message: 'Logged in as Student' });
                }
                // Alternatively, they have set a password previously, so check if it matches
                else if (password === student.password_hash) {
                    const token = jwt.sign({ id: student.student_id, role: 'student' }, SECRET_KEY, { expiresIn: '8h' });
                    console.log(`[LOGIN SUCCESS] Student authenticated: ${username_or_email}`);
                    return res.json({ token, role: 'student', student_id: student.student_id, dob: student.dob, message: 'Logged in as Student' });
                } else {
                    console.log(`[LOGIN FAILED] Password mismatch for student: ${student.password_hash} != ${password}`);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            } else {
                console.log(`[AUTO-REGISTER] No student found. Creating new student: ${username_or_email}`);
                // "student can login without register so keep it simple" -> create them automatically
                const dummyDob = '2000-01-01';
                const insertQuery = `INSERT INTO STUDENT (first_name, last_name, dob, email, password_hash) VALUES (?, ?, ?, ?, ?)`;
                const [result] = await db.query(insertQuery, [username_or_email, 'Student', dummyDob, username_or_email, password]);

                const token = jwt.sign({ id: result.insertId, role: 'student' }, SECRET_KEY, { expiresIn: '8h' });
                return res.json({ token, role: 'student', student_id: result.insertId, dob: dummyDob, message: 'Logged in as New Student' });
            }
        }

        console.log(`[LOGIN FAILED] Reached end of logic. Returning 401.`);
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


