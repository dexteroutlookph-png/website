const supabase = require('./supabaseClient');

module.exports = async (req, res) => {
  const registration = req.body;

  console.log("BODY RECEIVED:", registration);

  if (!registration?.name || !registration?.email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const { data: existingUser } = await supabase
    .from('registrations')
    .select('id')
    .eq('email', registration.email)
    .maybeSingle();

  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const { error } = await supabase
    .from('registrations')
    .insert([
      {
        name: registration.name,
        email: registration.email,
        password: registration.password,
        birthday: registration.birthday,
        age: registration.age,
        contactnumber: registration.contactnumber,
        cluster: registration.cluster,
        church: registration.church,
        photo: registration.photo,
        createdat: new Date().toISOString()
      }
    ]);

  if (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};