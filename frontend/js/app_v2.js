const API_BASE = '/api';

// Auth Check
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// Route Protection
const publicPages = ['/index.html', '/login.html', '/'];
const isPublicPage = publicPages.includes(window.location.pathname) || window.location.pathname === '';

if (!token && !isPublicPage) {
    window.location.href = '/login.html';
}

// ================= GLOBAL HELPERS =================

async function request(url, options = {}) {
    const activeToken = localStorage.getItem('token');
    options.headers = options.headers || {};
    if (activeToken) {
        options.headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
        const res = await fetch(`${API_BASE}${url}`, options);
        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                localStorage.clear();
                window.location.href = '/login.html';
            }
            throw new Error(data.error || 'Server error');
        }
        return data;
    } catch (err) {
        console.error("API Error:", err);
        throw err;
    }
}

// ================= PAGE INITIALIZATION =================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we are on student-form.html
    if (window.location.pathname.includes('student-form.html')) {
        initStudentForm();
    } 
    // 2. Check if we are on dashboard.html
    else if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    }
});

// ================= STUDENT PROFILE FORM =================

function initStudentForm() {
    const form = document.getElementById('studentProfileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = localStorage.getItem('student_id');

        if (!studentId) {
            alert("Session error. Logging out.");
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }

        const fd = new FormData(form);
        try {
            const res = await request(`/students/${studentId}`, {
                method: 'PUT',
                body: fd
            });
            alert(res.message || "ABC College welcomes you! Profile activated.");
            window.location.href = '/dashboard.html';
        } catch (err) {
            alert("Error: " + err.message);
        }
    });

    // Logout on profile page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.clear();
            window.location.href = '/login.html';
        };
    }
}

// ================= DASHBOARD ENGINE =================

function initDashboard() {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');

    // Role-based UI constraints
    if (role === 'student') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        
        // Default student view
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('idcards').classList.add('active');
        navItems.forEach(n => {
            if (n.getAttribute('data-target') === 'idcards') n.classList.add('active');
            else n.classList.remove('active');
        });
        fetchIDCards();
    } else {
        fetchStats();
    }

    // Navigation
    navItems.forEach(item => {
        if (item.id === 'logoutBtn') return;
        if (role === 'student' && item.classList.contains('admin-only')) return;

        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            loadData(targetId);
        });
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });

    // Initial data load for Admin
    if(role === 'admin') {
        fetchStats();
    }
}

function loadData(section) {
    if (role === 'student' && ['dashboard', 'students', 'departments'].includes(section)) return;
    
    switch (section) {
        case 'dashboard': fetchStats(); break;
        case 'students': fetchStudents(); break;
        case 'departments': fetchDepartments(); break;
        case 'idcards': fetchIDCards(); break;
        case 'lostcards': fetchLostCards(); break;
    }
}

// ================= MODAL LOGIC =================

function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('open');
        if(id === 'studentModal') fetchDepartments();
        if(id === 'issueIdModal') fetchStudents();
    }
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}

// ================= DATA FETCHERS =================

async function fetchStats() {
    try {
        const data = await request('/admin/dashboard-stats');
        document.getElementById('stat-students').innerText = data.total_students || 0;
        document.getElementById('stat-active').innerText = data.active_ids || 0;
        document.getElementById('stat-lost').innerText = data.pending_lost_ids || 0;
        document.getElementById('stat-fines').innerText = data.total_fines_collected || 0;
    } catch(e){}
}

