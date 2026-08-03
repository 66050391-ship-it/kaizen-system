const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');

// 💡 สั่งให้ Node.js ตรวจสอบและสร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Created uploads folder successfully!');
}
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ตั้งค่า Session สำหรับระบบ Login
app.use(session({
  secret: 'kaizen_secret_key_2026',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // อยู่ได้ 1 วัน
}));

require('dotenv').config(); // 👈 บรรทัดแรกสุดของไฟล์ server.js

// ตั้งค่าการเชื่อมต่อ MySQL Database โดยอ่านค่าจากไฟล์ .env
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'kaizen_db',
  port: process.env.DB_PORT || 4000, // 👈 เพิ่มบรรทัดนี้ (พอร์ตของ TiDB)
  ssl: {                              // 👈 เพิ่มการเข้ารหัส SSL ตรงนี้
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ เชื่อมต่อ MySQL ไม่สำเร็จ:', err);
  } else {
    console.log('✅ เชื่อมต่อ MySQL Database สำเร็จ!');
    connection.release(); // ปล่อย connection กลับไปยัง pool
  }
});

// ตั้งค่า Multer อัปโหลดรูปภาพ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// ==========================================
// 🔑 1. API ระบบล็อกอิน & เซสชัน
// ==========================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = results[0];
    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.json({ message: 'เข้าสู่ระบบสำเร็จ', user: req.session.user });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'ออกจากระบบเรียบร้อย' });
});

// ==========================================
// 📝 2. API สำหรับผู้แจ้งงาน (พนักงานทั่วไป)
// ==========================================
app.post('/api/requests', upload.single('before_image'), (req, res) => {
  const { reporter_name, department, location, job_type, title, description } = req.body;
  const before_image = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `INSERT INTO kaizen_requests (reporter_name, department, location, job_type, title, description, before_image, status, is_urgent) 
               VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending_Approval', 0)`;
  
  db.query(sql, [reporter_name, department, location, job_type || null, title, description, before_image], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'บันทึกการแจ้งงานสำเร็จ!', id: result.insertId });
  });
});

// 📌 [แก้ไขแล้ว] ดึงข้อมูลโดยเรียงลำดับจาก งานด่วน (is_urgent = 1) ขึ้นก่อน แล้วตามด้วย ID ล่าสุด
app.get('/api/requests', (req, res) => {
  const sql = 'SELECT * FROM kaizen_requests ORDER BY is_urgent DESC, id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ==========================================
// 🛡️ 3. API สำหรับ Admin (หัวหน้าอนุมัติงาน)
// ==========================================

// ==========================================
// 🛡️ API สำหรับ Admin (อนุมัติ / ปฏิเสธงาน)
// ==========================================

// 📌 1. อนุมัติงาน (Approve) - รองรับงานด่วน (is_urgent)
app.post('/api/requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const { admin_comment, admin_note, is_urgent } = req.body;

  // รองรับชื่อฟิลด์หมายเหตุทั้ง admin_comment หรือ admin_note
  const comment = admin_comment || admin_note || null;
  // แปลงค่า is_urgent ให้เป็น 1 หรือ 0 ก่อนลง MySQL
  const urgentValue = (is_urgent === true || is_urgent === 1 || is_urgent === 'true') ? 1 : 0;

  const sql = `UPDATE kaizen_requests SET status = 'Approved', admin_comment = ?, is_urgent = ? WHERE id = ?`;
  
  db.query(sql, [comment, urgentValue, id], (err, result) => {
    if (err) {
      console.error('Error in approve API:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'อนุมัติงานเรียบร้อย!', is_urgent: urgentValue });
  });
});

// 📌 2. ปฏิเสธงาน (Reject)
app.post('/api/requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { admin_comment, admin_note } = req.body;

  const comment = admin_comment || admin_note || null;

  const sql = `UPDATE kaizen_requests SET status = 'Rejected', admin_comment = ? WHERE id = ?`;
  
  db.query(sql, [comment, id], (err, result) => {
    if (err) {
      console.error('Error in reject API:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'ปฏิเสธคำขอ Kaizen เรียบร้อยแล้ว' });
  });
});
// ==========================================
// 🛠️ 4. API สำหรับ Kaizen Shop (ดูงานตาม ID & ปิดงาน)
// ==========================================

// 📌 API ดึงข้อมูลงานรายชิ้นตาม ID (สำหรับหน้า shop-detail.html)
app.get('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM kaizen_requests WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลงานนี้' });
    }
    res.json(results[0]); // ส่งกลับเฉพาะ Object งานนั้นๆ
  });
});

