// ============================================================
// LessonForge — Differentiation Helper
// Generates scaffold/core/stretch + SEN/EAL adaptations
// ============================================================

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: 'Server missing ANTHROPIC_API_KEY' }, 500);

  let input;
  try { input = JSON.parse(event.body || '{}'); }
  catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  const { baseTask, subject, level, examBoard, classNeeds } = input;
  if (!baseTask || !level) {
    return json({ error: 'Missing required: baseTask, level' }, 400);
  }

  const prompt = buildPrompt({ baseTask, subject, level, examBoard, classNeeds });

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
        max_tokens: 1800,
        temperature: 0.4,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Anthropic API error]', res.status, errText);
      return json({ error: `Claude API returned ${res.status}` }, 502);
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';
    if (!raw) return json({ error: 'Empty response from Claude' }, 502);

    return json({ differentiation: raw, usage: data.usage });
  } catch (err) {
    console.error('[function error]', err);
    return json({ error: err.message || 'Unknown server error' }, 500);
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

// ============================================================
// System prompt
// ============================================================
const SYSTEM_PROMPT = `You are LessonForge, an AI that generates PRACTICAL DIFFERENTIATION for UK and Australian teachers. You take a base task and adapt it for three ability levels plus SEN and EAL needs.

**Quality bar:**
- Adaptations must be SPECIFIC — name the actual change, not "make it easier".
- Reference the exam board's language where relevant (AQA/Pearson/OCR/WJEC/ACARA/HSC/VCE).
- British/Australian English. No American spellings.
- No AI slop: never use "leverage", "empower", "comprehensive", "robust", "unlock", "delve", "foster", "cultivate", "holistic".
- No "engaging" without naming WHAT makes it engaging.
- Write like a Head of Department sharing ideas with a colleague.

**Core principle — cognitive load:**
- Scaffold = reduce cognitive load (chunked steps, sentence starters, worked examples to copy, reduced scope)
- Core = standard cognitive demand
- Stretch = increase cognitive demand (open-endedness, cross-topic links, evaluation, original application)
- NOT: "do fewer questions" vs "do more questions". That's lazy.

**OUTPUT FORMAT — strict, in this order. Strict length limits.**

# Differentiation Brief
**Base task:** [one-line summary]
**Level:** [value]

---

## Scaffold Version (support)
**Adapted task:** [rewritten with scaffolds, 2–4 sentences max]
**Key changes:** 3 bullet points, one line each.

---

## Core Version
**Adapted task:** [the base task, essentially unchanged. 1–2 sentences]

---

## Stretch Version (challenge)
**Adapted task:** [rewritten with stretch, 2–4 sentences max]
**Key changes:** 3 bullet points, one line each.

---

## SEN Adaptations
Only include categories relevant to class context. If none specified, pick the 2 most likely for this age group. One line per adjustment.
- **[Category, e.g. Dyslexia]:** specific change 1; specific change 2.
- **[Category, e.g. ADHD]:** specific change 1; specific change 2.

## EAL Adaptations
- **Vocabulary:** pre-teach 3–4 key terms: [list them].
- **Sentence frames:** provide starters ("This shows...", "However...", "Therefore...").
- **Task modification:** [specific alternative format, e.g. "bullet points + diagram acceptable"].

## Teacher Notes
- **Common misconception:** [one specific error].
- **Quick check:** [one way to verify students understand, 1 line].

---

**Length:** 500–700 words TOTAL. Be tight. Every line must add value.`;

function buildPrompt({ baseTask, subject, level, examBoard, classNeeds }) {
  return `Generate differentiation for this task:

**Base task:**
${baseTask}

${subject ? `**Subject:** ${subject}` : ''}
**Level:** ${level}
${examBoard ? `**Exam board:** ${examBoard}` : ''}
${classNeeds ? `**Class context / specific needs:** ${classNeeds}` : ''}

Return the full differentiation brief in the format from your system prompt. Be specific — no generic suggestions.`;
}