async function fetchDepartments() {
    try {
        const data = await request('/departments');
        const tbody = document.getElementById('deptTableBody');
        if (tbody) {
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td>${d.dept_id}</td>
                    <td>${d.name}</td>
                    <td>${d.description || ''}</td>
                </tr>
            `).join('');
        }

        const selects = document.querySelectorAll('select[name="dept_id"]');
        selects.forEach(s => {
            s.innerHTML = '<option value="">Select Department</option>' + data.map(d => `<option value="${d.dept_id}">${d.name}</option>`).join('');
        });
    } catch(e){}
}

async function fetchStudents() {
    try {
        const data = await request('/students');
        const tbody = document.getElementById('studentsTableBody');
        if (tbody) {
            tbody.innerHTML = data.map(s => `
                <tr>
                    <td>${s.student_id}</td>
                    <td>${s.first_name} ${s.last_name}</td>
                    <td>${s.department_name || 'N/A'}</td>
                    <td>${s.dob ? s.dob.split('T')[0] : ''}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.student_id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        const issueSelect = document.getElementById('issueStudentSelect');
        if (issueSelect) {
            issueSelect.innerHTML = data.map(s => `<option value="${s.student_id}">${s.first_name} ${s.last_name} (ID: ${s.student_id})</option>`).join('');
        }
    } catch(e){}
}

async function fetchIDCards() {
    try {
        const data = await request('/idcards');
        const tbody = document.getElementById('idCardTableBody');
        if (tbody) {
            if (role === 'student' && data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 3rem;">
                            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">No ID Card Issued Yet</div>
                            <div style="color: var(--text-muted);">Please complete your profile and wait for the Administrator to issue your official ABC College ID.</div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = data.map(c => `
                <tr>
                    <td>${c.card_id}</td>
                    <td>${c.first_name} ${c.last_name}</td>
                    <td>${c.issue_date.split('T')[0]}</td>
                    <td>${c.expiration_date.split('T')[0]}</td>
                    <td><span class="badge ${c.status.toLowerCase()}">${c.status}</span></td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick='showCardPreview(${JSON.stringify(c).replace(/'/g, "&#39;")})'>Preview</button>
                    </td>
                </tr>
            `).join('');
        }

        const reportSelect = document.getElementById('reportLostCardSelect');
        if (reportSelect) {
            reportSelect.innerHTML = data.filter(c => c.status === 'Active').map(c => `<option value="${c.card_id}">Card #${c.card_id} - ${c.first_name} ${c.last_name}</option>`).join('');
        }
    } catch(e){}
}

async function fetchLostCards() {
    try {
        const data = await request('/lostcards');
        const tbody = document.getElementById('lostCardTableBody');
        if (tbody) {
            tbody.innerHTML = data.map(l => `
                <tr>
                    <td>${l.lost_id}</td>
                    <td>${l.card_id}</td>
                    <td>${l.first_name} ${l.last_name}</td>
                    <td>${l.report_date.split('T')[0]}</td>
                    <td>₹${l.fine_amount}</td>
                    <td><span class="badge active">${l.status}</span></td>
                    <td>-</td>
                </tr>
            `).join('');
        }
    } catch(e){}
}

// ================= ACTIONS =================

async function deleteStudent(id) {
    if(!confirm("Delete this student profile permanently?")) return;
    try {
        await request(`/students/${id}`, { method: 'DELETE' });
        fetchStudents();
    } catch(e){}
}

function showCardPreview(card) {
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
    const canvas = document.getElementById('cardCanvas');
    if(!canvas) return;

    // Formatting DOB
    const dobFormatted = card.dob ? card.dob.split('T')[0] : 'N/A';

    canvas.innerHTML = `
        <div style="font-size: 0.9rem; font-weight: 800; letter-spacing: 0.2em; color: rgba(255,255,255,0.9); margin-top: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.3); width: 100%; text-align: center; padding-bottom: 10px;">ABC COLLEGE</div>
        
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div style="background: white; padding: 5px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: 1rem;">
                <img class="id-photo" src="${card.photo_url || defaultAvatar}" alt="Photo" style="margin: 0; width: 120px; height: 120px; border: none; border-radius: 8px; object-fit: cover;">
            </div>
            
            <div class="id-name" style="font-size: 1.4rem; color: #fff; font-weight: 700; text-align: center; line-height: 1.2;">
                ${(card.first_name + ' ' + (card.last_name || '')).trim().toUpperCase()}
            </div>
            <div class="id-dept" style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-weight: 500; font-size: 0.85rem; margin-top: 0.5rem; color: #fbbf24;">${card.department_name || 'STUDENT'}</div>
        </div>

        <div class="id-details" style="margin-top: 1.5rem; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; width: 100%; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                <span style="color: rgba(255,255,255,0.6);">STUDENT NO</span>
                <span style="font-weight: 700;">#${card.student_id}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                <span style="color: rgba(255,255,255,0.6);">DOB</span>
                <span>${dobFormatted}</span>
            </div>
            <div style="display: flex; flex-direction: column; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
                <span style="color: rgba(255,255,255,0.6); font-size: 0.7rem; text-transform: uppercase;">Address</span>
                <span style="font-size: 0.75rem; line-height: 1.3;">${card.address || 'Not Provided'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
                <span style="color: rgba(255,255,255,0.6);">CARD ID</span>
                <span style="font-weight: 700;">${card.card_id}</span>
            </div>
        </div>

        <div style="margin-top: auto; padding-top: 15px; font-size: 0.6rem; color: rgba(255,255,255,0.4); text-align: center; width: 100%; border-top: 1px dashed rgba(255,255,255,0.2);">
            THIS CARD IS THE PROPERTY OF ABC COLLEGE
        </div>
    `;
    openModal('printPreviewModal');
}

async function downloadPDF() {
    const element = document.getElementById('cardCanvas');
    if (!element) return;

    try {
        console.log("[PROXY] Preparing PDF...");
        alert("Generating high-quality PDF... Please wait a moment.");
        
        const opt = {
            margin: 0,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: [85.6, 135], orientation: 'portrait' }
        };

        // Generate PDF as Base64 Data URL
        const dataUri = await html2pdf().from(element).set(opt).output('datauristring');
        const base64Data = dataUri.split(',')[1];

        // Upload to server proxy
        const { key } = await request('/idcards/proxy-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: 'ABC_College_ID_Card.pdf',
                fileType: 'application/pdf',
                base64Data: base64Data
            })
        });

        // Trigger official download from server
        window.location.href = `/api/idcards/proxy-download/${key}`;
        console.log("[PROXY] PDF Download Redirected.");
        closeModal('printPreviewModal');
    } catch (err) {
        console.error("Proxy PDF Error:", err);
        alert("Download failed. Please try 'Download as Image'.");
    }
}

