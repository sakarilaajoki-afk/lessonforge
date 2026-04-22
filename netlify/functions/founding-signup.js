// ============================================================
// LessonForge — Founding Teacher signup endpoint
// Stores leads in Netlify Blobs. No auth, no DB setup needed.
// ============================================================

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  const { name, email, school, subject, level, country, why } = input;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, 400);
  }
  if (!name) return json({ error: 'Name required' }, 400);

  const record = {
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 120).toLowerCase(),
    school: String(school || '').slice(0, 120),
    subject: String(subject || '').slice(0, 80),
    level: String(level || '').slice(0, 40),
    country: String(country || '').slice(0, 40),
    why: String(why || '').slice(0, 500),
    ua: String(event.headers['user-agent'] || '').slice(0, 200),
    ip: event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || '',
    ts: new Date().toISOString(),
  };

  try {
    // Store in Netlify Blobs — lightweight, no DB setup
    const store = getStore({ name: 'founding-teachers' });
    const key = `${Date.now()}-${record.email.replace(/[^a-z0-9]/g, '_')}`;
    await store.setJSON(key, record);

    // Also log for easy export via Netlify dashboard
    console.log('[founding-signup]', JSON.stringify(record));

    return json({ ok: true, message: 'You are on the list. Sakari will reach out within 2 working days.' });
  } catch (err) {
    console.error('[founding-signup error]', err);
    // Even if Blob fails, log + return ok so user gets confirmation
    // (we can recover from Netlify function logs)
    console.log('[founding-signup-fallback]', JSON.stringify(record));
    return json({ ok: true, message: 'You are on the list. Sakari will reach out within 2 working days.' });
  }
};

function json(obj, status = 200) {
  return { statusCode: status, headers: corsHeaders(), body: JSON.stringify(obj) };
}
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}
