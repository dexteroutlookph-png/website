const { loadRegistrations } = require('./_data');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const registrations = await loadRegistrations();
    res.status(200).json(registrations);
  } catch (err) {
    console.error('Failed to fetch registrations:', err);
    res.status(500).json({ error: 'Failed to load registrations' });
  }
};
