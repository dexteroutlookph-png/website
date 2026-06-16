const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const dataFile = path.join(__dirname, '..', 'registrations.json');
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

async function updatePassword(id, password) {
  if (pool) {
    const result = await pool.query('UPDATE registrations SET password=$1 WHERE id=$2', [password, id]);
    return result.rowCount > 0;
  }

  const registrations = await loadRegistrations();
  const index = registrations.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  registrations[index].password = password;
  fs.writeFileSync(dataFile, JSON.stringify(registrations, null, 2), 'utf8');
  return true;
}

module.exports = {
  loadRegistrations,
  saveRegistration,
  updatePassword,
};