async function downloadImage() {
    const element = document.getElementById('cardCanvas');
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
        alert("Tools loading... please try again.");
        return;
    }

    try {
        console.log("[PROXY] Preparing Image...");
        alert("Generating high-resolution Image... Please wait 2 seconds.");
        
        const canvas = await html2canvas(element, {
            scale: 4,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        });
        
        const dataUri = canvas.toDataURL('image/png');
        const base64Data = dataUri.split(',')[1];

        // Upload to server proxy
        const { key } = await request('/idcards/proxy-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: 'ABC_College_ID_Card.png',
                fileType: 'image/png',
                base64Data: base64Data
            })
        });

        // Trigger official download from server
        window.location.href = `/api/idcards/proxy-download/${key}`;
        console.log("[PROXY] Image Download Redirected.");
        closeModal('printPreviewModal');
    } catch (err) {
        console.error("Proxy Image Error:", err);
        alert("Download failed. Contact support or take a screenshot.");
    }
}

// ================= FORMS =================

document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
        await request('/students', { method: 'POST', body: fd });
        closeModal('studentModal');
        fetchStudents();
    } catch(e){}
});

document.getElementById('deptForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
        await request('/departments', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body) 
        });
        closeModal('deptModal');
        fetchDepartments();
    } catch(e){}
});

document.getElementById('issueIdForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
        await request('/idcards', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body) 
        });
        closeModal('issueIdModal');
        fetchIDCards();
    } catch(e){}
});

document.getElementById('reportLostForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
        await request('/lostcards', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body) 
        });
        closeModal('reportLostModal');
        fetchLostCards();
    } catch(e){}
});
