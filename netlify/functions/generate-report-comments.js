// ============================================================
// LessonForge — Report Card Comments Generator
// Netlify Function — proxies to Claude API
// ============================================================
// Generates 3 tonal variants (formal, warm, encouraging) for ONE student.
// Client makes parallel calls for bulk processing (30 students ~ 15s total).

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Server missing ANTHROPIC_API_KEY' }, 500);
  }

  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch (e) { return jsonResponse({ error: 'Invalid JSON' }, 400); }

  const {
    name,         // "Sarah Thompson"
    notes,        // "Excellent on essays, weak on timed exams, helpful in group work"
    subject,      // "A-Level Business"
    level,        // "Year 12"
    period,       // "Autumn 2026"
    grade,        // "B" (optional)
  } = input;

  if (!name || !notes) {
    return jsonResponse({ error: 'Missing required fields: name, notes' }, 400);
  }

  const prompt = buildPrompt({ name, notes, subject, level, period, grade });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        temperature: 0.6,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Anthropic API error]', res.status, errText);
      return jsonResponse({ error: `Claude API returned ${res.status}` }, 502);
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';

    if (!raw) {
      return jsonResponse({ error: 'Empty response from Claude' }, 502);
    }

    // Parse the 3 tonal variants from raw output
    const parsed = parseComments(raw);
    if (!parsed.formal && !parsed.warm && !parsed.encouraging) {
      // Fallback: return raw text if parsing fails
      return jsonResponse({
        name,
        comments: { formal: raw, warm: raw, encouraging: raw },
        raw,
      });
    }

    return jsonResponse({
      name,
      comments: parsed,
      usage: data.usage,
    });
  } catch (err) {
    console.error('[function error]', err);
    return jsonResponse({ error: err.message || 'Unknown server error' }, 500);
  }
};

function jsonResponse(obj, status = 200) {
  return {
    statusCode: status,
    headers: corsHeaders(),
    body: JSON.stringify(obj),
  };
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// Parse Claude's output into { formal, warm, encouraging } strings
function parseComments(raw) {
  // Expected format:
  // FORMAL: <text>
  // WARM: <text>
  // ENCOURAGING: <text>
  const patterns = {
    formal: /(?:^|\n)\s*(?:\*\*)?FORMAL(?:\*\*)?\s*:?\s*\n?([\s\S]*?)(?=\n\s*(?:\*\*)?(?:WARM|ENCOURAGING)(?:\*\*)?|$)/i,
    warm: /(?:^|\n)\s*(?:\*\*)?WARM(?:\*\*)?\s*:?\s*\n?([\s\S]*?)(?=\n\s*(?:\*\*)?(?:ENCOURAGING|FORMAL)(?:\*\*)?|$)/i,
    encouraging: /(?:^|\n)\s*(?:\*\*)?ENCOURAGING(?:\*\*)?\s*:?\s*\n?([\s\S]*?)(?=\n\s*(?:\*\*)?(?:FORMAL|WARM)(?:\*\*)?|$)/i,
  };
  const out = { formal: '', warm: '', encouraging: '' };
  Object.keys(patterns).forEach((k) => {
    const m = raw.match(patterns[k]);
    if (m && m[1]) {
      out[k] = m[1].trim().replace(/^["']|["']$/g, ''); // strip surrounding quotes
    }
  });
  return out;
}

// ============================================================
// System prompt — defines the quality bar
// ============================================================
const SYSTEM_PROMPT = `You are LessonForge, an AI assistant writing **report card comments** for UK and Australian teachers.

Your job: generate THREE tonal variants of the same comment for one student. The teacher will pick/edit their favourite.

**Tone definitions (strict):**

1. **FORMAL** — neutral, professional, SLT-appropriate. Could appear on an official report to parents. Third person acceptable. No effusive praise, no casual language. Focus on evidence + next steps.

2. **WARM** — still professional but more human. Addresses the student's character. Uses "you" or second-person where natural. Acknowledges effort/attitude, not just output.

3. **ENCOURAGING** — growth-focused. Leads with progress. Tactful with weaknesses (framed as "next step", not "weakness"). Ends with forward-looking statement.

**Hard rules for ALL three tones:**
- British English (no American spellings).
- 2–4 sentences each. Never over 80 words.
- **Must reference the specific notes given.** Don't write generic comments.
- Never use: "truly", "journey", "bright future", "unique talents", "demonstrated a strong understanding", "showcases", "unlocks potential", "empower", "leverage", "comprehensive".
- No emojis. No exclamation marks.
- If grade is provided, work it in subtly — don't just restate it.
- Do NOT repeat the student's full name more than once per comment.

**Output format (exactly this, no extra commentary):**

FORMAL: <2-4 sentences>

WARM: <2-4 sentences>

ENCOURAGING: <2-4 sentences>

No preamble. No "Here are the comments". No summary. Just FORMAL/WARM/ENCOURAGING blocks.`;

function buildPrompt({ name, notes, subject, level, period, grade }) {
  const meta = [
    subject ? `Subject: ${subject}` : null,
    level ? `Level: ${level}` : null,
    period ? `Reporting period: ${period}` : null,
    grade ? `Grade: ${grade}` : null,
  ].filter(Boolean).join('\n');

  return `Write three report card comments for this student.

Student: ${name}
${meta}

Teacher's notes on this student:
${notes}

Return FORMAL, WARM, and ENCOURAGING variants following the rules in your system prompt.`;
}
