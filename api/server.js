const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const dataFile = path.join(__dirname, 'registrations.json');

app.use(express.json({ limit: '10mb' })); // Allows base64 photo strings

// Supabase Configuration 
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client successfully linked into production cluster.');
} else {
  console.log('Supabase env vars missing; falling back to local registrations.json file.');
}

// Local File Database Fallbacks
function loadRegistrations() {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const raw = fs.readFileSync(dataFile, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegistrations(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('File system write error:', err);
    return false;
  }
}

/* ==========================================
   1. CLEAN URL ROUTING (No .html allowed!)
   ========================================== */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/register-step2', (req, res) => res.sendFile(path.join(__dirname, 'register-step2.html')));
app.get('/homepage', (req, res) => res.sendFile(path.join(__dirname, 'homepage.html')));
app.get('/registrations', (req, res) => res.sendFile(path.join(__dirname, 'registrations.html')));
app.get('/reset-password', (req, res) => res.sendFile(path.join(__dirname, 'reset-password.html')));
app.get('/reset-password-confirm', (req, res) => res.sendFile(path.join(__dirname, 'reset-password-confirm.html')));

// Serve global styling assets (CSS, images) safely
app.use(express.static(path.join(__dirname)));

/* ==========================================
   2. SOCIAL CORE DATABASE API ENDPOINTS
   ========================================== */

// Account Login Validation Stream
app.get('/api/registrations', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('registrations').select('*').order('createdat', { ascending: false });
      if (error) throw error;
      // Handle Supabase case variations safely
      const normalized = (data || []).map(u => ({
        ...u,
        contactNumber: u.contactnumber || u.contactNumber,
        createdAt: u.createdat || u.createdAt
      }));
      return res.json(normalized);
    }
    return res.json(loadRegistrations());
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Final Registration Handler
app.post('/api/register', async (req, res) => {
  try {
    const reg = req.body;
    
    if (!reg.name || !reg.email) {
      return res.status(400).json({ success: false, error: 'Required fields missing from transmission payload.' });
    }

    const newProfile = {
      id: Date.now().toString(),
      name: reg.name,
      email: reg.email,
      password: reg.password,
      birthday: reg.birthday,
      age: reg.age,
      contactnumber: reg.contactnumber,
      cluster: reg.cluster,
      church: reg.church,
      photo: reg.photo,
      createdat: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase.from('registrations').insert([newProfile]);
      if (error) return res.status(400).json({ success: false, error: error.message });
      return res.json({ success: true });
    }

    const currentLocalDB = loadRegistrations();
    // Also save camelCase keys for local backward compatibility
    const fallbackProfile = { ...newProfile, contactNumber: reg.contactnumber, createdAt: newProfile.createdat };
    currentLocalDB.push(fallbackProfile);
    saveRegistrations(currentLocalDB);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal system compiling exception.' });
  }
});

// Thread Stream Loader
app.get('/api/posts', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('posts').select('*').order('createdat', { ascending: false });
      if (error) throw error;
      return res.json(data || []);
    }
    return res.json([]);
  } catch {
    res.json([]);
  }
});

// Thread Insertion Node
app.post('/api/posts', async (req, res) => {
  try {
    const { name, email, content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: "Content empty" });

    const postPayload = { name, email, content, createdat: new Date().toISOString() };
    
    if (supabase) {
      const { error } = await supabase.from('posts').insert([postPayload]);
      if (error) throw error;
      return res.json({ success: true });
    }
    return res.json({ success: false, error: 'Supabase unlinked.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 System pipeline running on http://localhost:${PORT}`));