// 📌 API สำหรับ Kaizen Shop กดปิดงาน (Completed)
app.post('/api/requests/:id/complete', upload.single('after_image'), (req, res) => {
  const requestId = req.params.id;
  const { action_details, action_date, operator_name } = req.body;
  const after_image = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    UPDATE kaizen_requests 
    SET status = 'Completed', 
        action_details = ?, 
        action_date = ?, 
        operator_name = ?, 
        after_image = COALESCE(?, after_image)
    WHERE id = ?
  `;

  db.query(sql, [action_details, action_date, operator_name, after_image, requestId], (err, result) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'ปิดงาน (Completed) สำเร็จแล้ว!' });
  });
});
// 💡 API สำหรับสั่งลบงานที่ปิดแล้วย้อนหลังเกิน 1 เดือน
app.delete('/api/admin/clean-closed-jobs', (req, res) => {
    const sql = `
        DELETE FROM kaizen_requests 
        WHERE status IN ('ปิดงานแล้ว', 'CLOSED_FOREMAN') 
          AND created_at < NOW() - INTERVAL 1 MONTH
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('❌ Error deleting old jobs:', err);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        }
        
        console.log(`🧹 Deleted ${result.affectedRows} closed jobs.`);
        res.json({ 
            success: true, 
            message: `ลบข้อมูลงานที่ปิดแล้วเกิน 1 เดือน เรียบร้อยแล้ว (${result.affectedRows} รายการ)` 
        });
    });
});

// 1. สั่งให้ Express อ่านไฟล์ static (HTML, CSS, รูปภาพ) จากโฟลเดอร์หลัก
app.use(express.static(__dirname));

// 2. ถ้ามีคนกดเข้า URL หน้าแรกเปล่าๆ ให้ส่งไปที่หน้า index.html (หรือ login.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});
// =========================================================
// 💡 API สำหรับสร้างหน้า PDF สำรองข้อมูลงานที่ปิดแล้ว
// =========================================================
app.get('/api/admin/closed-jobs-pdf', (req, res) => {
    const sql = `
        SELECT * FROM kaizen_requests 
        WHERE status IN ('ปิดงานแล้ว', 'CLOSED_FOREMAN', 'อนุมัติแล้ว') 
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล');
        }

        // สร้างหน้า HTML รายงานสำหรับสั่งพิมพ์/บันทึก PDF
        let html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>รายงานสำรองข้อมูล Kaizen งานที่ปิดแล้ว</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Prompt', sans-serif; padding: 20px; color: #1e293b; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h2 { margin: 0; color: #0f172a; }
                .header p { margin: 5px 0; color: #64748b; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; text-align: left; }
                th { background-color: #f1f5f9; color: #334155; font-weight: 600; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .badge-success { color: #16a34a; font-weight: 600; }
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="text-align: right; margin-bottom: 15px;">
                <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-family: 'Prompt';">
                    🖨️ บันทึกเป็น PDF / พิมพ์
                </button>
            </div>
            
            <div class="header">
                <h2>📋 รายงานสำรองข้อมูล Kaizen (งานที่เสร็จแล้ว)</h2>
                <p>พิมพ์เมื่อวันที่: ${new Date().toLocaleDateString('th-TH')}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>รหัสงาน</th>
                        <th>ชื่อผู้แจ้ง</th>
                        <th>แผนก</th>
                        <th>พื้นที่/เครื่องจักร</th>
                        <th>ประเภทงาน</th>
                        <th>สถานะ</th>
                        <th>วันที่แจ้งงาน</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (!results || results.length === 0) {
            html += `<tr><td colspan="7" style="text-align:center;">ไม่พบข้อมูลงานที่ปิดแล้วในระบบ</td></tr>`;
        } else {
            results.forEach(row => {
                const dateStr = row.created_at ? new Date(row.created_at).toLocaleDateString('th-TH') : '-';
                html += `
                    <tr>
                        <td><b>#KR-${row.id.toString().padStart(4, '0')}</b></td>
                        <td>${row.reporter_name || '-'}</td>
                        <td>${row.department || '-'}</td>
                        <td>${row.location || '-'}</td>
                        <td>${row.job_type || row.work_type || '-'}</td>
                        <td><span class="badge-success">${row.status}</span></td>
                        <td>${dateStr}</td>
                    </tr>
                `;
            });
        }

        html += `
                </tbody>
            </table>

            <script>
                // สั่งเปิดหน้าต่างสั่งพิมพ์ (Save PDF) อัตโนมัติเมื่อโหลดหน้าเสร็จ
                window.onload = function() {
                    setTimeout(() => { window.print(); }, 500);
                };
            </script>
        </body>
        </html>
        `;

        res.send(html);
    });
});
const PORT = process.env.PORT ||3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});