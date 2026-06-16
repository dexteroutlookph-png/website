const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const dataFile = path.join(__dirname, 'registrations.json');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

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

app.post('/api/register', (req, res) => {
  try {
    const { name, email, password, birthday, age, contactNumber, cluster, church, photo } = req.body;

    if (!name || !email || !password || !birthday || !age || !cluster || !church) {
      return res.json({ success: false, error: 'Missing required fields' });
    }

    const registrations = loadRegistrations();
    const newRegistration = {
      id: Date.now().toString(),
      name,
      email,
      password,
      birthday,
      age,
      contactNumber,
      cluster,
      church,
      photo: photo || '',
      createdAt: new Date().toISOString()
    };

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

app.get('/api/registrations', (req, res) => {
  try {
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
