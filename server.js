const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const dataFile = path.join(__dirname, 'registrations.json');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// FIXED: Now checks both variable names commonly used in Render dashboards
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client configured successfully.');
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

    // FIXED: Formatted keys to be strictly lowercase (contactnumber and createdat)
    // to match PostgreSQL/Supabase table column specifications exactly.
    const newRegistration = {
      id: Date.now().toString(),
      name,
      email,
      password,
      birthday,
      age,
      contactnumber: contactNumber, 
      cluster,
      church,
      photo,
      createdat: new Date().toISOString() 
    };

    if (supabase) {
      const { error } = await supabase.from('registrations').insert([newRegistration]);
      if (error) {
        console.error('Supabase insert error details:', error);
        return res.json({ success: false, error: error.message || 'Failed to save registration to database' });
      }
      return res.json({ success: true, message: 'Registration saved to Supabase' });
    }

    // Fallback: write to local JSON file
    const registrations = loadRegistrations();
    registrations.push(newRegistration);
    const saved = saveRegistrations(registrations);

    if (saved) {
      return res.json({ success: true, message: 'Registration saved locally' });
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
      // FIXED: Modified sorting filter target to check the correct lowercase column 'createdat'
      const { data, error } = await supabase.from('registrations').select('*').order('createdat', { ascending: false });
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
  console.log(`Server running on port ${PORT}`);
});