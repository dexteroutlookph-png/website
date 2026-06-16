const { saveRegistration, loadRegistrations } = require('./_data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const registration = req.body;
  if (!registration || !registration.name || !registration.email) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  try {
    const existing = await loadRegistrations();
    if (existing.some((entry) => entry.email === registration.email)) {
      res.status(400).json({ error: 'An account with that email already exists.' });
      return;
    }

    const newReg = {
      id: Date.now().toString(),
      ...registration,
      createdAt: new Date().toISOString(),
    };

    await saveRegistration(newReg);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to save registration:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
};
