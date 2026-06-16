const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const dataFile = path.join(__dirname, 'registrations.json');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Supabase client (optional). Do NOT commit keys to the repo. Set these as environment variables.
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client configured.');
} else {
  console.log('Supabase not configured; falling back to local JSON file.');
}

function loadRegistrations() {
  try {
    if (!fs.existsSync(dataFile)) {
      return [];
    }
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRegistrations(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving registrations:', err);
    return false;
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, birthday, age, contactNumber, cluster, church, photo } = req.body;

    if (!name || !email || !password || !birthday || !age || !cluster || !church) {
      return res.json({ success: false, error: 'Missing required fields' });
    }

    const newRegistration = {
      id: Date.now().toString(),
      name,
      email,
      password,
      birthday,
      age: Number(age) || null,
      contactNumber,
      cluster,
      church,
      photo: photo || '',
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      // Write to Supabase (use service_role key on server)
      const { data, error } = await supabase.from('registrations').insert([newRegistration]);
      if (error) {
        console.error('Supabase insert error:', error);
        return res.json({ success: false, error: 'Failed to save registration to database' });
      }
      return res.json({ success: true, message: 'Registration saved to Supabase' });
    }

    // Fallback: write to local JSON file
    const registrations = loadRegistrations();
    registrations.push(newRegistration);
    const saved = saveRegistrations(registrations);

    if (saved) {
      return res.json({ success: true, message: 'Registration saved successfully' });
    } else {
      return res.json({ success: false, error: 'Failed to save registration' });
    }
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.json({ success: false, error: 'Server error' });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('registrations').select('*').order('createdAt', { ascending: false });
      if (error) {
        console.error('Supabase select error:', error);
        return res.json([]);
      }
      return res.json(data || []);
    }

    const registrations = loadRegistrations();
    res.json(registrations);
  } catch (err) {
    console.error('Error in /api/registrations:', err);
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
