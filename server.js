const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const dataFile = path.join(__dirname, 'registrations.json');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Initialize table
  (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS registrations (
          id TEXT PRIMARY KEY,
          name TEXT,
          birthday TEXT,
          age TEXT,
          email TEXT,
          contactNumber TEXT,
          password TEXT,
          photo TEXT,
          cluster TEXT,
          church TEXT,
          createdAt TIMESTAMP
        )
      `);
      console.log('Postgres connected and table ensured');
    } catch (err) {
      console.error('Failed to initialize Postgres table:', err);
    }
  })();
}

async function loadRegistrations() {
  if (pool) {
    const res = await pool.query('SELECT * FROM registrations ORDER BY createdAt DESC');
    return res.rows;
  }

  try {
    if (!fs.existsSync(dataFile)) {
      return [];
    }
    const raw = fs.readFileSync(dataFile, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to load registrations:', error);
    return [];
  }
}

async function saveRegistration(registration) {
  if (pool) {
    const query = `INSERT INTO registrations(id, name, birthday, age, email, contactNumber, password, photo, cluster, church, createdAt)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;
    const values = [
      registration.id,
      registration.name,
      registration.birthday,
      registration.age,
      registration.email,
      registration.contactNumber,
      registration.password,
      registration.photo,
      registration.cluster,
      registration.church,
      registration.createdAt,
    ];
    await pool.query(query, values);
    return;
  }

  const registrations = await loadRegistrations();
  registrations.push(registration);
  fs.writeFileSync(dataFile, JSON.stringify(registrations, null, 2), 'utf8');
}

app.get('/api/registrations', async (req, res) => {
  try {
    const regs = await loadRegistrations();
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load registrations' });
  }
});

app.post('/api/register', async (req, res) => {
  const registration = req.body;
  if (!registration || !registration.name || !registration.email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newReg = {
    id: Date.now().toString(),
    ...registration,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveRegistration(newReg);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save registration:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: 'Reset id and new password are required.' });
  }

  if (pool) {
    try {
      const result = await pool.query('UPDATE registrations SET password=$1 WHERE id=$2', [password, id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Registration not found.' });
      return res.json({ success: true });
    } catch (err) {
      console.error('Failed to update password in Postgres:', err);
      return res.status(500).json({ error: 'Failed to update password' });
    }
  }

  try {
    const registrations = loadRegistrations();
    const index = registrations.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Registration not found.' });
    }
    registrations[index].password = password;
    fs.writeFileSync(dataFile, JSON.stringify(registrations, null, 2), 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
