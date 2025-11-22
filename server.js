
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // High limit for photos
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve React App (Production)
// Assuming 'dist' is the Vite build folder. If using CRA, change to 'build'.
app.use(express.static(path.join(__dirname, 'dist')));

// Database Connection
const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'agri',
    password: process.env.DB_PASSWORD || 'agri@5051',
    database: process.env.DB_NAME || 'agridb',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Generic Query Helper
const query = async (sql, params) => {
    const [rows] = await db.execute(sql, params);
    return rows;
};

// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (users.length > 0) {
            const u = users[0];
            res.json({
                id: u.id.toString(),
                username: u.username,
                role: u.role,
                allowedModules: u.allowedModules // JSON column automatically parsed by mysql2 usually, or check type
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// CRUD Generator
const createCrud = (table, jsonFields = []) => ({
    getAll: async (req, res) => {
        try {
            let sql = `SELECT * FROM ${table}`;
            // Simple filtering support (e.g. ?farmerId=1)
            const keys = Object.keys(req.query);
            if (keys.length > 0) {
                const conditions = keys.map(k => `${k} = ?`).join(' AND ');
                sql += ` WHERE ${conditions}`;
                const rows = await query(sql, Object.values(req.query));
                res.json(rows.map(row => parseJson(row, jsonFields)));
            } else {
                sql += ' ORDER BY id DESC';
                const rows = await query(sql);
                res.json(rows.map(row => parseJson(row, jsonFields)));
            }
        } catch (e) { res.status(500).json({ error: e.message }); }
    },
    create: async (req, res) => {
        try {
            const { id, ...data } = req.body; // Drop ID to let DB auto-increment
            // Stringify JSON fields
            jsonFields.forEach(f => {
                if (data[f]) data[f] = JSON.stringify(data[f]);
            });
            
            const keys = Object.keys(data);
            const values = Object.values(data);
            const placeholders = keys.map(() => '?').join(',');
            
            if (req.body.id && !isNaN(req.body.id) && table !== 'sales' && table !== 'expenditures') {
                // Update logic
                const setClause = keys.map(k => `${k} = ?`).join(', ');
                await query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, req.body.id]);
                res.json({ success: true });
            } else {
                // Insert logic
                await query(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`, values);
                res.json({ success: true });
            }
        } catch (e) { res.status(500).json({ error: e.message }); }
    },
    delete: async (req, res) => {
        try {
            await query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (e) { res.status(500).json({ error: e.message }); }
    }
});

const parseJson = (row, fields) => {
    fields.forEach(f => {
        if (row[f] && typeof row[f] === 'string') {
            try { row[f] = JSON.parse(row[f]); } catch(e) {}
        }
    });
    return row;
};

// Specific Routes
app.get('/api/farmers', createCrud('farmers').getAll);
app.post('/api/farmers', createCrud('farmers').create);
app.delete('/api/farmers/:id', createCrud('farmers').delete);

app.get('/api/plantations', createCrud('plantations').getAll);
app.post('/api/plantations', createCrud('plantations').create);
app.delete('/api/plantations/:id', createCrud('plantations').delete);

app.get('/api/services', createCrud('services').getAll);
app.post('/api/services/batch', async (req, res) => {
    const { records } = req.body;
    if (!records || records.length === 0) return res.json({ success: true });
    try {
        const plantationId = records[0].plantationId;
        // Clear existing for this plantation to sync
        await query('DELETE FROM services WHERE plantationId = ?', [plantationId]);
        for (const rec of records) {
            const { id, ...data } = rec;
            const keys = Object.keys(data);
            const values = Object.values(data).map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);
            const placeholders = keys.map(() => '?').join(',');
            await query(`INSERT INTO services (${keys.join(',')}) VALUES (${placeholders})`, values);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products', createCrud('products').getAll);
app.post('/api/products', createCrud('products').create);
app.delete('/api/products/:id', createCrud('products').delete);

app.get('/api/sales', createCrud('sales', ['items']).getAll);
app.post('/api/sales', createCrud('sales', ['items']).create);

app.get('/api/expenditures', createCrud('expenditures').getAll);
app.post('/api/expenditures', createCrud('expenditures').create);

app.get('/api/soil-tests', createCrud('soil_tests').getAll);
app.post('/api/soil-tests', createCrud('soil_tests').create);
app.delete('/api/soil-tests/:id', createCrud('soil_tests').delete);

app.get('/api/bycell', createCrud('bycell_doses', ['activities']).getAll);
app.post('/api/bycell', async (req, res) => {
    // Custom upsert for Bycell
    try {
        const { farmerId, ...data } = req.body;
        const activities = JSON.stringify(data.activities);
        const existing = await query('SELECT id FROM bycell_doses WHERE farmerId = ?', [farmerId]);
        
        if (existing.length > 0) {
            await query('UPDATE bycell_doses SET acres=?, remarks=?, date=?, activities=? WHERE farmerId=?', 
                [data.acres, data.remarks, data.date, activities, farmerId]);
        } else {
            await query('INSERT INTO bycell_doses (farmerId, acres, remarks, date, activities) VALUES (?, ?, ?, ?, ?)', 
                [farmerId, data.acres, data.remarks, data.date, activities]);
        }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});
app.delete('/api/bycell/:id', createCrud('bycell_doses').delete);

// Catch-all for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
