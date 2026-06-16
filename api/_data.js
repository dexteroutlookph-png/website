const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const dataFile = path.join(__dirname, '..', 'registrations.json');
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase API Client module initialized.');
} else {
  console.log('Supabase API client unconfigured; localized storage active.');
}

async function loadRegistrations() {
  if (supabase) {
    // FIXED: Adjusted column identifier order filter target to match lowercase table properties
    const { data, error } = await supabase.from('registrations').select('*').order('createdat', { ascending: false });
    if (error) {
      console.error('Supabase loadRegistrations error:', error);
      return [];
    }
    return data || [];
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
  if (supabase) {
    const { error } = await supabase.from('registrations').insert([registration]);
    if (error) {
      console.error('Supabase saveRegistration error:', error);
      throw error;
    }
    return;
  }

  const registrations = await loadRegistrations();
  registrations.push(registration);
  fs.writeFileSync(dataFile, JSON.stringify(registrations, null, 2), 'utf8');
}

async function updatePassword(id, password) {
  if (supabase) {
    const { data, error } = await supabase.from('registrations').update({ password }).eq('id', id);
    if (error) {
      console.error('Supabase updatePassword error:', error);
      return false;
    }
    return Array.isArray(data) ? data.length > 0 : !!data;
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
  updatePassword
};