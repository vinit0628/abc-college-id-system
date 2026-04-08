const db = require('./backend/config/db');
const fs = require('fs');

async function check() {
    try {
        const [students] = await db.query('SELECT student_id, first_name, last_name, email, password_hash FROM STUDENT');
        const [admins] = await db.query('SELECT * FROM ADMIN');
        
        fs.writeFileSync('dump.json', JSON.stringify({students, admins}, null, 2));
    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
