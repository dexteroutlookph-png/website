const supabase = require('./supabaseClient');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const registration = req.body;

  console.log("BODY RECEIVED:", registration);

  if (!registration?.name || !registration?.email) {
    return res.status(400).json({
      error: 'Name and email are required.'
    });
  }

  try {
    // 1. Check existing email
    const { data: existingUser, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('email', registration.email)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered.'
      });
    }

    // 2. Insert new user
    const { error: insertError } = await supabase
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

    if (insertError) throw insertError;

    return res.status(200).json({
      success: true,
      message: 'Registration successful'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message || 'Server error'
    });
  }
};