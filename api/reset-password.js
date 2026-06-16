const { loadRegistrations, updatePassword } = require('./_data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, password } = req.body;
  if (!id || !password) {
    res.status(400).json({ error: 'Reset id and new password are required.' });
    return;
  }

  try {
    const success = await updatePassword(id, password);
    if (!success) {
      res.status(404).json({ error: 'Registration not found.' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to update password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
